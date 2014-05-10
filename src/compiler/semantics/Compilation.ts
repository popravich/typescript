module TypeScript {
    export class Compilation {
        private typeRelationships = new TypeRelationships(this);

        public anyType(): IType {
            throw Errors.notYetImplemented();
        }

        public numberType(): IType {
            throw Errors.notYetImplemented();
        }

        public undefinedType(): IType {
            throw Errors.notYetImplemented();
        }

        public emptyObjectType(): IObjectType {
            throw Errors.notYetImplemented();
        }

        public globalNumberInterfaceType(): INamedTypeReference {
            throw Errors.notYetImplemented();
        }

        public globalBooleanInterfaceType(): INamedTypeReference {
            throw Errors.notYetImplemented();
        }

        public globalStringInterfaceType(): INamedTypeReference {
            throw Errors.notYetImplemented();
        }
    }
}