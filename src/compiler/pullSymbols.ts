// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='typescript.ts' />

module TypeScript {

    export enum PullSymbolVisibility {
        Private,
        Public
    }

    export var pullSymbolID = 0

    export class PullSymbol {

        // private state
        private pullSymbolID = pullSymbolID++;

        private outgoingLinks: LinkList = new LinkList();
        private incomingLinks: LinkList = new LinkList();
        private declarations: LinkList = new LinkList();

        private name: string;

        private declKind: DeclKind;

        // caches - free these on invalidate
        private container: PullTypeSymbol = null;
        private type: PullTypeSymbol = null;

        private hasBeenResolved = false;

        // public surface area
        public getSymbolID() { return this.pullSymbolID; }

        public isType() { 
            return (this.declKind & DeclKind.SomeType) != 0; 
        }

        public isSignature() {
            return (this.declKind & DeclKind.SomeSignature) != 0;
        }

        public isArray() {
            return (this.declKind & DeclKind.Array) != 0;
        }

        constructor (name: string, declKind: DeclKind) {
            this.name = name;
            this.declKind = declKind;
        }

        public getName() { return this.name; }

        public getKind() { return this.declKind; }        
        public setKind(declType: DeclKind) { this.declKind = declType; }

        // declaration methods
        public addDeclaration(decl: PullDecl) { this.declarations.addItem(decl); }
        
        public getDeclarations() { return <PullDecl[]>this.declarations.find(d => d); }
        
        public removeDeclaration(decl: PullDecl) { this.declarations.remove(d => d === decl);  }
        
        public updateDeclarations(map: (item: PullDecl, context: any) => void , context: any) {
            this.declarations.update(map, context);
        }

        // link methods
        public addOutgoingLink(linkTo: PullSymbol, kind: SymbolLinkKind) {
            var link = new PullSymbolLink(this, linkTo, kind);
            this.outgoingLinks.addItem(link);
            linkTo.incomingLinks.addItem(link);
        }

        public findOutgoingLinks(p: (psl: PullSymbolLink) => bool) {
            return <PullSymbolLink[]>this.outgoingLinks.find(p);
        }

        public findIncomingLinks(p: (psl: PullSymbolLink) => bool) {
            return <PullSymbolLink[]>this.incomingLinks.find(p);
        }

        public removeOutgoingLink(link: PullSymbolLink) {
            this.outgoingLinks.remove (p => p === link);
            link.end.incomingLinks.remove (p => p === link);
        }

        public updateLinks(map: (item: PullSymbolLink, context: any) => void , context: any) {
            this.outgoingLinks.update(map, context);
        }
        
        // cache and convience methods
        public invalidate(sweepForNewValues=false) {
            // set to null
            this.container = null;
            this.type = null;
            
            this.hasBeenResolved = false;

            // PULLTODO: Fill this out...
            if (sweepForNewValues) {
            }
        }

        public setContainer(containerSymbol: PullTypeSymbol, relationshipKind: SymbolLinkKind) {
            containerSymbol.addOutgoingLink(this, relationshipKind);
            this.addOutgoingLink(containerSymbol, SymbolLinkKind.ContainedBy);
            this.container = containerSymbol;
        }

        public getContainer(): PullSymbol {
            if (this.container) {
                return this.container;
            }

            var containerList = this.findOutgoingLinks(link => link.kind == SymbolLinkKind.ContainedBy);

            if (containerList.length) {
                return containerList[0].end;
            }

            return null;
        }
        
        public setType(typeRef: PullTypeSymbol) {
            this.addOutgoingLink(typeRef, SymbolLinkKind.TypedAs);
            this.type = typeRef;
        }
        
        public getType(): PullTypeSymbol {
            if (this.type) {
                return this.type;
            }

            var typeList = this.findOutgoingLinks(link => link.kind == SymbolLinkKind.TypedAs);

            if (typeList.length) {
                return <PullTypeSymbol>typeList[0].end;
            }

            return null;
        }

        public isTyped() {
            return this.getType() != null;
        }

        public setResolved() { this.hasBeenResolved = true; }
        public isResolved() { return this.hasBeenResolved; }

        // helper methods:
        // cacheInfo?

        // helper derived classes
        // PullClassSymbol
        // PullInterfaceSymbol
    }

    export class PullSignatureSymbol extends PullSymbol {
        private parameters: PullSymbol[] = [];
        private returnType: PullTypeSymbol = null;

        public isDefinition() { return false; }

        public addParameter(parameter: PullSymbol) {
            this.parameters[this.parameters.length] = parameter;
            this.addOutgoingLink(parameter, SymbolLinkKind.Parameter);
        }

        public setReturnType(returnType: PullTypeSymbol) {
            this.returnType = returnType;
            this.addOutgoingLink(returnType, SymbolLinkKind.ReturnType);
        }

        public getParameters() {
            var params: PullSymbol[] = [];

            for (var i = 0; i < this.parameters.length; i++) {
                params[params.length] = this.parameters[i];
            }

            return params;
        }

        public getReturnType() {
            return this.returnType;
        }
    }

    export class PullTypeSymbol extends PullSymbol {
        private members: PullSymbol[] = [];
        private publicMembers: PullSymbol[] = [];

        private implementedTypes: PullTypeSymbol[] = [];
        private extendedTypes: PullTypeSymbol[] = [];
        
        private callSignatures: PullSignatureSymbol[] = [];
        private constructSignatures: PullSignatureSymbol[] = [];
        private indexSignatures: PullSignatureSymbol[] = [];

        public isType() { return true; }
        public hasBrand() { return false; }
        public isInstanceType() { return false; }

        public getType() { return this; }

        public addMember(memberSymbol: PullSymbol, linkKind: SymbolLinkKind) { 
            this.members[this.members.length] = memberSymbol;

            if (linkKind == SymbolLinkKind.PublicProperty) {
                this.publicMembers[this.publicMembers.length] = memberSymbol;
            }

            memberSymbol.setContainer(this, linkKind);
        }

        public getMembers() { return this.members;  }
        public getPublicMembers() { return this.publicMembers; }
        
        public addCallSignature(callSignature: PullSignatureSymbol) { 
            this.addOutgoingLink(callSignature, SymbolLinkKind.CallSignature);
            this.callSignatures[this.callSignatures.length] = callSignature;
        }

        public addConstructSignature(constructSignature: PullSignatureSymbol) {
            this.addOutgoingLink(constructSignature, SymbolLinkKind.ConstructSignature);
            this.constructSignatures[this.constructSignatures.length] = constructSignature;
        }

        public addIndexSignature(indexSignature: PullSignatureSymbol) {
            this.addOutgoingLink(indexSignature, SymbolLinkKind.IndexSignature);
            this.indexSignatures[this.indexSignatures.length] = indexSignature;
        }

        public getCallSignatures() { 
            return this.callSignatures;
        }

        public getConstructSignatures() { 
            return this.constructSignatures;
        }

        public getIndexSignatures() {
            return this.indexSignatures;
        }

        public invalidate(sweepForNewValues=false) {
            this.members = [];
            this.publicMembers = [];
            this.callSignatures = [];
            this.constructSignatures = [];
            this.indexSignatures = [];
            this.implementedTypes = [];
            this.extendedTypes = [];

            super.invalidate(sweepForNewValues);
        }

        public addImplementedType(interfaceType: PullTypeSymbol) {
            this.implementedTypes[this.implementedTypes.length] = interfaceType;

            this.addOutgoingLink(interfaceType, SymbolLinkKind.Implements);
        }

        public getImplementedTypes() {
            return this.implementedTypes;
        }

        public addExtendedType(extendedType: PullTypeSymbol) {
            this.extendedTypes[this.extendedTypes.length] = extendedType;

            this.addOutgoingLink(extendedType, SymbolLinkKind.Extends);
        }

        public getExtendedTypes() {
            return this.extendedTypes;
        }

        public findMember(name: string) {
            for (var i = 0; i < this.members.length; i++) {
                if (this.members[i].getName() == name) {
                    return this.members[i];
                }
            }

            // couldn't find the symbol?  look in the parents
            var parentMemberSym: PullSymbol; 

            for (var i = 0; i < this.extendedTypes.length; i++) {
                parentMemberSym = this.extendedTypes[i].findMember(name);
                
                if (parentMemberSym) {
                    return parentMemberSym;
                }
            }

            return null;
        }
    }

    export class PullClassSymbol extends PullTypeSymbol {
        private instanceType: PullTypeSymbol = null;
        private staticMembers: PullSymbol[] = []; // constructor and static members

        public hasBrand() { return true; }

        public setInstanceType(instanceType: PullTypeSymbol) {
            this.addOutgoingLink(instanceType, SymbolLinkKind.InstanceType);
            this.instanceType = instanceType; 
        }
        public getInstanceType() { return this.instanceType; }

        public addInstanceMember(instanceMember: PullSymbol, linkKind: SymbolLinkKind) {
            this.instanceType.addMember(instanceMember, linkKind);
        }

        public addStaticMember(staticMember: PullSymbol) {
            this.addOutgoingLink(staticMember, SymbolLinkKind.StaticProperty);
            this.staticMembers[this.staticMembers.length] = staticMember;
        }
        public getStaticMembers() { return this.staticMembers; }
    }

    export class PullClassInstanceSymbol extends PullClassSymbol {
        public isInstanceType() { return true; }
    }
    
    export class PullDefinitionSignatureSymbol extends PullSignatureSymbol {
        public isDefinition() { return true; }
    }

    export class PullFunctionSymbol extends PullTypeSymbol {
        private overloadSignatures: PullSignatureSymbol[] = [];
        private definitionSignature: PullDefinitionSignatureSymbol = null;
        private returnType: PullSymbol = null;

        public invalidate(sweepForNewValues = false) {
            super.invalidate(sweepForNewValues);

            this.overloadSignatures = [];
            this.definitionSignature = null;
        }

        public addSignature(signature: PullSignatureSymbol) {
            this.addOutgoingLink(signature, SymbolLinkKind.CallSignature);

            if (signature.isDefinition()) {
                this.definitionSignature = <PullDefinitionSignatureSymbol>signature;
            }
            else {
                this.overloadSignatures[this.overloadSignatures.length] = signature;
            }
        }

        public getSignatures() {
            var sigs: PullSignatureSymbol[] = [];

            for (var i = 0; i < this.overloadSignatures.length; i++) {
                sigs[sigs.length] = this.overloadSignatures[i];
            }

            if (this.definitionSignature) {
                sigs[sigs.length] = this.definitionSignature;
            }

            return sigs;
        }

        public setReturnType(returnType: PullSymbol) {
            this.returnType = returnType;

            this.addOutgoingLink(returnType, SymbolLinkKind.ReturnType);
        }
    }

    export function specializeToArrayType(arrayInterfaceType: PullTypeSymbol, typeToReplace: PullTypeSymbol, typeToSpecializeTo: PullTypeSymbol, resolver: PullTypeResolver) {

        // For the time-being, only specialize interface types
        // this way we can assume only public members and non-static methods
        if ((arrayInterfaceType.getKind() & DeclKind.Interface) == 0) {
            return;
        }

        // PULLTODO: Recursive reference bug
        var newArrayType: PullTypeSymbol = new PullTypeSymbol(arrayInterfaceType.getName(), arrayInterfaceType.getKind() | DeclKind.Array);
        newArrayType.addDeclaration(arrayInterfaceType.getDeclarations()[0]);

        newArrayType.addOutgoingLink(typeToSpecializeTo, SymbolLinkKind.ArrayOf);

        var field: PullSymbol = null;
        var newField: PullSymbol = null;
        var fieldType: PullTypeSymbol = null;
        
        var method: PullFunctionSymbol = null;    
        var newMethod: PullFunctionSymbol = null;
        
        var signatures: PullSignatureSymbol[] = null;
        var newSignature: PullSignatureSymbol = null;

        var parameters: PullSymbol[] = null;
        var newParameter: PullSymbol = null;
        var parameterType: PullTypeSymbol = null;

        var returnType: PullTypeSymbol = null;
        var newReturnType: PullTypeSymbol = null;

        var members = arrayInterfaceType.getMembers();
            
        for (var i = 0; i < members.length; i++) {
                
            if (members[i].isType()) { // must be a method
                method = <PullFunctionSymbol> members[i];

                resolver.resolveDeclaredSymbol(method);

                newMethod = new PullFunctionSymbol(method.getName(), method.getKind());
                newMethod.addDeclaration(method.getDeclarations()[0]);

                signatures = method.getCallSignatures();

                // specialize each signature
                for (var j = 0; j < signatures.length; j++) {

                    newSignature = new PullSignatureSymbol("", DeclKind.CallSignature);
                    newSignature.addDeclaration(signatures[j].getDeclarations[0]);

                    parameters = signatures[j].getParameters();
                    returnType = signatures[j].getReturnType();

                    if (returnType == typeToReplace) {
                        newSignature.setReturnType(typeToSpecializeTo);
                    }
                    else {
                        newSignature.setReturnType(returnType);
                    }

                    for (var k = 0; k < parameters.length; k++) {
                        newParameter = new PullSymbol(parameters[k].getName(), parameters[k].getKind());

                        parameterType = parameters[k].getType();

                        if (parameterType == typeToReplace) {
                            newParameter.setType(typeToSpecializeTo);
                        }
                        else {
                            newParameter.setType(parameterType);
                        }

                        newSignature.addParameter(newParameter);
                    }

                    newMethod.addSignature(newSignature);
                }

                newArrayType.addMember(newMethod, SymbolLinkKind.PublicProperty);
            }

            else { // must be a field
                field = members[i];

                resolver.resolveDeclaredSymbol(field);

                newField = new PullSymbol(field.getName(), field.getKind());
                newField.addDeclaration(field.getDeclarations()[0]);
                
                fieldType = field.getType();

                if (fieldType == typeToReplace) {
                    newField.setType(typeToSpecializeTo);
                }
                else {
                    newField.setType(fieldType);
                }

                newArrayType.addMember(newField, SymbolLinkKind.PublicProperty);
            }
        }

        return newArrayType;
    }

}