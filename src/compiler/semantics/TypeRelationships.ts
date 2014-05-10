/// <reference path='references.ts' />
import IHashTable = TypeScript.Collections.IHashTable;
import ISet = TypeScript.Collections.ISet;

module TypeScript {
    export class TypeRelationships {
        private identicalTypeRelationCache = new TypeRelationCache(/*resultUponRecursion:*/ true);
        private subtypeRelationCache = new TypeRelationCache(/*resultUponRecursion:*/ true);

        // If we're checking if a type prameter is contained with another type, and we recurse, 
        // then the type was not contained.
        private isOrContainsTypeParameterRelationCache = new TypeRelationCache(/*resultUponRecursion:*/ false);

        // if we recurse while checking if a type parameter is constrained to another type 
        // parameter, then the relation does *not* hold.
        private isConstrainedToRelationCache = new TypeRelationCache(/*resultUponRecursion:*/ false);

        constructor(private compilation: Compilation) {
        }

        public apperentType(type: IType): IType {
            switch (type.typeKind()) {
                // If T is the primitive type Number, Boolean, or String, the apparent type of T is
                // the global interface type ‘Number’, ‘Boolean’, or ‘String’
                case TypeKind.Number:
                    return this.compilation.globalNumberInterfaceType();
                case TypeKind.Boolean:
                    return this.compilation.globalBooleanInterfaceType();
                case TypeKind.String:
                    return this.compilation.globalStringInterfaceType();

                // if T is an enum type, the apparent type of T is the global interface type ‘Number’
                case TypeKind.Enum:
                    return this.compilation.globalNumberInterfaceType();

                // if T is a type parameter, the apparent type of T is the base constraint (section 
                // 3.4.1) of T.
                case TypeKind.TypeParameter:
                    return this.apperentType((<ITypeParameter>type).constraint());

                // Otherwise, the apparent type of T is T itself.
                default:
                    return type;
            }
        }

        private typesAreIdentical(type1: IType, type2: IType): boolean {
            // Two types are considered identical when
            //      they are the same primitive type,
            if (type1.isPrimitive() && type2.isPrimitive()) {
                return type1 === type2;
            }

            // they are the same type parameter, or
            if (type1.isTypeParameter() && type2.isTypeParameter()) {
                return type1 === type2;
            }

            // they are object types with identical sets of members
            if (type1.isObjectType() && type2.isObjectType()) {
                if (type1.isNamedTypeReference() && type2.isNamedTypeReference()) {
                    // Defer to our cache which will take care of infinite recursion.
                    return this.identicalTypeRelationCache.determineRelationship(<INamedTypeReference>type1, <INamedTypeReference>type2, this.namedTypesAreIdentical);
                }
                else {
                    // they are object types with identical sets of members.
                    return this.objectTypeMembersAreIdentical(<IObjectType>type1, <IObjectType>type2);
                }
            }

            return false;
        }

        private namedTypesAreIdentical(type1: INamedTypeReference, type2: INamedTypeReference): boolean {
            // two type references are considered the same when they originate in the same
            // declaration and have identical type arguments

            if (type1.originatingDeclaration() === type2.originatingDeclaration() &&
                this.typeArraysAreIdentical(type1.typeArguments(), type2.typeArguments())) {
                return true;
            }

            // Two types are considered identical when
            // •	they are object types with identical sets of members.
            return this.objectTypeMembersAreIdentical(type1, type2);
        }

        private typeArraysAreIdentical(types1: IType[], types2: IType[]): boolean {
            if (types1.length === types2.length) {
                for (var i = 0, n = types1.length; i < n; i++) {
                    if (!this.typesAreIdentical(types1[i], types2[i])) {
                        return false;
                    }
                }

                return true;
            }

            return false;
        }

        private objectTypeMembersAreIdentical(objectType1: IObjectType, objectType2: IObjectType): boolean {
            if (objectType1.properties().length === objectType2.members().length &&
                objectType1.callSignatures().length === objectType2.callSignatures().length &&
                objectType1.constructSignatures().length === objectType2.constructSignatures().length &&
                objectType1.indexSignatures().length === objectType2.indexSignatures().length) {

                var properties1 = objectType1.properties();
                for (var i = 0, n = properties1.length; i < n; i++) {
                    var property1 = properties1[i];
                    var property2 = objectType2.getProperty(property1.name());

                    if (!this.propertiesAreIdentical(property1, property2)) {
                        return false;
                    }
                }

                if (!this.memberArraysAreIdentical(objectType1.callSignatures(), objectType2.callSignatures())) {
                    return false;
                }

                if (!this.memberArraysAreIdentical(objectType1.constructSignatures(), objectType2.constructSignatures())) {
                    return false;
                }

                if (!this.memberArraysAreIdentical(objectType1.indexSignatures(), objectType2.indexSignatures())) {
                    return false;
                }

                return true;
            }

            return false;
        }

        private memberArraysAreIdentical(members1: IMember[], members2: IMember[]): boolean {
            for (var i = 0, n = members1.length; i < n; i++) {
                var member1 = members1[i];

                if (!this.memberArrayContainsIdenticalMember(member1, members2)) {
                    return false;
                }
            }

            return true;
        }

        private memberArrayContainsIdenticalMember(member1: IMember, members2: IMember[]): boolean {
            for (var i = 0, n = members2.length; i < n; i++) {
                var member2 = members2[i];

                if (this.membersAreIdentical(member1, member2)) {
                    return true;
                }
            }

            return false;
        }

        private membersAreIdentical(member1: IMember, member2: IMember): boolean {
            if (member1.memberKind() !== member2.memberKind()) {
                return false;
            }

            switch (member1.memberKind()) {
                case MemberKind.Property:
                    return this.propertiesAreIdentical(<IProperty>member1, <IProperty>member2);
                case MemberKind.IndexSignature:
                    return this.indexSignaturesAreIdentical(<IIndexSignature>member1, <IIndexSignature>member2);
                case MemberKind.CallSignature: // fall through
                case MemberKind.ConstructSignature:
                    return this.callOrConstructSignaturesAreIdentical(<ICallOrConstructSignature>member1, <ICallOrConstructSignature>member2);
                default:
                    throw Errors.invalidOperation();
            }
        }

        private propertiesAreIdentical(property1: IProperty, property2: IProperty): boolean {
            // Two members are considered identical when
            if (property1.accessibility() === property2.accessibility()) {
                if (property1.accessibility() === Accessibility.Public) {
                    // •	they are public properties with identical names, optionality, and types,
                    return property1.isOptional() === property2.isOptional() &&
                        property1.name() === property2.name() &&
                        this.typesAreIdentical(property1.type(), property2.type());
                }
                else {
                    // •	they are private properties originating in the same declaration and having identical types
                    return property1.originatingDeclaration() === property2.originatingDeclaration() &&
                        this.typesAreIdentical(property1.type(), property2.type());
                }
            }

            return false;
        }

        private indexSignaturesAreIdentical(indexSignature1: IIndexSignature, indexSignature2: IIndexSignature): boolean {
            // Two members are considered identical when
            // •	they are index signatures of identical kind with identical types.
            return indexSignature1.isNumbericIndexSignature() === indexSignature2.isNumbericIndexSignature() &&
                this.typesAreIdentical(indexSignature1.type(), indexSignature2.type());
        }

        private callOrConstructSignaturesAreIdentical(signature1: ICallOrConstructSignature, signature2: ICallOrConstructSignature): boolean {
            // Two call or construct signatures are considered identical when they have the same 
            // number of type parameters and, considering those type parameters pairwise identical,
            // have identical type parameter constraints, identical number of parameters of 
            // identical kinds and types, and identical return types.
            if (signature1.isCallSignature() === signature2.isCallSignature()) {
                var parameters1 = signature1.parameters();
                var parameters2 = signature2.parameters();

                if (signature1.typeParameters().length === signature2.typeParameters().length &&
                    parameters1.length === parameters2.length) {

                    // var indexedTypeParameters = IndexedTypeParameter.take(signature1.typeParameters().length);
                    if (signature1.typeParameters().length > 0) {
                        // Handle the case where these are generic and we want to compare them 
                        // while considering the type parameters pairwise identical.
                        throw Errors.notYetImplemented();
                    }

                    for (var i = 0, n = parameters1.length; i < n; i++) {
                        var parameter1 = parameters1[i];
                        var parameter2 = parameters2[i];

                        // TODO: what does (identical kind) mean?
                        if (!this.typesAreIdentical(parameter1.type(), parameter2.type())) {
                            return false;
                        }
                    }

                    if (!this.typesAreIdentical(signature1.returnType(), signature2.returnType())) {
                        return false;
                    }

                    return true;
                }
            }

            return false;
        }
        
        /** Returns true if type1 is or contains type2. */
        public isOrContainsTypeParameter(type1: IType, typeParameter: ITypeParameter): boolean {
            if (type1 === typeParameter) {
                return true;
            }

            if (type1.isObjectType()) {
                return this.isOrContainsTypeParameterRelationCache.determineRelationship(type1, typeParameter, this.objectTypeIsOrContainsTypeParameter);
            }

            return false;
        }

        private objectTypeIsOrContainsTypeParameter(type1: IObjectType, typeParameter: ITypeParameter): boolean {
            // Note: we don't special case INamedTypeReferences.  Even if we have I<TP> and we're 
            // looking for TP that does *not* count as containment.  After all, I could be an empty
            // object type.

            // Also, we do need to check the constraints of a call/construct signature we encounter.
            // Any type parameter we encounter will either be filtered out itself because it is 
            // a nested type parameter.  Or it will be an ok type parameter (at the starting level
            // or above).  In either case, such a type parameter would not be able to refer to a 
            // nested type parameter in its constraint.
            var properties = type1.properties();
            for (var i = 0, n = properties.length; i < n; i++) {
                var property = properties[i];
                if (this.isOrContainsTypeParameter(property.type(), typeParameter)) {
                    return true;
                }
            }

            var indexSignatures = type1.indexSignatures();
            for (var i = 0, n = indexSignatures.length; i < n; i++) {
                var indexSignature = indexSignatures[i];
                if (this.isOrContainsTypeParameter(indexSignature.type(), typeParameter)) {
                    return true;
                }
            }

            if (this.callOrConstructSignaturesContainsTypeParameter(type1.callSignatures(), typeParameter) ||
                this.callOrConstructSignaturesContainsTypeParameter(type1.constructSignatures(), typeParameter)) {

                return true;
            }

            return false;
        }

        private callOrConstructSignaturesContainsTypeParameter(signatures: ICallOrConstructSignature[], typeParameter: ITypeParameter): boolean {
            for (var i = 0, i_max = signatures.length; i < i_max; i++) {
                var signature = signatures[i];

                if (this.isOrContainsTypeParameter(signature.returnType(), typeParameter)) {
                    return true;
                }

                // Small optimization/deviation.  We do rest expansion here.  That means that if
                // we have a signature like: (a: string, ...b: T[])=>void, we test out 'string' and
                // 'T'.  This allows us to avoid having to check all the members of Array.  
                //
                // I don't believe there is any problem that can occur from this.  Even if someone
                // has extended Array, they can't have added a member that uses a different type
                // parameter.  If this turns out to be false, then we can address it by not doing
                // rest expansion here.
                var parameters = signature.parameters();
                for (var j = 0, j_max = parameters.length; j < j_max; j++) {
                    var parameterType = signature.getParameterTypeWithRestExpansion(j);
                    if (this.isOrContainsTypeParameter(parameterType, typeParameter)) {
                        return true;
                    }
                }
            }

            return false;
        }

        /** Returns true if type1 is a supertype of type2. */
        public isSupertype(type1: IType, type2: IType): boolean {
            return this.isSubtype(type2, type1);
        }

        /** Returns true if type1 is a subtype of type2. */
        public isSubtype(type1: IType, type2: IType): boolean {
            // S is a subtype of a type T, and T is a supertype of S, if one of the following is 
            // true, where S’ denotes the apparent type(section 3.8.1) of S:

            var S = type1;
            var T = type2;
            var S_prime = this.apperentType(S);

            // •	S and T are identical types.
            if (this.typesAreIdentical(S, T)) {
                return true;
            }

            // •	T is the Any type.
            if (T.isAny()) {
                return true;
            }

            // •	S is the Undefined type.
            if (S.isUndefined()) {
                return true;
            }

            // •	S is the Null type and T is not the Undefined type.
            if (S.isNull() && !T.isUndefined()) {
                return true;
            }

            // •	S is an enum type and T is the primitive type Number.
            if (S.isEnum() && T.isNumber()) {
                return true;
            }

            // •	S is a string literal type and T is the primitive type String.
            if (S.isStringLiteral() && T.isString()) {
                return true;
            }

            // •	S and T are type parameters, and S is directly or indirectly constrained to T.
            if (S.isTypeParameter() && T.isTypeParameter()) {
                return this.isDirectlyOrIndirectlyConstrainedTo(<ITypeParameter>S, <ITypeParameter>T);
            }

            // •	S’ and T are object types and, for each member M in T, one of the following is true
            if (S_prime.isObjectType() && T.isObjectType()) {
                if (S_prime.isNamedTypeReference() && T.isNamedTypeReference()) {
                    return this.subtypeRelationCache.determineRelationship(<INamedTypeReference>S_prime, <INamedTypeReference>T, this.objectTypeIsSubtype);
                }
                else {
                    return this.objectTypeIsSubtype(<IObjectType>S_prime, <IObjectType>T);
                }
            }

            return false;
        }

        /** Returns true if type1 is a assignable to type2. */
        public isAssignableTo(type1: IType, type2: IType): boolean {
            var S = type1;
            var T = type2;

            // The assignment compatibility and subtyping rules differ only in that
            if (this.isSubtype(S, T)) {
                return true;
            }

            // •	the Any type is assignable to, but not a subtype of, all types, and
            if (S.isAny()) {
                // The T.isAny() case was handled in the subtype code.
                return true;
            }

            // •	the primitive type Number is assignable to, but not a subtype of, all enum types.
            if (S.isNumber() && T.isEnum()) {
                return true;
            }

            return false;
        }

        private objectTypeIsSubtype(S_prime: IObjectType, T: IObjectType): boolean {
            // •	S’ and T are object types and, for each member M in T, one of the following is true:
            var T_members = T.members();
            for (var i = 0, n = T_members.length; i < n; i++) {
                var M = T_members[i];

                if (!this.canFindCorrespondingSubtypeMember(S_prime, M)) {
                    return false;
                }
            }

            return true;
        }

        private canFindCorrespondingSubtypeMember(S_prime: IObjectType, M: IMember): boolean {
            // •	S’ and T are object types and, for each member M in T, one of the following is true:

            // o	M is a property and S’ contains a property N where
            if (M.isProperty()) {
                var M_property = <IProperty>M;

                var N = S_prime.getProperty(M_property.name());
                if (N !== null) {
                    // 	M and N have the same name,
                    // 	the type of N is a subtype of that of M,
                    // 	M and N are both public or both private, and
                    // 	if M is a required property, N is also a required property.
                    if (M_property.accessibility() === N.accessibility()) {
                        // If M is optional, then there is no restriction on N.  If M is required, 
                        // then N must be required (i.e. not-optional) as well.
                        if (M_property.isOptional() || !N.isOptional()) {
                            if (this.isSubtype(N.type(), M_property.type())) {
                                return true;
                            }
                        }
                    }
                }

                // o	M is an optional property and S’ contains no property of the same name as M.
                if (M_property.isOptional()) {
                    if (S_prime.getProperty(M_property.name()) === null) {
                        return true;
                    }
                }
            }

            // o	M is a non-specialized call or construct signature and S’ contains a call 
            //      or construct signature N where
            if (M.isCallSignature() || M.isConstructSignature()) {
                var M_callOrConstructSignature = <ICallOrConstructSignature>M;

                if (!M_callOrConstructSignature.isSpecialized() &&
                    this.canFindCorrespondingSubtypeCallOrConstructSignature(S_prime, M_callOrConstructSignature)) {

                    return true;
                }
            }

            if (M.isIndexSignature()) {
                var M_indexSignature = <IIndexSignature>M;

                // o	M is a string index signature of type U and S’ contains a string index 
                //      signature of a type that is a subtype of U.
                if (M_indexSignature.isStringIndexSignature()) {
                    var S_prime_indexSignatures = S_prime.indexSignatures();
                    for (var i = 0, n = S_prime_indexSignatures.length; i < n; i++) {
                        var S_prime_indexSignature = S_prime_indexSignatures[i];

                        if (S_prime_indexSignature.isStringIndexSignature() &&
                            this.isSubtype(S_prime_indexSignature.type(), M_indexSignature.type())) {

                            return true;
                        }
                    }
                }

                // o	M is a numeric index signature of type U and S’ contains a string or 
                // numeric index signature of a type that is a subtype of U.
                if (M_indexSignature.isNumbericIndexSignature()) {
                    var S_prime_indexSignatures = S_prime.indexSignatures();
                    for (var i = 0, n = S_prime_indexSignatures.length; i < n; i++) {
                        var S_prime_indexSignature = S_prime_indexSignatures[i];

                        if (this.isSubtype(S_prime_indexSignature.type(), M_indexSignature.type())) {
                            return true;
                        }
                    }
                }
            }

            return false;
        }

        private canFindCorrespondingSubtypeCallOrConstructSignature(S_prime: IObjectType, M: ICallOrConstructSignature): boolean {
            // o	M is a non-specialized call or construct signature and S’ contains a call or 
            // construct signature N where,

            // 	the signatures are of the same kind(call or construct),
            var S_prime_signatures = M.isCallSignature() ? S_prime.callSignatures() : S_prime.constructSignatures();

            for (var i = 0, n = S_prime_signatures.length; i < n; i++) {
                var N = S_prime_signatures[i];

                // 	the number of non-optional parameters in N is less than or equal to that of M,
                if (N.nonOptionalParameterCount() <= M.nonOptionalParameterCount()) {
                    // 	N can be successfully instantiated in the context of M (section 3.8.5),
                    var N_instantiated = this.instantiateInTheContextOf(N, M);

                    if (N_instantiated !== null) {
                        // 	each parameter type in the instantiation of N is a subtype or supertype 
                        // of the corresponding parameter type in M for parameter positions that are present
                        // in both signatures, and
                        if (this.eachParameterTypeIsSubtypeOrSupertype(N, M)) {
                            // 	the result type of M is Void, or the result type of the instantiation of N 
                            // is a subtype of that of M.
                            if (M.returnType().isVoid() || this.isSubtype(N_instantiated.returnType(), M.returnType())) {
                                return true;
                            }
                        }
                    }
                }
            }

            return false;
        }

        private eachParameterTypeIsSubtypeOrSupertype(N: IInstantiatedCallOrConstructSignature, M: ICallOrConstructSignature): boolean {
            // 	each parameter type in the instantiation of N is a subtype or supertype 
            // of the corresponding parameter type in M for parameter positions that are present
            // in both signatures, and

            // Note: by using going up to the last parameter, that means that if we have a 'rest'
            // parameter, then we'll at least index into the first element of it.  i.e. if we're
            // comparing:
            //
            //      (a: Object, ...: Object[]) => void;
            //      (a: Number, ...: String[]) => void;
            //
            // We'll compare "Number" to "Object", and then "String" to "Object".
            var maxIndex = MathPrototype.min(N.parameters().length, M.parameters().length);

            // When comparing call or construct signatures, parameter names are ignored and rest 
            // parameters correspond to an unbounded expansion of optional parameters of the rest 
            // parameter element type.
            for (var i = 0; i < maxIndex; i++) {
                var N_parameterType = N.getParameterTypeWithRestExpansion(i);
                var M_parameterType = M.getParameterTypeWithRestExpansion(i);

                Debug.assert(N_parameterType !== null && M_parameterType !== null);
                if (!this.isSubtype(N_parameterType, M_parameterType) && !this.isSupertype(N_parameterType, M_parameterType)) {
                    return false;
                }
            }

            return true;
        }

        private isDirectlyOrIndirectlyConstrainedTo(S: ITypeParameter, T: ITypeParameter): boolean {
            // Quick check.  If S doesn't even have a type parameter constraint, then these two
            // tyeps couldn't not be related.
            if (!S.constraint().isTypeParameter()) {
                return false;
            }

            // Check for direct constraint.
            if (S.constraint() === T) {
                return true;
            }

            // Wasn't directly constrained.  Check for an indirect relation between the constraint 
            // and T.  Use the relation cache to prevent recursion.
            return this.isConstrainedToRelationCache.determineRelationship(S.constraint(), T, this.isDirectlyOrIndirectlyConstrainedTo);
        }

        private instantiateInTheContextOf(A: ICallOrConstructSignature, B: ICallOrConstructSignature): IInstantiatedCallOrConstructSignature {
            // In sections 3.8.3 and 3.8.4, to determine whether a call or construct signature A is
            // a subtype of or assignable to a call or construct signature B, A is instantiated in
            // the context of B. 
            Debug.assert(A.isCallSignature() === B.isCallSignature());

            // If A is a non-generic signature, the result of this process is simply A. Otherwise, 
            // type arguments for A are inferred from B producing an instantiation of A that can be
            // related to B:
            if (!A.isGenericSignature()) {
                return A;
            }

            // •	Using the process described in 3.8.6, inferences for A’s type parameters are 
            // made from each parameter type in B to the corresponding parameter type in A for 
            // those parameter positions that are present in both signatures.
            var typeParameterToCandidatesMap: IHashTable<ITypeParameter, ISet<IType>>;

            // Note: by using going up to the last parameter, that means that if we have a 'rest'
            // parameter, then we'll at least index into the first element of it.  i.e. if we're
            // comparing:
            //
            //      <T>(a: Object, ...: T[]) => void;
            //         (a: Object, Number) => void;
            //
            // We'll compare "Number" to "Object", and then "Number" to "T".
            var maxIndex = MathPrototype.min(A.parameters().length, B.parameters().length);
            var A_typeParameters = A.typeParameters();

            var typeInference = new TypeInference(A_typeParameters, this);

            for (var i = 0; i < maxIndex; i++) {
                var A_parameterType = A.getParameterTypeWithRestExpansion(i);
                var B_parameterType = B.getParameterTypeWithRestExpansion(i);

                typeInference.inferTypes(B_parameterType, A_parameterType);
            }

            var inferredTypeArguments: IType[] = [];
            var typeParameterMap = Collections.createHashTable<ITypeParameter, IType>(/*capacity:*/ 8);

            for (var i = 0, n = A_typeParameters.length; i < n; i++) {
                var A_typeParameter = A_typeParameters[i];
                var candidates = typeInference.getCandidates(A_typeParameter);

                // •	The inferred type argument for each type parameter is the best common type
                // (section 3.10) of the set of inferences made for that type parameter.
                var inferredTypeArgument = this.bestCommonType(candidates);
                inferredTypeArguments.push(inferredTypeArgument);

                typeParameterMap.add(A_typeParameter, inferredTypeArgument);
            }

            // •	Provided all inferred type arguments satisfy their corresponding type 
            // parameter constraints, the result is an instantiation of A with the inferred 
            // type arguments.
            for (var i = 0, n = A_typeParameters.length; i < n; i++) {
                var A_typeParameter = A_typeParameters[i];
                var inferredTypeArgument = inferredTypeArguments[i];

                if (!this.satisfiesConstraint(inferredTypeArgument, A_typeParameter, typeParameterMap)) {
                    return null;
                }
            }

            // the result is an instantiation of A with the inferred type arguments.
            return A.instantiate(inferredTypeArguments);
        }

        private satisfiesConstraint(typeArgument: IType, typeParameter: ITypeParameter, typeParameterMap: IHashTable<ITypeParameter, IType>): boolean {
            // A type argument satisfies a type parameter constraint if the type argument is 
            // assignable to(section 3.8.4) the constraint type once type arguments are substituted
            // for type parameters
            var instantiatedConstraint = typeParameter.constraint().substituteTypes(typeParameterMap);
            return this.isAssignableTo(typeArgument, instantiatedConstraint);
        }

        private bestCommonType(types: ISet<IType>): IType {
            // For an empty set of types, the best common type is an empty object type (the type {}).
            if (types === null || types.count() === 0) {
                return this.compilation.emptyObjectType();
            }

            var currentBest = null;

            outer:
            for (var e1 = types.getEnumerator(); e1.moveNext();) {
                var t1 = e1.current();

                for (var e2 = types.getEnumerator(); e2.moveNext();) {
                    var t2 = e2.current();

                    if (t1 === t2) {
                        continue;
                    }

                    // For a non - empty set of types { T1, T2, …, Tn }, the best common type is
                    //  the one Tx in the set that is a supertype of every Tn
                    if (!this.isSupertype(t1, t2)) {
                        // t1 was not a supertype of t2.  It can't be the best common type.
                        continue outer;
                    }
                }

                if (currentBest === null) {
                    // Haven't seen a best type yet.  So this is the current best candidate.
                    currentBest = t1;
                }
                else {
                    // It is possible that no such type exists or more than one such type exists, 
                    // in which case the best common type is an empty object type(the type {}).
                    return this.compilation.emptyObjectType();
                }
            }

            // It is possible that no such type exists or more than one such type exists, 
            // in which case the best common type is an empty object type(the type {}).
            return currentBest === null
                ? this.compilation.emptyObjectType()
                : currentBest;
        }
    }

    class TypeRelationCache {
        // Specifies the if the relation holds if recursion is seen.  For example, subtyping 
        // assumes the relation exists if recursion is encountered.  However, containment 
        // assumes the relation does not exist if recursion is encountered.
        constructor(private resultUponRecursion: boolean) {
        }

        public determineRelationship(type1: IType, type2: IType, predicate: (t1: IType, t2: IType) => boolean): boolean {
            // Classes and interfaces can reference themselves in their internal structure, in
            // effect creating recursive types with infinite nesting. Types such as this are 
            // perfectly valid but require special treatment when determining type relationships. 
            // Specifically, when comparing references to two named types S and T for a given 
            // relationship(identity, subtype, or assignability), the relationship in question is 
            // assumed to be true for every directly or indirectly nested occurrence of references 
            // to the same S and T(where same means originating in the same declaration). For 
            // example, consider the identity relationship between ‘A’ above and ‘B’ below:

            var currentRelation = this.currentRelation(type1, type2);
            switch (currentRelation) {
                default: throw Errors.invalidOperation();

                // if we've already computed the relation, then return that result.
                case TypeRelationKind.Yes: return true;
                case TypeRelationKind.No: return false;
                case TypeRelationKind.Computing:
                    // If we've already been examining this relation, then set to the 
                    // value specified for recursion.
                    this.setRelation(type1, type2, this.resultUponRecursion ? TypeRelationKind.Yes : TypeRelationKind.No);
                    return this.resultUponRecursion;
                case TypeRelationKind.Unknown:
                    // We've never looked for a relation between these two types before.  
                    // Mark that we're computing the relation.  That way if we see the 
                    // types again we'll consider them identical.
                    this.setRelation(type1, type2, TypeRelationKind.Computing);
                    break;
            }

            var result = predicate(type1, type2);
            this.setRelation(type1, type2, result ? TypeRelationKind.Yes : TypeRelationKind.No);

            return result;
        }

        private currentRelation(type1: IType, type2: IType): TypeRelationKind {
            throw Errors.notYetImplemented();
        }

        private setRelation(type1: IType, type2: IType, kind: TypeRelationKind): void {
            throw Errors.notYetImplemented();
        }
    }

    enum TypeRelationKind {
        Unknown,
        Computing,
        Yes,
        No,
    }
}