/// <reference path='references.ts' />

module TypeScript {
    export interface IType {
        typeKind(): TypeKind;

        isPrimitive(): boolean;
        isAny(): boolean;
        isNumber(): boolean;
        isBoolean(): boolean;
        isString(): boolean;
        isVoid(): boolean;
        isNull(): boolean;
        isUndefined(): boolean;
        isEnum(): boolean;
        isStringLiteral(): boolean;
        isObjectType(): boolean;
        isNamedTypeReference(): boolean;
        isAnonymousType(): boolean;
        isTypeParameter(): boolean;

        substituteTypes(typeParameterMap: Collections.IHashTable<ITypeParameter, IType>): IType;
    }

    export interface IObjectType extends IType {
        members(): IMember[];

        getProperty(name: string): IProperty;

        properties(): IProperty[];
        callSignatures(): ICallOrConstructSignature[];
        constructSignatures(): ICallOrConstructSignature[];
        indexSignatures(): IIndexSignature[];

        // An object type containing call signatures is said to be a function type.
        isFunctionType(): boolean;

        // A type containing construct signatures is said to be a constructor type.
        isConstructorType(): boolean;
    }

    export class Declaration {
    }

    export interface INamedTypeReference extends IObjectType {
        name(): string;
        originatingDeclaration(): Declaration;
        typeArguments(): IType[];
    }

    export interface ITypeParameter extends IType {
        constraint(): IType;
    }
}