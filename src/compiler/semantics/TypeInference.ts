/// <reference path='references.ts' />

module TypeScript {
    export class TypeInference {
        private typeParameterToCandidatesMap: Collections.IHashTable<ITypeParameter, Collections.ISet<IType>>;
        private nestedTypeParameters: ISet<ITypeParameter> = Collections.createHashSet(/*capacity:*/ 1);

        constructor(private typeParameters: ITypeParameter[], private typeRelationships: TypeRelationships) {
            this.typeParameterToCandidatesMap = Collections.createHashTable(typeParameters.length * 2);
        }

        public getCandidates(typeParameter: ITypeParameter): Collections.ISet<IType> {
            return this.typeParameterToCandidatesMap.get(typeParameter);
        }

        private getOrCreateCandidates(T: ITypeParameter): ISet<IType> {
            var set = this.typeParameterToCandidatesMap.get(T);
            if (set === null) {
                set = Collections.createHashSet(/*capacity:*/ 1);
                this.typeParameterToCandidatesMap.add(T, set);
            }

            return set;
        }

        // The wildcard type used in the rules above exists solely to ensure that inner type 
        // parameters are not inferred as type arguments for outer type parameters
        private isOrContainsNestedTypeParameter(type: IType): boolean {
            for (var e = this.nestedTypeParameters.getEnumerator(); e.moveNext();) {
                if (this.typeRelationships.isOrContainsTypeParameter(type, e.current())) {
                    return true;
                }
            }

            return false;
        }

        // In certain contexts, inferences for a given set of type parameters are made from a type
        // S, in which those type parameters do not occur, to another type T, in which those type
        // parameters do occur.  Inferences consist of a set of candidate type arguments collected 
        // for each of the type parameters.  The inference process recursively relates S and T to 
        // gather as many inferences as possible:
        //
        // TODO: consider making typeParameters a set.  In practice though the list should be tiny
        // (1-4 tops).  So having it be an array is fine.
        public inferTypes(S: IType, T: IType): void {
            //•	If T is one of the type parameters for which inferences are being made and S or any
            // type occurring in a member of S is not the wildcard type, S is added to the set of 
            // inferences for that type parameter.
            if (T.isTypeParameter() && ArrayUtilities.contains(this.typeParameters, T)) {
                if (!this.isOrContainsNestedTypeParameter(S)) {
                    var candidates = this.getOrCreateCandidates(<ITypeParameter>T);
                    candidates.add(S);
                }
            }

            // •	Otherwise, if S and T are object types, 
            if (T.isObjectType() && S.isObjectType()) {
                // then for each member M in T:
                return this.inferTypesForObjectTypes(<IObjectType>S, <IObjectType>T);
            }
        }

        private inferTypesForObjectTypes(S: IObjectType, T: IObjectType): void {
            // •	Otherwise, if S and T are object types, 
            // then for each member M in T:

            this.inferTypesForObjectTypesProperties(S, T);
            this.inferTypesForObjectTypesCallOrConstructSignatures(S, T, /*callSignatures:*/ true);
            this.inferTypesForObjectTypesCallOrConstructSignatures(S, T, /*callSignatures:*/ false);
            this.inferTypesForObjectTypesIndexSignatures(S, T);
        }

        private inferTypesForObjectTypesProperties(S: IObjectType, T: IObjectType): void {
            // o	If M is a property and S contains a property N with the same name as M, 
            // inferences are made from the type of N to the type of M.

            var T_properties = T.properties();
            for (var i = 0, n = T_properties.length; i < n; i++) {
                var M = T_properties[i];
                var N = S.getProperty(M.name());

                if (N !== null) {
                    this.inferTypes(N.type(), M.type());
                }
            }
        }

        private inferTypesForObjectTypesIndexSignatures(S: IObjectType, T: IObjectType): void {
            // o	If M is a string index signature, then for each string index signature N in S,
            // inferences are made from the type of N to the type of M.
            var T_indexSignatures = T.indexSignatures();
            var S_indexSignatures = S.indexSignatures();

            for (var i = 0, i_max = T_indexSignatures.length; i < i_max; i++) {
                var M = T_indexSignatures[i];

                if (M.isStringIndexSignature()) {
                    for (var j = 0, j_max = S_indexSignatures.length; j < j_max; j++) {
                        var N = S_indexSignatures[j];

                        if (N.isStringIndexSignature()) {
                            this.inferTypes(N.type(), M.type());
                        }
                    }
                }
                else {
                    // o	If M is a numeric index signature, then for each string or numeric 
                    // index signature N in S, inferences are made from the type of N to the type
                    // of M.
                    for (var j = 0, j_max = S_indexSignatures.length; j < j_max; j++) {
                        var N = S_indexSignatures[j];

                        this.inferTypes(N.type(), M.type());
                    }
                }
            }
        }

        private inferTypesForObjectTypesCallOrConstructSignatures(S: IObjectType, T: IObjectType, callSignatures: boolean): void {
            // o	If M is a call signature then for each call signature N in S, if the number of
            // non - optional parameters in N is greater than or equal to that of M, N is 
            // instantiated with the wildcard type as an argument for each type parameter (if any) 
            // and inferences are made from parameter types in N to parameter types in the same 
            // position in M, and from the return type of N to the return type of M.
            var T_signatures = callSignatures ? T.callSignatures() : T.constructSignatures();
            var S_signatures = callSignatures ? S.callSignatures() : S.constructSignatures();

            for (var i = 0, i_max = T_signatures.length; i < i_max; i++) {
                var M = T_signatures[i];

                for (var j = 0, j_max = S_signatures.length; j < j_max; j++) {
                    // Note: instead of doing instantiation as per above.  We instead simply store
                    // the nested type parameters we see, and we filter when we try to add 
                    // candidates.  This allows us to avoid allocations and tracking of wildcards.
                    var N = S_signatures[j];
                    if (N.nonOptionalParameterCount() >= M.nonOptionalParameterCount()) {
                        this.nestedTypeParameters.addRange(N.typeParameters());

                        var maxIndex = MathPrototype.min(M.parameters().length, N.parameters().length);
                        for (var k = 0; k < maxIndex; k++) {
                            this.inferTypes(N.getParameterTypeWithRestExpansion(k), M.getParameterTypeWithRestExpansion(k));
                        }

                        this.inferTypes(N.returnType(), M.returnType());
                    }
                }
            }
        }
    }
}