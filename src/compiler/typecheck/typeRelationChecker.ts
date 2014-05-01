///<reference path='..\references.ts' /> 

module TypeScript {
    class TypeRelationChecker {
        private identicalCache = BitMatrix.getBitMatrix(/*allowUndefined*/ true);
        private subtypeCache = BitMatrix.getBitMatrix(/*allowUndefined*/ true);
        private assignableCache = BitMatrix.getBitMatrix(/*allowUndefined*/ true);

        private getNamedPropertySymbolOfAugmentedType: any;
        private getApparentType: any;
        private isAnyOrEquivalent: any;
        private instantiateSignatureToAny: any;
        private cachedFunctionInterfaceType: any;
        private resolveDeclaredSymbol: any;
        private getEnclosingSymbolForAST: any;
        private getBothKindsOfIndexSignaturesIncludingAugmentedType: any;
        private getBothKindsOfIndexSignaturesExcludingAugmentedType: any;
        
        constructor(private resolver: PullTypeResolver, private semanticInfoChain: SemanticInfoChain) { }

        private typesAreIdenticalInEnclosingTypes(t1: PullTypeSymbol, t2: PullTypeSymbol, context: PullTypeResolutionContext) {
            t1 = this.getSymbolForRelationshipCheck(t1);
            t2 = this.getSymbolForRelationshipCheck(t2);

            if (t1 === t2) {
                return true;
            }

            if (t1 && t2) {
                // Section 3.8.7 - Recursive Types
                //  When comparing two types S and T for identity(section 3.8.2), subtype(section 3.8.3), and assignability(section 3.8.4) relationships, 
                //  if either type originates in an infinitely expanding type reference, S and T are not compared by the rules in the preceding sections.Instead, for the relationship to be considered true,
                //  -	S and T must both be type references to the same named type, and
                //  -	the relationship in question must be true for each corresponding pair of type arguments in the type argument lists of S and T.

                if (context.oneOfClassificationsIsInfinitelyExpanding()) {
                    return this.infinitelyExpandingTypesAreIdentical(t1, t2, context);
                }
            }

            return this.typesAreIdentical(t1, t2, context);
        }

        private typesAreIdenticalWithNewEnclosingTypes(t1: PullTypeSymbol, t2: PullTypeSymbol, context: PullTypeResolutionContext) {
            var enclosingTypeWalkerStates = context.resetEnclosingTypeWalkerStates();
            var areTypesIdentical = this.typesAreIdentical(t1, t2, context);
            context.setEnclosingTypeWalkerStates(enclosingTypeWalkerStates);
            return areTypesIdentical;
        }

        public typesAreIdentical(t1: PullTypeSymbol, t2: PullTypeSymbol, context: PullTypeResolutionContext) {
            t1 = this.getSymbolForRelationshipCheck(t1);
            t2 = this.getSymbolForRelationshipCheck(t2);

            // This clause will cover both primitive types (since the type objects are shared),
            // as well as shared brands
            if (t1 === t2) {
                return true;
            }

            if (!t1 || !t2) {
                return false;
            }

            // identity check for enums is 't1 === t2'
            // if it returns false and one of elements is enum - they are not identical
            if (hasFlag(t1.kind, PullElementKind.Enum) || hasFlag(t2.kind, PullElementKind.Enum)) {
                return false;
            }

            if (t1.isPrimitive() && (<PullPrimitiveTypeSymbol>t1).isStringConstant() && t2.isPrimitive() && (<PullPrimitiveTypeSymbol>t2).isStringConstant()) {
                // Both are string constants
                return TypeScript.stripStartAndEndQuotes(t1.name) === TypeScript.stripStartAndEndQuotes(t2.name);
            }

            if (t1.isPrimitive() || t2.isPrimitive()) {
                return false;
            }

            if (t1.isError() && t2.isError()) {
                return true;
            }

            var isIdentical = this.identicalCache.valueAt(t1.pullSymbolID, t2.pullSymbolID);
            if (isIdentical != undefined) {
                return isIdentical;
            }

            if (t1.isTypeParameter() !== t2.isTypeParameter()) {
                return false;
            }
            else if (t1.isTypeParameter()) {

                // We compare parent declarations instead of container symbols because type parameter symbols are shared
                // accross overload groups
                var t1ParentDeclaration = t1.getDeclarations()[0].getParentDecl();
                var t2ParentDeclaration = t2.getDeclarations()[0].getParentDecl();

                if (t1ParentDeclaration === t2ParentDeclaration) {
                    return this.symbolsShareDeclaration(t1, t2);
                }
                else {
                    return false;
                }
            }

            if (t1.isPrimitive() !== t2.isPrimitive()) {
                return false;
            }

            this.identicalCache.setValueAt(t1.pullSymbolID, t2.pullSymbolID, true);
            var statesWhenStartedWalkingTypes = context.startWalkingTypes(t1, t2);
            isIdentical = this.typesAreIdenticalWorker(t1, t2, context);
            context.endWalkingTypes(statesWhenStartedWalkingTypes);
            this.identicalCache.setValueAt(t1.pullSymbolID, t2.pullSymbolID, isIdentical);

            return isIdentical;
        }

        private typesAreIdenticalWorker(t1: PullTypeSymbol, t2: PullTypeSymbol, context: PullTypeResolutionContext) {
            if (t1.getIsSpecialized() && t2.getIsSpecialized()) {
                // If types are specialized from same root symbol, comparing type arguments should be enough
                if (TypeScript.PullHelpers.getRootType(t1) === TypeScript.PullHelpers.getRootType(t2)
                    && PullHelpers.getRootType(t1).isNamedTypeSymbol()) {
                    var t1TypeArguments = t1.getTypeArguments();
                    var t2TypeArguments = t2.getTypeArguments();

                    if (t1TypeArguments && t2TypeArguments) {
                        for (var i = 0; i < t1TypeArguments.length; i++) {
                            // The type arguments are not enclosed in current enclosing contexts
                            if (!this.typesAreIdenticalWithNewEnclosingTypes(t1TypeArguments[i], t2TypeArguments[i], context)) {
                                return false;
                            }
                        }
                    }

                    return true;
                }
            }

            // properties are identical in name, optionality, and type
            if (t1.hasMembers() && t2.hasMembers()) {
                var t1Members = t1.getAllMembers(PullElementKind.SomeValue, GetAllMembersVisiblity.all);
                var t2Members = t2.getAllMembers(PullElementKind.SomeValue, GetAllMembersVisiblity.all);

                if (t1Members.length !== t2Members.length) {
                    return false;
                }

                var t1MemberSymbol: PullSymbol = null;
                var t2MemberSymbol: PullSymbol = null;

                var t1MemberType: PullTypeSymbol = null;
                var t2MemberType: PullTypeSymbol = null;

                for (var iMember = 0; iMember < t1Members.length; iMember++) {
                    // Spec section 3.8.2:
                    // Two members are considered identical when
                    // they are public properties with identical names, optionality, and types,
                    // they are private properties originating in the same declaration and having identical types
                    t1MemberSymbol = t1Members[iMember];
                    t2MemberSymbol = t2.getNamedPropertySymbol(t1MemberSymbol.name, PullElementKind.SomeValue, this.resolver);

                    if (!this.propertiesAreIdentical(t1MemberSymbol, t2MemberSymbol, context)) {
                        return false;
                    }
                }
            }
            else if (t1.hasMembers() || t2.hasMembers()) {
                return false;
            }

            var t1CallSigs = t1.getCallSignatures();
            var t2CallSigs = t2.getCallSignatures();

            var t1ConstructSigs = t1.getConstructSignatures();
            var t2ConstructSigs = t2.getConstructSignatures();

            var t1IndexSigs = t1.getIndexSignatures();
            var t2IndexSigs = t2.getIndexSignatures();

            if (!this.signatureGroupsAreIdentical(t1CallSigs, t2CallSigs, context)) {
                return false;
            }

            if (!this.signatureGroupsAreIdentical(t1ConstructSigs, t2ConstructSigs, context)) {
                return false;
            }

            if (!this.signatureGroupsAreIdentical(t1IndexSigs, t2IndexSigs, context)) {
                return false;
            }

            return true;
        }

        private propertiesAreIdentical(propertySymbol1: PullSymbol, propertySymbol2: PullSymbol, context: PullTypeResolutionContext): boolean {
            // Spec section 3.8.2:
            // Two members are considered identical when
            // they are public properties with identical names, optionality, and types,
            // they are private properties originating in the same declaration and having identical types
            if (!propertySymbol2 || (propertySymbol1.isOptional !== propertySymbol2.isOptional)) {
                return false;
            }

            var t1MemberSymbolIsPrivate = propertySymbol1.anyDeclHasFlag(PullElementFlags.Private);
            var t2MemberSymbolIsPrivate = propertySymbol2.anyDeclHasFlag(PullElementFlags.Private);

            // if visibility doesn't match, the types don't match
            if (t1MemberSymbolIsPrivate !== t2MemberSymbolIsPrivate) {
                return false;
            }
            // if both are private members, test to ensure that they share a declaration
            else if (t2MemberSymbolIsPrivate && t1MemberSymbolIsPrivate) {
                var t1MemberSymbolDecl = propertySymbol1.getDeclarations()[0];
                var sourceDecl = propertySymbol2.getDeclarations()[0];
                if (t1MemberSymbolDecl !== sourceDecl) {
                    return false;
                }
            }

            var t1MemberType = propertySymbol1.type;
            var t2MemberType = propertySymbol2.type;

            context.walkMemberTypes(propertySymbol1.name);
            var areMemberTypesIdentical = this.typesAreIdenticalInEnclosingTypes(t1MemberType, t2MemberType, context);
            context.postWalkMemberTypes();
            return areMemberTypesIdentical;
        }

        private propertiesAreIdenticalWithNewEnclosingTypes(
            type1: PullTypeSymbol,
            type2: PullTypeSymbol,
            property1: PullSymbol,
            property2: PullSymbol,
            context: PullTypeResolutionContext): boolean {
            var enclosingTypeWalkerStates = context.setEnclosingTypeForSymbols(type1, type2);
            var arePropertiesIdentical = this.propertiesAreIdentical(property1, property2, context);
            context.setEnclosingTypeWalkerStates(enclosingTypeWalkerStates);
            return arePropertiesIdentical;
        }

        private signatureGroupsAreIdentical(sg1: PullSignatureSymbol[], sg2: PullSignatureSymbol[],
            context: PullTypeResolutionContext) {

            // covers the null case
            if (sg1 === sg2) {
                return true;
            }

            // covers the mixed-null case
            if (!sg1 || !sg2) {
                return false;
            }

            if (sg1.length !== sg2.length) {
                return false;
            }

            // Signatures must be in the same order for the signature groups to be identical.
            // The spec does not say this yet. It is vague about this comparison:
            // November 18th, 2013: Section 3.8.2:
            // Two members are considered identical when:
            // ...
            //    they are identical call signatures,
            //    they are identical construct signatures, or
            //    they are index signatures of identical kind with identical types.
            for (var i = 0; i < sg1.length; i++) {
                context.walkSignatures(sg1[i].kind, i);
                var areSignaturesIdentical = this.signaturesAreIdentical(sg1[i], sg2[i], context, /*includeReturnTypes*/ true);
                context.postWalkSignatures();
                if (!areSignaturesIdentical) {
                    return false;
                }
            }

            return true;
        }

        private constraintsAreIdentical(tp1: PullTypeParameterSymbol[], tp2: PullTypeParameterSymbol[],
            context: PullTypeResolutionContext) {
            Debug.assert(tp1 && tp2);
            if (tp1.length !== tp2.length) {
                return false;
            }

            for (var i = 0; i < tp1.length; i++) {
                // Verify the pairwise identity of the constraints
                context.walkTypeParameterConstraints(i);
                var areConstraintsIdentical = this.typesAreIdentical(tp1[i].getConstraint(), tp2[i].getConstraint(), context);
                context.postWalkTypeParameterConstraints();
                if (!areConstraintsIdentical) {
                    return false;
                }
            }

            return true;
        }

        private setTypeParameterIdentity(tp1: PullTypeParameterSymbol[], tp2: PullTypeParameterSymbol[], val: boolean) {
            if (tp1 && tp2 && tp1.length === tp2.length) {
                for (var i = 0; i < tp1.length; i++) {
                    this.identicalCache.setValueAt(tp1[i].pullSymbolID, tp2[i].pullSymbolID, val);
                }
            }
        }

        public signaturesAreIdenticalWithNewEnclosingTypes(s1: PullSignatureSymbol, s2: PullSignatureSymbol, context: PullTypeResolutionContext,
            includingReturnType = true) {

            // If signatures are identitical is called directally we need to get the enclosingType and 
            // current symbol correctly
            var enclosingTypeWalkerStates = context.setEnclosingTypeForSymbols(s1, s2);
            var areSignaturesIdentical = this.signaturesAreIdentical(s1, s2, context, includingReturnType);
            context.setEnclosingTypeWalkerStates(enclosingTypeWalkerStates);
            return areSignaturesIdentical;
        }

        private signaturesAreIdentical(s1: PullSignatureSymbol, s2: PullSignatureSymbol, context: PullTypeResolutionContext,
            includingReturnType = true) {
            if (s1 === s2) {
                return true;
            }

            var signaturesIdentical = this.identicalCache.valueAt(s1.pullSymbolID, s2.pullSymbolID);
            if (signaturesIdentical || // If signatures are identical they are identical whether we check return type or not
                (signaturesIdentical != undefined && includingReturnType)) { // If we are checking signature with return type, we can use cached false value
                return signaturesIdentical;
            }

            var oldValue = signaturesIdentical;
            this.identicalCache.setValueAt(s1.pullSymbolID, s2.pullSymbolID, true);

            signaturesIdentical = this.signaturesAreIdenticalWorker(s1, s2, context, includingReturnType);

            if (includingReturnType) {
                // Can cache the result
                this.identicalCache.setValueAt(s1.pullSymbolID, s2.pullSymbolID, signaturesIdentical);
            }
            else {
                // Not checking return type, revert the result
                this.identicalCache.setValueAt(s1.pullSymbolID, s2.pullSymbolID, oldValue);
            }

            return signaturesIdentical;
        }

        public signaturesAreIdenticalWorker(s1: PullSignatureSymbol, s2: PullSignatureSymbol, context: PullTypeResolutionContext,
            includingReturnType = true) {
            if (s1.hasVarArgs !== s2.hasVarArgs) {
                return false;
            }

            if (s1.nonOptionalParamCount !== s2.nonOptionalParamCount) {
                return false;
            }

            if (s1.parameters.length !== s2.parameters.length) {
                return false;
            }

            // The spec says to assume type parameters are pairwise identical in order to compare
            // the signatures. We skip that here because we are about to instantiate the signatures
            // to any to avoid a generative recursion when comparing generic signatures.
            return this.signatureConstraints_Parameters_AndReturnTypesAreIdenticalAfterInstantiationToAny(s1, s2, context, includingReturnType);
        }

        private signatureConstraints_Parameters_AndReturnTypesAreIdenticalAfterInstantiationToAny(s1: PullSignatureSymbol, s2: PullSignatureSymbol,
            context: PullTypeResolutionContext, includingReturnType?: boolean) {
            if (!this.constraintsAreIdentical(s1.getTypeParameters(), s2.getTypeParameters(), context)) {
                return false;
            }

            // This is not in the spec yet, but we need to instantiate signatures to any before
            // comparing them to avoid a generative recursion. Considering them pairwise
            // identical is not enough to achieve this. Consider the following example:
            //
            // interface IPromise<T> {
            //     then<U>(callback: (x: T) => IPromise<U>): IPromise<U>;
            // }
            // interface Promise<T> {
            //     then<U>(callback: (x: T) => Promise<U>): Promise<U>;
            // }
            // var x: IPromise<string>;
            // var x: Promise<string>;
            //
            // Comparing IPromise<U> and Promise<U> would lead to an infinite expansion, since
            // each instantiation introduces a new U. Therefore, the U must be erased to any.
            s1 = this.instantiateSignatureToAny(s1);
            s2 = this.instantiateSignatureToAny(s2);

            if (includingReturnType) {
                PullHelpers.resolveDeclaredSymbolToUseType(s1);
                PullHelpers.resolveDeclaredSymbolToUseType(s2);
                context.walkReturnTypes();
                var areReturnTypesIdentical = this.typesAreIdenticalInEnclosingTypes(s1.returnType, s2.returnType, context);
                context.postWalkReturnTypes();
                if (!areReturnTypesIdentical) {
                    return false;
                }
            }

            var s1Params = s1.parameters;
            var s2Params = s2.parameters;

            for (var iParam = 0; iParam < s1Params.length; iParam++) {
                PullHelpers.resolveDeclaredSymbolToUseType(s1Params[iParam]);
                PullHelpers.resolveDeclaredSymbolToUseType(s2Params[iParam]);
                context.walkParameterTypes(iParam);
                var areParameterTypesIdentical = this.typesAreIdenticalInEnclosingTypes(s1Params[iParam].type, s2Params[iParam].type, context);
                context.postWalkParameterTypes();

                if (!areParameterTypesIdentical) {
                    return false;
                }
            }

            return true;
        }

        public signatureReturnTypesAreIdentical(s1: PullSignatureSymbol, s2: PullSignatureSymbol, context: PullTypeResolutionContext) {
            // Set the cache pairwise identity of type parameters, so if parameters refer to them, they would be treated as identical
            var s1TypeParameters = s1.getTypeParameters();
            var s2TypeParameters = s2.getTypeParameters();
            this.setTypeParameterIdentity(s1TypeParameters, s2TypeParameters, true);

            var enclosingTypeWalkerStates = context.setEnclosingTypeForSymbols(s1, s2);
            context.walkReturnTypes();
            var returnTypeIsIdentical = this.typesAreIdenticalInEnclosingTypes(s1.returnType, s2.returnType, context);
            // context.postWalkReturnTypes(); - this is not needed because we are restoring the old walkers
            context.setEnclosingTypeWalkerStates(enclosingTypeWalkerStates);

            // Reset the cahce with pairwise identity of type parameters
            this.setTypeParameterIdentity(s1TypeParameters, s2TypeParameters, undefined);

            return returnTypeIsIdentical;
        }

        // Assignment Compatibility and Subtyping

        private symbolsShareDeclaration(symbol1: PullSymbol, symbol2: PullSymbol) {
            var decls1 = symbol1.getDeclarations();
            var decls2 = symbol2.getDeclarations();

            if (decls1.length && decls2.length) {
                return decls1[0] === decls2[0];
            }

            return false;
        }

        private sourceIsSubtypeOfTarget(source: PullTypeSymbol, target: PullTypeSymbol, ast: ISyntaxElement, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo, isComparingInstantiatedSignatures?: boolean): boolean {
            return this.sourceIsRelatableToTarget(source, target, /*assignableTo*/false, this.subtypeCache, ast, context, comparisonInfo, isComparingInstantiatedSignatures);
        }

        private sourceMembersAreAssignableToTargetMembers(source: PullTypeSymbol, target: PullTypeSymbol, ast: ISyntaxElement, context: PullTypeResolutionContext, comparisonInfo: TypeComparisonInfo, isComparingInstantiatedSignatures?: boolean) {
            var enclosingTypeWalkerStates = context.setEnclosingTypeForSymbols(source, target);
            var areSourceMembersAreAssignableToTargetMembers = this.sourceMembersAreRelatableToTargetMembers(source, target,
            /*assignableTo*/true, this.assignableCache, ast, context, comparisonInfo, isComparingInstantiatedSignatures);
            context.setEnclosingTypeWalkerStates(enclosingTypeWalkerStates);
            return areSourceMembersAreAssignableToTargetMembers;
        }

        private sourcePropertyIsAssignableToTargetProperty(source: PullTypeSymbol, target: PullTypeSymbol,
            sourceProp: PullSymbol, targetProp: PullSymbol, ast: ISyntaxElement, context: PullTypeResolutionContext,
            comparisonInfo: TypeComparisonInfo, isComparingInstantiatedSignatures?: boolean) {

            var enclosingTypeWalkerStates = context.setEnclosingTypeForSymbols(source, target);
            var isSourcePropertyIsAssignableToTargetProperty = this.sourcePropertyIsRelatableToTargetProperty(source, target, sourceProp, targetProp,
            /*assignableTo*/true, this.assignableCache, ast, context, comparisonInfo, isComparingInstantiatedSignatures);
            context.setEnclosingTypeWalkerStates(enclosingTypeWalkerStates);
            return isSourcePropertyIsAssignableToTargetProperty;
        }

        private sourceCallSignaturesAreAssignableToTargetCallSignatures(source: PullTypeSymbol, target: PullTypeSymbol,
            ast: ISyntaxElement, context: PullTypeResolutionContext, comparisonInfo: TypeComparisonInfo,
            isComparingInstantiatedSignatures?: boolean) {

            var enclosingTypeWalkerStates = context.setEnclosingTypeForSymbols(source, target);
            var areSourceCallSignaturesAssignableToTargetCallSignatures = this.sourceCallSignaturesAreRelatableToTargetCallSignatures(source, target,
            /*assignableTo*/true, this.assignableCache, ast, context, comparisonInfo, isComparingInstantiatedSignatures);
            context.setEnclosingTypeWalkerStates(enclosingTypeWalkerStates);
            return areSourceCallSignaturesAssignableToTargetCallSignatures;
        }

        private sourceConstructSignaturesAreAssignableToTargetConstructSignatures(source: PullTypeSymbol, target: PullTypeSymbol,
            ast: ISyntaxElement, context: PullTypeResolutionContext, comparisonInfo: TypeComparisonInfo, isComparingInstantiatedSignatures?: boolean) {

            var enclosingTypeWalkerStates = context.setEnclosingTypeForSymbols(source, target);
            var areSourceConstructSignaturesAssignableToTargetConstructSignatures = this.sourceConstructSignaturesAreRelatableToTargetConstructSignatures(source, target,
            /*assignableTo*/true, this.assignableCache, ast, context, comparisonInfo, isComparingInstantiatedSignatures);
            context.setEnclosingTypeWalkerStates(enclosingTypeWalkerStates);
            return areSourceConstructSignaturesAssignableToTargetConstructSignatures;
        }

        private sourceIndexSignaturesAreAssignableToTargetIndexSignatures(source: PullTypeSymbol, target: PullTypeSymbol,
            ast: ISyntaxElement, context: PullTypeResolutionContext, comparisonInfo: TypeComparisonInfo, isComparingInstantiatedSignatures?: boolean) {
            var enclosingTypeWalkerStates = context.setEnclosingTypeForSymbols(source, target);
            var areSourceIndexSignaturesAssignableToTargetIndexSignatures = this.sourceIndexSignaturesAreRelatableToTargetIndexSignatures(source, target,
            /*assignableTo*/true, this.assignableCache, ast, context, comparisonInfo, isComparingInstantiatedSignatures);
            context.setEnclosingTypeWalkerStates(enclosingTypeWalkerStates);
            return areSourceIndexSignaturesAssignableToTargetIndexSignatures;
        }

        private typeIsAssignableToFunction(source: PullTypeSymbol, ast: ISyntaxElement, context: PullTypeResolutionContext): boolean {
            // Note that object types containing one or more call or construct signatures are 
            // automatically assignable to Function, provided they do not hide properties of
            // Function, giving them incompatible types. This is a result of the apparent type
            // rules in section 3.1.
            if (source.isFunctionType()) {
                return true;
            }

            return this.cachedFunctionInterfaceType() &&
                this.sourceIsAssignableToTarget(source, this.cachedFunctionInterfaceType(), ast, context);
        }

        private signatureIsAssignableToTarget(s1: PullSignatureSymbol, s2: PullSignatureSymbol, ast: ISyntaxElement, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo, isComparingInstantiatedSignatures?: boolean) {
            var enclosingTypeWalkerStates = context.setEnclosingTypeForSymbols(s1, s2);
            var isSignatureIsAssignableToTarget = this.signatureIsRelatableToTarget(s1, s2,
            /*assignableTo*/true, this.assignableCache, ast, context, comparisonInfo, isComparingInstantiatedSignatures);
            context.setEnclosingTypeWalkerStates(enclosingTypeWalkerStates);
            return isSignatureIsAssignableToTarget;
        }

        private sourceIsAssignableToTarget(source: PullTypeSymbol, target: PullTypeSymbol, ast: ISyntaxElement, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo, isComparingInstantiatedSignatures?: boolean): boolean {
            return this.sourceIsRelatableToTarget(source, target, true, this.assignableCache, ast, context, comparisonInfo, isComparingInstantiatedSignatures);
        }

        private sourceIsAssignableToTargetWithNewEnclosingTypes(source: PullTypeSymbol, target: PullTypeSymbol, ast: ISyntaxElement, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo, isComparingInstantiatedSignatures?: boolean): boolean {
            return this.sourceIsRelatableToTargetWithNewEnclosingTypes(source, target, true, this.assignableCache, ast, context, comparisonInfo, isComparingInstantiatedSignatures);
        }

        private getSymbolForRelationshipCheck(symbol: PullTypeSymbol) {
            if (symbol && symbol.isTypeReference()) {
                return (<TypeReferenceSymbol>symbol).getReferencedTypeSymbol();
            }

            return symbol;
        }

        private sourceIsRelatableToTargetInEnclosingTypes(source: PullTypeSymbol, target: PullTypeSymbol,
            assignableTo: boolean, comparisonCache: IBitMatrix, ast: ISyntaxElement, context: PullTypeResolutionContext,
            comparisonInfo: TypeComparisonInfo, isComparingInstantiatedSignatures: boolean): boolean {

            source = this.getSymbolForRelationshipCheck(source);
            target = this.getSymbolForRelationshipCheck(target);

            if (source === target) {
                return true;
            }

            if (source && target) {
                // Section 3.8.7 - Recursive Types
                //  When comparing two types S and T for identity(section 3.8.2), subtype(section 3.8.3), and assignability(section 3.8.4) relationships, 
                //  if either type originates in an infinitely expanding type reference, S and T are not compared by the rules in the preceding sections.Instead, for the relationship to be considered true,
                //  -	S and T must both be type references to the same named type, and
                //  -	the relationship in question must be true for each corresponding pair of type arguments in the type argument lists of S and T.

                if (context.oneOfClassificationsIsInfinitelyExpanding()) {
                    return this.infinitelyExpandingSourceTypeIsRelatableToTargetType(source, target, assignableTo, comparisonCache, ast, context, comparisonInfo, isComparingInstantiatedSignatures);
                }
            }

            return this.sourceIsRelatableToTarget(source, target, assignableTo, comparisonCache, ast, context, comparisonInfo, isComparingInstantiatedSignatures);
        }

        private sourceIsRelatableToTargetWithNewEnclosingTypes(source: PullTypeSymbol, target: PullTypeSymbol, assignableTo: boolean, comparisonCache: IBitMatrix, ast: ISyntaxElement, context: PullTypeResolutionContext, comparisonInfo: TypeComparisonInfo, isComparingInstantiatedSignatures: boolean): boolean {
            var enclosingTypeWalkerStates = context.resetEnclosingTypeWalkerStates();
            var isSourceRelatable = this.sourceIsRelatableToTarget(source, target, assignableTo, comparisonCache, ast,
                context, comparisonInfo, isComparingInstantiatedSignatures);
            context.setEnclosingTypeWalkerStates(enclosingTypeWalkerStates);
            return isSourceRelatable;
        }

        private sourceIsRelatableToTargetInCache(source: PullSymbol, target: PullSymbol, comparisonCache: IBitMatrix, comparisonInfo: TypeComparisonInfo) {
            var isRelatable = comparisonCache.valueAt(source.pullSymbolID, target.pullSymbolID);
            // If the source is relatable, return immediately
            if (isRelatable) {
                return { isRelatable: isRelatable };
            }

            // if comparison info is not asked, we can return cached false value, 
            // otherwise we need to redo the check to fill in the comparison info
            if (isRelatable != undefined && !comparisonInfo) {
                return { isRelatable: isRelatable };
            }

            return null;
        }

        private sourceIsRelatableToTarget(source: PullTypeSymbol, target: PullTypeSymbol, assignableTo: boolean, comparisonCache: IBitMatrix, ast: ISyntaxElement, context: PullTypeResolutionContext, comparisonInfo: TypeComparisonInfo, isComparingInstantiatedSignatures: boolean): boolean {
            source = this.getSymbolForRelationshipCheck(source);
            target = this.getSymbolForRelationshipCheck(target);

            if (source === target) {
                return true;
            }

            // An error has already been reported in this case
            if (!(source && target)) {
                return true;
            }

            // Note, for subtype the apparent type rules are different for type parameters. This
            // is not yet reflected in the spec.
            var sourceApparentType: PullTypeSymbol = this.getApparentType(source);

            // In the case of a 'false', we want to short-circuit a recursive typecheck
            var isRelatableInfo = this.sourceIsRelatableToTargetInCache(source, target, comparisonCache, comparisonInfo);
            if (isRelatableInfo) {
                return isRelatableInfo.isRelatable;
            }

            if (source === this.semanticInfoChain.stringTypeSymbol && target.isPrimitive() && (<PullPrimitiveTypeSymbol>target).isStringConstant()) {
                return comparisonInfo &&
                    comparisonInfo.stringConstantVal &&
                    (comparisonInfo.stringConstantVal.kind() === SyntaxKind.StringLiteral) &&
                    (stripStartAndEndQuotes((<ISyntaxToken>comparisonInfo.stringConstantVal).text()) === stripStartAndEndQuotes(target.name));
            }

            // this is one difference between subtyping and assignment compatibility
            if (assignableTo) {
                if (this.isAnyOrEquivalent(source) || this.isAnyOrEquivalent(target)) {
                    return true;
                }
            }
            else {
                // This is one difference between assignment compatibility and subtyping
                if (this.isAnyOrEquivalent(target)) {
                    return true;
                }
            }

            if (target === this.semanticInfoChain.stringTypeSymbol && source.isPrimitive() && (<PullPrimitiveTypeSymbol>source).isStringConstant()) {
                return true;
            }

            if (source.isPrimitive() && (<PullPrimitiveTypeSymbol>source).isStringConstant() && target.isPrimitive() && (<PullPrimitiveTypeSymbol>target).isStringConstant()) {
                // Both are string constants
                return TypeScript.stripStartAndEndQuotes(source.name) === TypeScript.stripStartAndEndQuotes(target.name);
            }

            if (source === this.semanticInfoChain.undefinedTypeSymbol) {
                return true;
            }

            if ((source === this.semanticInfoChain.nullTypeSymbol) && (target !== this.semanticInfoChain.undefinedTypeSymbol && target != this.semanticInfoChain.voidTypeSymbol)) {
                return true;
            }

            if (target === this.semanticInfoChain.voidTypeSymbol) {
                if (source === this.semanticInfoChain.undefinedTypeSymbol || source == this.semanticInfoChain.nullTypeSymbol) {
                    return true;
                }

                return false;
            }
            else if (source === this.semanticInfoChain.voidTypeSymbol) {
                if (target === this.semanticInfoChain.anyTypeSymbol) {
                    return true;
                }

                return false;
            }

            if (target === this.semanticInfoChain.numberTypeSymbol && PullHelpers.symbolIsEnum(source)) {
                return true;
            }

            if (source === this.semanticInfoChain.numberTypeSymbol && PullHelpers.symbolIsEnum(target)) {
                return assignableTo;
            }

            if (PullHelpers.symbolIsEnum(target) && PullHelpers.symbolIsEnum(source)) {
                return this.symbolsShareDeclaration(target, source);
            }

            if ((source.kind & PullElementKind.Enum) || (target.kind & PullElementKind.Enum)) {
                return false;
            }

            // Note: this code isn't necessary, but is helpful for error reporting purposes.  
            // Instead of reporting something like:
            //
            // Cannot convert 'A[]' to 'B[]':
            //  Types of property 'pop' of types 'A[]' and 'B[]' are incompatible:
            //    Call signatures of types '() => A' and '() => B' are incompatible:
            //      Type 'A' is missing property 'C' from type 'B'.
            //
            // We instead report:
            // Cannot convert 'A[]' to 'B[]':
            //   Type 'A' is missing property 'C' from type 'B'.

            if (source.getIsSpecialized() && target.getIsSpecialized()) {
                if (PullHelpers.getRootType(source) === PullHelpers.getRootType(target)
                    && PullHelpers.getRootType(source).isNamedTypeSymbol()) {

                    var sourceTypeArguments = source.getTypeArguments();
                    var targetTypeArguments = target.getTypeArguments();

                    if (sourceTypeArguments && targetTypeArguments) {
                        comparisonCache.setValueAt(source.pullSymbolID, target.pullSymbolID, true);

                        for (var i = 0; i < sourceTypeArguments.length; i++) {
                            if (!this.sourceIsRelatableToTargetWithNewEnclosingTypes(sourceTypeArguments[i],
                                targetTypeArguments[i], assignableTo, comparisonCache, ast, context,
                            /*comparisonInfo*/ null, isComparingInstantiatedSignatures)) {
                                break;
                            }
                        }

                        if (i === sourceTypeArguments.length) {
                            return true;
                        }
                        else {
                            comparisonCache.setValueAt(source.pullSymbolID, target.pullSymbolID, undefined);
                            // don't return from here - if we've failed, keep checking (this will allow contravariant checks against generic methods to properly pass or fail)
                        }
                    }
                }
            }

            if (target.isTypeParameter()) {
                if (source.isTypeParameter()) {
                    // SPEC Nov 18
                    // S is assignable to a type T, and T is assignable from S, if ...
                    // S and T are type parameters, and S is directly or indirectly constrained to T.
                    if (!(<PullTypeParameterSymbol>source).getConstraint()) {
                        // if the source is another type parameter (with no constraints), they can only be assignable if they share
                        // a declaration
                        return this.typesAreIdentical(target, source, context)
                    }
                    else {
                        return this.isSourceTypeParameterConstrainedToTargetTypeParameter(<PullTypeParameterSymbol>source, <PullTypeParameterSymbol>target);
                    }
                }
                else {
                    // if the source is not another type parameter, and we're specializing at a constraint site, we consider the
                    // target to be a subtype of its constraint
                    if (isComparingInstantiatedSignatures) {
                        target = (<PullTypeParameterSymbol>target).getBaseConstraint(this.semanticInfoChain);
                    }
                    else {
                        return this.typesAreIdentical(target, sourceApparentType, context);
                    }
                }
            }

            // this check ensures that we only operate on object types from this point forward,
            // since the checks involving primitives occurred above
            if (sourceApparentType.isPrimitive() || target.isPrimitive()) {
                // we already know that they're not the same, and that neither is 'any'
                return false;
            }

            comparisonCache.setValueAt(source.pullSymbolID, target.pullSymbolID, true);

            var symbolsWhenStartedWalkingTypes = context.startWalkingTypes(sourceApparentType, target);
            var isRelatable = this.sourceIsRelatableToTargetWorker(sourceApparentType, target, assignableTo,
                comparisonCache, ast, context, comparisonInfo, isComparingInstantiatedSignatures);
            context.endWalkingTypes(symbolsWhenStartedWalkingTypes);

            comparisonCache.setValueAt(source.pullSymbolID, target.pullSymbolID, isRelatable);
            return isRelatable;
        }

        private isSourceTypeParameterConstrainedToTargetTypeParameter(source: PullTypeParameterSymbol, target: PullTypeParameterSymbol): boolean {
            var current: PullTypeSymbol = source;
            while (current && current.isTypeParameter()) {
                if (current === target) {
                    return true;
                }

                current = (<PullTypeParameterSymbol>current).getConstraint();
            }
            return false;
        }

        private sourceIsRelatableToTargetWorker(source: PullTypeSymbol, target: PullTypeSymbol, assignableTo: boolean, comparisonCache: IBitMatrix, ast: ISyntaxElement, context: PullTypeResolutionContext, comparisonInfo: TypeComparisonInfo, isComparingInstantiatedSignatures: boolean): boolean {
            if (target.hasMembers() && !this.sourceMembersAreRelatableToTargetMembers(source, target, assignableTo, comparisonCache, ast, context, comparisonInfo, isComparingInstantiatedSignatures)) {
                return false;
            }

            if (!this.sourceCallSignaturesAreRelatableToTargetCallSignatures(source, target, assignableTo, comparisonCache, ast, context, comparisonInfo, isComparingInstantiatedSignatures)) {
                return false;
            }

            if (!this.sourceConstructSignaturesAreRelatableToTargetConstructSignatures(source, target, assignableTo, comparisonCache, ast, context, comparisonInfo, isComparingInstantiatedSignatures)) {
                return false;
            }

            if (!this.sourceIndexSignaturesAreRelatableToTargetIndexSignatures(source, target, assignableTo, comparisonCache, ast, context, comparisonInfo, isComparingInstantiatedSignatures)) {
                return false;
            }

            return true;
        }

        private sourceMembersAreRelatableToTargetMembers(source: PullTypeSymbol, target: PullTypeSymbol, assignableTo: boolean,
            comparisonCache: IBitMatrix, ast: ISyntaxElement, context: PullTypeResolutionContext,
            comparisonInfo: TypeComparisonInfo, isComparingInstantiatedSignatures: boolean): boolean {
            var targetProps = target.getAllMembers(PullElementKind.SomeValue, GetAllMembersVisiblity.all);

            for (var itargetProp = 0; itargetProp < targetProps.length; itargetProp++) {

                var targetProp = targetProps[itargetProp];
                // November 18, 2013, Sections 3.8.3 + 3.8.4
                // ..., where S' denotes the apparent type (section 3.8.1) of S
                // Note that by this point, we should already have the apparent type of 'source',
                // not including augmentation, so the only thing left to do is augment the type as
                // we look for the property.
                var sourceProp = this._getNamedPropertySymbolOfAugmentedType(targetProp.name, source);

                this.resolveDeclaredSymbol(targetProp, context);

                var targetPropType = targetProp.type;

                if (!sourceProp) {
                    if (!(targetProp.isOptional)) {
                        if (comparisonInfo) { // only surface the first error
                            var enclosingSymbol = this.getEnclosingSymbolForAST(ast);
                            comparisonInfo.addMessage(getDiagnosticMessage(DiagnosticCode.Type_0_is_missing_property_1_from_type_2,
                                [source.toString(enclosingSymbol), targetProp.getScopedNameEx().toString(), target.toString(enclosingSymbol)]));
                        }
                        return false;
                    }
                    continue;
                }

                if (!this.sourcePropertyIsRelatableToTargetProperty(source, target, sourceProp, targetProp, assignableTo,
                    comparisonCache, ast, context, comparisonInfo, isComparingInstantiatedSignatures)) {
                    return false;
                }
            }

            return true;
        }

        private infinitelyExpandingSourceTypeIsRelatableToTargetType(
            sourceType: PullTypeSymbol,
            targetType: PullTypeSymbol,
            assignableTo: boolean,
            comparisonCache: IBitMatrix,
            ast: ISyntaxElement,
            context: PullTypeResolutionContext,
            comparisonInfo: TypeComparisonInfo,
            isComparingInstantiatedSignatures: boolean): boolean {

            // Section 3.8.7 - Recursive Types
            //  When comparing two types S and T for identity(section 3.8.2), subtype(section 3.8.3), and 
            //  assignability(section 3.8.4) relationships, 
            //  if either type originates in an infinitely expanding type reference, S and T are not compared
            //  by the rules in the preceding sections.Instead, for the relationship to be considered true,
            //  -	S and T must both be type references to the same named type, and
            //  -	the relationship in question must be true for each corresponding pair of type arguments in
            //      the type argument lists of S and T.

            var widenedTargetType = targetType.widenedType(this.resolver, /*ast*/ null, context);
            var widenedSourceType = sourceType.widenedType(this.resolver, /*ast*/ null, context);

            // Check if the type is not any/null or undefined
            if ((widenedSourceType !== this.semanticInfoChain.anyTypeSymbol) &&
                (widenedTargetType !== this.semanticInfoChain.anyTypeSymbol)) {

                var sourceTypeNamedTypeReference = PullHelpers.getRootType(sourceType);
                var targetTypeNamedTypeReference = PullHelpers.getRootType(targetType);

                //  -	S and T must both be type references to the same named type, and
                if (sourceTypeNamedTypeReference !== targetTypeNamedTypeReference) {
                    comparisonCache.setValueAt(sourceType.pullSymbolID, targetType.pullSymbolID, false);
                    if (comparisonInfo) {
                        var enclosingSymbol = this.getEnclosingSymbolForAST(ast);
                        comparisonInfo.addMessage(getDiagnosticMessage(DiagnosticCode.Types_0_and_1_originating_in_infinitely_expanding_type_reference_do_not_refer_to_same_named_type,
                            [sourceType.getScopedNameEx(enclosingSymbol).toString(), targetType.toString(enclosingSymbol)]));
                    }
                    return false;
                }

                var sourceTypeArguments = sourceType.getTypeArguments();
                var targetTypeArguments = targetType.getTypeArguments();

                // Verify if all type arguments can relate
                if (!sourceTypeArguments && !targetTypeArguments) {
                    // Both interface have 0 type arguments, so they relate
                    comparisonCache.setValueAt(sourceType.pullSymbolID, targetType.pullSymbolID, true);
                    return true;
                }

                // If the number of type arguments mismatch (because of incomplete list - types are incompatible
                if (!(sourceTypeArguments && targetTypeArguments) ||
                    sourceTypeArguments.length !== targetTypeArguments.length) {
                    comparisonCache.setValueAt(sourceType.pullSymbolID, targetType.pullSymbolID, false);
                    if (comparisonInfo) {
                        var enclosingSymbol = this.getEnclosingSymbolForAST(ast);
                        comparisonInfo.addMessage(getDiagnosticMessage(DiagnosticCode.Types_0_and_1_originating_in_infinitely_expanding_type_reference_have_incompatible_type_arguments,
                            [sourceType.toString(enclosingSymbol), targetType.toString(enclosingSymbol)]));
                    }
                    return false;
                }

                var comparisonInfoTypeArgumentsCheck: TypeComparisonInfo = null;
                if (comparisonInfo && !comparisonInfo.onlyCaptureFirstError) {
                    comparisonInfoTypeArgumentsCheck = new TypeComparisonInfo(comparisonInfo);
                }
                var isRelatable = true;
                for (var i = 0; i < sourceTypeArguments.length && isRelatable; i++) {
                    //  -	the relationship in question must be true for each corresponding pair of type arguments
                    //      in the type argument lists of S and T.
                    context.walkTypeArgument(i);

                    if (!this.sourceIsRelatableToTargetInEnclosingTypes(sourceTypeArguments[i], targetTypeArguments[i], assignableTo, comparisonCache, ast, context, comparisonInfoTypeArgumentsCheck, isComparingInstantiatedSignatures)) {
                        isRelatable = false;
                        if (comparisonInfo) {
                            var message: string;
                            var enclosingSymbol = this.getEnclosingSymbolForAST(ast);

                            if (comparisonInfoTypeArgumentsCheck && comparisonInfoTypeArgumentsCheck.message) {
                                message = getDiagnosticMessage(DiagnosticCode.Types_0_and_1_originating_in_infinitely_expanding_type_reference_have_incompatible_type_arguments_NL_2,
                                    [sourceType.toString(enclosingSymbol), targetType.toString(enclosingSymbol), comparisonInfoTypeArgumentsCheck.message]);
                            }
                            else {
                                message = getDiagnosticMessage(DiagnosticCode.Types_0_and_1_originating_in_infinitely_expanding_type_reference_have_incompatible_type_arguments,
                                    [sourceType.toString(enclosingSymbol), targetType.toString(enclosingSymbol)]);
                            }
                            comparisonInfo.addMessage(message);
                        }

                    }

                    context.postWalkTypeArgument();
                }
            }

            comparisonCache.setValueAt(sourceType.pullSymbolID, targetType.pullSymbolID, isRelatable);
            return isRelatable;
        }

        private infinitelyExpandingTypesAreIdentical(sourceType: PullTypeSymbol, targetType: PullTypeSymbol,
            context: PullTypeResolutionContext): boolean {

            // Section 3.8.7 - Recursive Types
            //  When comparing two types S and T for identity(section 3.8.2), subtype(section 3.8.3), and 
            //  assignability(section 3.8.4) relationships, 
            //  if either type originates in an infinitely expanding type reference, S and T are not compared
            //  by the rules in the preceding sections.Instead, for the relationship to be considered true,
            //  -	S and T must both be type references to the same named type, and
            //  -	the relationship in question must be true for each corresponding pair of type arguments in
            //      the type argument lists of S and T.

            var widenedTargetType = targetType.widenedType(this.resolver, /*ast*/ null, /*context*/ null);
            var widenedSourceType = sourceType.widenedType(this.resolver, /*ast*/ null, /*context*/ null);

            // Check if the type is not any/null or undefined
            if ((widenedSourceType !== this.semanticInfoChain.anyTypeSymbol) &&
                (widenedTargetType !== this.semanticInfoChain.anyTypeSymbol)) {

                //  -	S and T must both be type references to the same named type, and
                var sourceTypeNamedTypeReference = PullHelpers.getRootType(sourceType);
                var targetTypeNamedTypeReference = PullHelpers.getRootType(targetType);
                if (sourceTypeNamedTypeReference !== targetTypeNamedTypeReference) {
                    this.identicalCache.setValueAt(sourceType.pullSymbolID, targetType.pullSymbolID, false);
                    return false;
                }

                //  -	the relationship in question must be true for each corresponding pair of type arguments in
                //      the type argument lists of S and T.
                var sourceTypeArguments = sourceType.getTypeArguments();
                var targetTypeArguments = targetType.getTypeArguments();

                if (!sourceTypeArguments && !targetTypeArguments) {
                    // Both types do not refere to any type arguments so they are identical
                    this.identicalCache.setValueAt(sourceType.pullSymbolID, targetType.pullSymbolID, true);
                    return true;
                }

                if (!(sourceTypeArguments && targetTypeArguments) ||
                    sourceTypeArguments.length !== targetTypeArguments.length) {
                    // Mismatch in type arguments length - may be missing type arguments - it is error 
                    this.identicalCache.setValueAt(sourceType.pullSymbolID, targetType.pullSymbolID, false);
                    return false;
                }

                for (var i = 0; i < sourceTypeArguments.length; i++) {
                    // Each pair of type argument needs to be identical for the type to be identical
                    context.walkTypeArgument(i)
                    var areIdentical = this.typesAreIdenticalInEnclosingTypes(sourceTypeArguments[i], targetTypeArguments[i], context);
                    context.postWalkTypeArgument();

                    if (!areIdentical) {
                        this.identicalCache.setValueAt(sourceType.pullSymbolID, targetType.pullSymbolID, false);
                        return false;
                    }
                }
            }

            this.identicalCache.setValueAt(sourceType.pullSymbolID, targetType.pullSymbolID, true);
            return true;
        }

        private sourcePropertyIsRelatableToTargetProperty(source: PullTypeSymbol, target: PullTypeSymbol,
            sourceProp: PullSymbol, targetProp: PullSymbol, assignableTo: boolean, comparisonCache: IBitMatrix,
            ast: ISyntaxElement, context: PullTypeResolutionContext, comparisonInfo: TypeComparisonInfo,
            isComparingInstantiatedSignatures: boolean): boolean {

            var sourceAndTargetAreConstructors = source.isConstructor() && target.isConstructor();

            // source\target are not always equivalent to getContainer(). 
            // i.e.in cases of inheritance chains source will be derived type and getContainer() will yield some type from the middle of hierarchy
            var getNames = (takeTypesFromPropertyContainers: boolean) => {
                var enclosingSymbol = this.getEnclosingSymbolForAST(ast);
                var sourceType = takeTypesFromPropertyContainers ? sourceProp.getContainer() : source;
                var targetType = takeTypesFromPropertyContainers ? targetProp.getContainer() : target;
                if (sourceAndTargetAreConstructors) {
                    sourceType = sourceType.getAssociatedContainerType();
                    targetType = targetType.getAssociatedContainerType();
                }
                return {
                    propertyName: targetProp.getScopedNameEx().toString(),
                    sourceTypeName: sourceType.toString(enclosingSymbol),
                    targetTypeName: targetType.toString(enclosingSymbol)
                }
            };

            var targetPropIsPrivate = targetProp.anyDeclHasFlag(PullElementFlags.Private);
            var sourcePropIsPrivate = sourceProp.anyDeclHasFlag(PullElementFlags.Private);

            // if visibility doesn't match, the types don't match
            if (targetPropIsPrivate !== sourcePropIsPrivate) {
                if (comparisonInfo) { // only surface the first error
                    var names = getNames(/*takeTypesFromPropertyContainers*/ true);
                    var code: string;
                    if (targetPropIsPrivate) {
                        // Overshadowing property in source that is already defined as private in target
                        code = sourceAndTargetAreConstructors
                        ? DiagnosticCode.Static_property_0_defined_as_public_in_type_1_is_defined_as_private_in_type_2
                        : DiagnosticCode.Property_0_defined_as_public_in_type_1_is_defined_as_private_in_type_2;
                    }
                    else {
                        // Public property of target is private in source
                        code =
                        sourceAndTargetAreConstructors
                        ? DiagnosticCode.Static_property_0_defined_as_private_in_type_1_is_defined_as_public_in_type_2
                        : DiagnosticCode.Property_0_defined_as_private_in_type_1_is_defined_as_public_in_type_2
                    }
                    comparisonInfo.addMessage(getDiagnosticMessage(code, [names.propertyName, names.sourceTypeName, names.targetTypeName]));
                }
                return false;
            }
            // if both are private members, test to ensure that they share a declaration
            else if (sourcePropIsPrivate && targetPropIsPrivate) {
                var targetDecl = targetProp.getDeclarations()[0];
                var sourceDecl = sourceProp.getDeclarations()[0];

                if (targetDecl !== sourceDecl) {
                    if (comparisonInfo) {
                        var names = getNames(/*takeTypesFromPropertyContainers*/ true);
                        // Both types define property with same name as private
                        var code = sourceAndTargetAreConstructors
                            ? DiagnosticCode.Types_0_and_1_define_static_property_2_as_private
                            : DiagnosticCode.Types_0_and_1_define_property_2_as_private;
                        comparisonInfo.addMessage(getDiagnosticMessage(code, [names.sourceTypeName, names.targetTypeName, names.propertyName]));
                    }

                    return false;
                }
            }

            // If the target property is required, and the source property is optional, they are not compatible
            if (sourceProp.isOptional && !targetProp.isOptional) {
                if (comparisonInfo) {
                    var names = getNames(/*takeTypesFromPropertyContainers*/ true);
                    comparisonInfo.addMessage(getDiagnosticMessage(DiagnosticCode.Property_0_defined_as_optional_in_type_1_but_is_required_in_type_2,
                        [names.propertyName, names.sourceTypeName, names.targetTypeName]));
                }
                return false;
            }

            this.resolveDeclaredSymbol(sourceProp, context);

            var sourcePropType = sourceProp.type;
            var targetPropType = targetProp.type;

            // In the case of a 'false', we want to short-circuit a recursive typecheck
            var isRelatableInfo = this.sourceIsRelatableToTargetInCache(sourcePropType, targetPropType, comparisonCache, comparisonInfo);
            if (isRelatableInfo) {
                return isRelatableInfo.isRelatable;
            }

            var comparisonInfoPropertyTypeCheck: TypeComparisonInfo = null;
            if (comparisonInfo && !comparisonInfo.onlyCaptureFirstError) {
                comparisonInfoPropertyTypeCheck = new TypeComparisonInfo(comparisonInfo);
            }

            context.walkMemberTypes(targetProp.name);
            var isSourcePropertyRelatableToTargetProperty = this.sourceIsRelatableToTargetInEnclosingTypes(sourcePropType,
                targetPropType, assignableTo, comparisonCache, ast, context, comparisonInfoPropertyTypeCheck,
                isComparingInstantiatedSignatures);
            context.postWalkMemberTypes();

            // Update error message correctly
            if (!isSourcePropertyRelatableToTargetProperty && comparisonInfo) {
                var enclosingSymbol = this.getEnclosingSymbolForAST(ast);
                var message: string;
                var names = getNames(/*takeTypesFromPropertyContainers*/ false);
                if (comparisonInfoPropertyTypeCheck && comparisonInfoPropertyTypeCheck.message) {
                    var code = sourceAndTargetAreConstructors
                        ? DiagnosticCode.Types_of_static_property_0_of_class_1_and_class_2_are_incompatible_NL_3
                        : DiagnosticCode.Types_of_property_0_of_types_1_and_2_are_incompatible_NL_3;
                    message = getDiagnosticMessage(code, [names.propertyName, names.sourceTypeName, names.targetTypeName, comparisonInfoPropertyTypeCheck.message]);
                }
                else {
                    var code =
                        sourceAndTargetAreConstructors
                        ? DiagnosticCode.Types_of_static_property_0_of_class_1_and_class_2_are_incompatible
                        : DiagnosticCode.Types_of_property_0_of_types_1_and_2_are_incompatible;
                    message = getDiagnosticMessage(code, [names.propertyName, names.sourceTypeName, names.targetTypeName]);
                }
                comparisonInfo.addMessage(message);
            }

            return isSourcePropertyRelatableToTargetProperty;
        }

        private sourceCallSignaturesAreRelatableToTargetCallSignatures(source: PullTypeSymbol, target: PullTypeSymbol,
            assignableTo: boolean, comparisonCache: IBitMatrix, ast: ISyntaxElement, context: PullTypeResolutionContext,
            comparisonInfo: TypeComparisonInfo, isComparingInstantiatedSignatures: boolean): boolean {

            var targetCallSigs = target.getCallSignatures();

            // check signature groups
            if (targetCallSigs.length) {
                var comparisonInfoSignatuesTypeCheck: TypeComparisonInfo = null;
                if (comparisonInfo && !comparisonInfo.onlyCaptureFirstError) {
                    comparisonInfoSignatuesTypeCheck = new TypeComparisonInfo(comparisonInfo);
                }

                var sourceCallSigs = source.getCallSignatures();
                if (!this.signatureGroupIsRelatableToTarget(source, target, sourceCallSigs, targetCallSigs,
                    assignableTo, comparisonCache, ast, context, comparisonInfoSignatuesTypeCheck, isComparingInstantiatedSignatures)) {
                    if (comparisonInfo) {
                        var message: string;
                        var enclosingSymbol = this.getEnclosingSymbolForAST(ast);
                        if (sourceCallSigs.length && targetCallSigs.length) {
                            if (comparisonInfoSignatuesTypeCheck && comparisonInfoSignatuesTypeCheck.message) {
                                message = getDiagnosticMessage(DiagnosticCode.Call_signatures_of_types_0_and_1_are_incompatible_NL_2,
                                    [source.toString(enclosingSymbol), target.toString(enclosingSymbol), comparisonInfoSignatuesTypeCheck.message]);
                            }
                            else {
                                message = getDiagnosticMessage(DiagnosticCode.Call_signatures_of_types_0_and_1_are_incompatible,
                                    [source.toString(enclosingSymbol), target.toString(enclosingSymbol)]);
                            }
                        }
                        else {
                            var hasSig = targetCallSigs.length ? target.toString(enclosingSymbol) : source.toString(enclosingSymbol);
                            var lacksSig = !targetCallSigs.length ? target.toString(enclosingSymbol) : source.toString(enclosingSymbol);
                            message = getDiagnosticMessage(DiagnosticCode.Type_0_requires_a_call_signature_but_type_1_lacks_one, [hasSig, lacksSig]);
                        }
                        comparisonInfo.addMessage(message);
                    }
                    return false;
                }
            }

            return true;
        }

        private sourceConstructSignaturesAreRelatableToTargetConstructSignatures(source: PullTypeSymbol, target: PullTypeSymbol,
            assignableTo: boolean, comparisonCache: IBitMatrix, ast: ISyntaxElement, context: PullTypeResolutionContext,
            comparisonInfo: TypeComparisonInfo, isComparingInstantiatedSignatures: boolean): boolean {

            // check signature groups
            var targetConstructSigs = target.getConstructSignatures();
            if (targetConstructSigs.length) {
                var comparisonInfoSignatuesTypeCheck: TypeComparisonInfo = null;
                if (comparisonInfo && !comparisonInfo.onlyCaptureFirstError) {
                    comparisonInfoSignatuesTypeCheck = new TypeComparisonInfo(comparisonInfo);
                }

                var sourceConstructSigs = source.getConstructSignatures();
                if (!this.signatureGroupIsRelatableToTarget(source, target, sourceConstructSigs, targetConstructSigs,
                    assignableTo, comparisonCache, ast, context, comparisonInfoSignatuesTypeCheck, isComparingInstantiatedSignatures)) {
                    if (comparisonInfo) {
                        var enclosingSymbol = this.getEnclosingSymbolForAST(ast);
                        var message: string;
                        if (sourceConstructSigs.length && targetConstructSigs.length) {
                            if (comparisonInfoSignatuesTypeCheck && comparisonInfoSignatuesTypeCheck.message) {
                                message = getDiagnosticMessage(DiagnosticCode.Construct_signatures_of_types_0_and_1_are_incompatible_NL_2,
                                    [source.toString(enclosingSymbol), target.toString(enclosingSymbol), comparisonInfoSignatuesTypeCheck.message]);
                            }
                            else {
                                message = getDiagnosticMessage(DiagnosticCode.Construct_signatures_of_types_0_and_1_are_incompatible,
                                    [source.toString(enclosingSymbol), target.toString(enclosingSymbol)]);
                            }
                        }
                        else {
                            var hasSig = targetConstructSigs.length ? target.toString(enclosingSymbol) : source.toString(enclosingSymbol);
                            var lacksSig = !targetConstructSigs.length ? target.toString(enclosingSymbol) : source.toString(enclosingSymbol);
                            message = getDiagnosticMessage(DiagnosticCode.Type_0_requires_a_construct_signature_but_type_1_lacks_one, [hasSig, lacksSig]);
                        }
                        comparisonInfo.addMessage(message);
                    }
                    return false;
                }
            }

            return true;
        }

        private sourceIndexSignaturesAreRelatableToTargetIndexSignatures(source: PullTypeSymbol, target: PullTypeSymbol,
            assignableTo: boolean, comparisonCache: IBitMatrix, ast: ISyntaxElement, context: PullTypeResolutionContext,
            comparisonInfo: TypeComparisonInfo, isComparingInstantiatedSignatures: boolean): boolean {

            var targetIndexSigs = this.getBothKindsOfIndexSignaturesExcludingAugmentedType(target, context);
            var targetStringSig = targetIndexSigs.stringSignature;
            var targetNumberSig = targetIndexSigs.numericSignature;

            if (targetStringSig || targetNumberSig) {
                var sourceIndexSigs = this.getBothKindsOfIndexSignaturesIncludingAugmentedType(source, context);
                var enclosingTypeIndexSigs = context.getBothKindOfIndexSignatures(/*includeAugmentedType1*/ true, /*includeAugmentedType2*/ false);
                var sourceStringSig = sourceIndexSigs.stringSignature;
                var sourceNumberSig = sourceIndexSigs.numericSignature;

                var comparable = true;
                var comparisonInfoSignatuesTypeCheck: TypeComparisonInfo = null;
                if (comparisonInfo && !comparisonInfo.onlyCaptureFirstError) {
                    comparisonInfoSignatuesTypeCheck = new TypeComparisonInfo(comparisonInfo);
                }

                if (targetStringSig) {
                    // Spec section 3.8.3	Subtypes and Supertypes
                    // S is a subtype of a type T, and T is a supertype of S, if one of the following is true, 
                    // where S’ denotes the apparent type(section 3.8.1) of S:
                    //      - M is a string index signature of type U and 
                    //        S’ contains a string index signature of a type that is assignable to U.

                    // Spec section 3.8.4	Assignment Compatibility
                    // S is assignable to a type T, and T is assignable from S, if one of the following is true, 
                    // where S’ denotes the apparent type(section 3.8.1) of S:
                    //      - M is a string index signature of type U and 
                    //        S’ contains a string index signature of a type that is assignable to U.
                    if (sourceStringSig) {
                        context.walkIndexSignatureReturnTypes(enclosingTypeIndexSigs, /*useStringIndexSignature1*/ true, /*useStringIndexSignature2*/ true);
                        comparable = this.sourceIsRelatableToTargetInEnclosingTypes(sourceStringSig.returnType,
                            targetStringSig.returnType, assignableTo, comparisonCache, ast,
                            context, comparisonInfoSignatuesTypeCheck, isComparingInstantiatedSignatures);
                        context.postWalkIndexSignatureReturnTypes();
                    }
                    else {
                        comparable = false;
                    }
                }

                if (comparable && targetNumberSig) {
                    // Spec section 3.8.3	Subtypes and Supertypes
                    // S is a subtype of a type T, and T is a supertype of S, if one of the following is true, 
                    // where S’ denotes the apparent type(section 3.8.1) of S:
                    //      - M is a numeric index signature of type U and 
                    //        S’ contains a string or numeric index signature of a type that is a subtype of U.

                    // Spec section 3.8.4	Assignment Compatibility
                    // S is assignable to a type T, and T is assignable from S, if one of the following is true, 
                    // where S’ denotes the apparent type(section 3.8.1) of S:
                    //      - M is a numeric index signature of type U and
                    //        S’ contains a string or numeric index signature of a type that is assignable to U.
                    if (sourceNumberSig) {
                        context.walkIndexSignatureReturnTypes(enclosingTypeIndexSigs, /*useStringIndexSignature1*/ false, /*useStringIndexSignature2*/ false);
                        comparable = this.sourceIsRelatableToTargetInEnclosingTypes(sourceNumberSig.returnType,
                            targetNumberSig.returnType, assignableTo, comparisonCache, ast,
                            context, comparisonInfoSignatuesTypeCheck, isComparingInstantiatedSignatures);
                        context.postWalkIndexSignatureReturnTypes();
                    }
                    else if (sourceStringSig) {
                        context.walkIndexSignatureReturnTypes(enclosingTypeIndexSigs, /*useStringIndexSignature1*/ true, /*useStringIndexSignature2*/ false);
                        comparable = this.sourceIsRelatableToTargetInEnclosingTypes(sourceStringSig.returnType,
                            targetNumberSig.returnType, assignableTo, comparisonCache, ast,
                            context, comparisonInfoSignatuesTypeCheck, isComparingInstantiatedSignatures);
                        context.postWalkIndexSignatureReturnTypes();
                    }
                    else {
                        comparable = false;
                    }
                }

                if (!comparable) {
                    if (comparisonInfo) {
                        var message: string;
                        var enclosingSymbol = this.getEnclosingSymbolForAST(ast);
                        if (comparisonInfoSignatuesTypeCheck && comparisonInfoSignatuesTypeCheck.message) {
                            message = getDiagnosticMessage(DiagnosticCode.Index_signatures_of_types_0_and_1_are_incompatible_NL_2,
                                [source.toString(enclosingSymbol), target.toString(enclosingSymbol), comparisonInfoSignatuesTypeCheck.message]);
                        }
                        else {
                            message = getDiagnosticMessage(DiagnosticCode.Index_signatures_of_types_0_and_1_are_incompatible,
                                [source.toString(enclosingSymbol), target.toString(enclosingSymbol)]);
                        }
                        comparisonInfo.addMessage(message);
                    }
                    return false;
                }
            }

            return true;
        }

        // REVIEW: TypeChanges: Return an error context object so the user can get better diagnostic info
        private signatureGroupIsRelatableToTarget(source: PullTypeSymbol, target: PullTypeSymbol,
            sourceSG: PullSignatureSymbol[], targetSG: PullSignatureSymbol[],
            assignableTo: boolean, comparisonCache: IBitMatrix, ast: ISyntaxElement, context: PullTypeResolutionContext,
            comparisonInfo: TypeComparisonInfo, isComparingInstantiatedSignatures: boolean) {
            if (sourceSG === targetSG) {
                return true;
            }

            if (!(sourceSG.length && targetSG.length)) {
                return false;
            }

            var foundMatch = false;

            var targetExcludeDefinition = targetSG.length > 1;
            var sourceExcludeDefinition = sourceSG.length > 1;
            var sigsCompared = 0;
            var comparisonInfoSignatuesTypeCheck: TypeComparisonInfo = null;
            if (comparisonInfo) {
                comparisonInfoSignatuesTypeCheck = new TypeComparisonInfo(comparisonInfo, /*useSameIndent*/ true);
                comparisonInfoSignatuesTypeCheck.message = comparisonInfo.message;
            }
            for (var iMSig = 0; iMSig < targetSG.length; iMSig++) {
                var mSig = targetSG[iMSig];

                if (mSig.isStringConstantOverloadSignature() || (targetExcludeDefinition && mSig.isDefinition())) {
                    continue;
                }

                for (var iNSig = 0; iNSig < sourceSG.length; iNSig++) {
                    var nSig = sourceSG[iNSig];

                    if (nSig.isStringConstantOverloadSignature() || (sourceExcludeDefinition && nSig.isDefinition())) {
                        continue;
                    }

                    context.walkSignatures(nSig.kind, iNSig, iMSig);
                    var isSignatureRelatableToTarget = this.signatureIsRelatableToTarget(nSig, mSig, assignableTo, comparisonCache, ast, context,
                        sigsCompared == 0 ? comparisonInfoSignatuesTypeCheck : null, isComparingInstantiatedSignatures);
                    context.postWalkSignatures();

                    sigsCompared++;

                    if (isSignatureRelatableToTarget) {
                        foundMatch = true;
                        break;
                    }
                }

                if (foundMatch) {
                    foundMatch = false;
                    continue;
                }

                // Give information about check fail only if we are comparing one signature.
                // This helps in perf (without comparisonInfo we can even use checks that were determined to be false)
                // Yet we can give useful info if we are comparing two types with one signature
                if (comparisonInfo && sigsCompared == 1) {
                    comparisonInfo.message = comparisonInfoSignatuesTypeCheck.message;
                }

                return false;
            }

            return true;
        }

        private signatureIsRelatableToTarget(sourceSig: PullSignatureSymbol, targetSig: PullSignatureSymbol,
            assignableTo: boolean, comparisonCache: IBitMatrix, ast: ISyntaxElement, context: PullTypeResolutionContext,
            comparisonInfo: TypeComparisonInfo, isComparingInstantiatedSignatures: boolean) {
            var isRelatableInfo = this.sourceIsRelatableToTargetInCache(sourceSig, targetSig, comparisonCache, comparisonInfo);
            if (isRelatableInfo) {
                return isRelatableInfo.isRelatable;
            }

            comparisonCache.setValueAt(sourceSig.pullSymbolID, targetSig.pullSymbolID, true);
            var isRelatable = this.signatureIsRelatableToTargetWorker(sourceSig, targetSig, assignableTo, comparisonCache,
                ast, context, comparisonInfo, isComparingInstantiatedSignatures);
            comparisonCache.setValueAt(sourceSig.pullSymbolID, targetSig.pullSymbolID, isRelatable);
            return isRelatable;
        }

        private signatureIsRelatableToTargetWorker(sourceSig: PullSignatureSymbol, targetSig: PullSignatureSymbol,
            assignableTo: boolean, comparisonCache: IBitMatrix, ast: ISyntaxElement, context: PullTypeResolutionContext,
            comparisonInfo: TypeComparisonInfo, isComparingInstantiatedSignatures: boolean) {

            var sourceParameters = sourceSig.parameters;
            var targetParameters = targetSig.parameters;

            if (!sourceParameters || !targetParameters) {
                return false;
            }

            var targetNonOptionalParamCount = targetSig.nonOptionalParamCount;
            var sourceNonOptionalParamCount = sourceSig.nonOptionalParamCount;

            if (!targetSig.hasVarArgs && sourceNonOptionalParamCount > targetParameters.length) {
                if (comparisonInfo) {
                    comparisonInfo.addMessage(getDiagnosticMessage(DiagnosticCode.Call_signature_expects_0_or_fewer_parameters, [targetParameters.length]));
                }
                return false;
            }

            // If signatures are relatable if sourceSig and targetSig are identical
            if (this.signaturesAreIdentical(sourceSig, targetSig, context)) {
                return true;
            }

            // From the January 23 version of the spec, following the design change:
            // Section 3.8.3 + 3.8.4: M is a non-specialized call or construct signature and S'
            // contains a call or construct signature N where, when M and N are instantiated using
            // type Any as the type argument for all type parameters declared by M and N (if any)
            targetSig = this.instantiateSignatureToAny(targetSig);
            sourceSig = this.instantiateSignatureToAny(sourceSig);

            var sourceReturnType = sourceSig.returnType;
            var targetReturnType = targetSig.returnType;

            if (targetReturnType !== this.semanticInfoChain.voidTypeSymbol) {
                context.walkReturnTypes();
                var returnTypesAreRelatable = this.sourceIsRelatableToTargetInEnclosingTypes(sourceReturnType,
                    targetReturnType, assignableTo, comparisonCache, ast, context, comparisonInfo,
                    isComparingInstantiatedSignatures);
                context.postWalkReturnTypes();
                if (!returnTypesAreRelatable) {
                    return false;
                }
            }

            return targetSig.forAllCorrespondingParameterTypesInThisAndOtherSignature(sourceSig, (targetParamType, sourceParamType, iParam) => {
                context.walkParameterTypes(iParam);
                var areParametersRelatable = this.sourceIsRelatableToTargetInEnclosingTypes(sourceParamType, targetParamType,
                    assignableTo, comparisonCache, ast, context, comparisonInfo, isComparingInstantiatedSignatures);
                if (!areParametersRelatable) {
                    // Switch type1 and type2 enclosing types since we are doing reverse check 
                    context.swapEnclosingTypeWalkers();
                    areParametersRelatable = this.sourceIsRelatableToTargetInEnclosingTypes(targetParamType, sourceParamType,
                        assignableTo, comparisonCache, ast, context, comparisonInfo, isComparingInstantiatedSignatures);
                    context.swapEnclosingTypeWalkers();
                }
                context.postWalkParameterTypes();

                return areParametersRelatable;
            });
        }
    }
}