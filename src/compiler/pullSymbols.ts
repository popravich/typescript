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
        private container: PullSymbol = null;
        private type: PullSymbol = null;

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
        
        public getDeclarations() { <PullDecl[]>this.declarations.find(d => d); }
        
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
        public invalidateCachedInfo(sweepForNewValues=false) {
            // set to null
            this.container = null;
            this.type = null;

            if (sweepForNewValues) {
            }
        }

        // helper methods:
        // getContainer
        // getType
        // hasType
        // setContainer
        // setTypeSymbol
        // invalidateCachedInfo
        // cacheInfo?

        // helper derived classes
        // PullClassSymbol
        // PullInterfaceSymbol
        // PullFunctionSymbol
        // PullSignatureSymbol
    }
}