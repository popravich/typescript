// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='typescript.ts' />

module TypeScript {
    export enum SymbolLinkKind {
        TypedAs,
        ContextuallyTypedAs,
        ProvidesInferredType,

        InstanceType,
        ArrayOf,

        PublicProperty,
        PrivateProperty,
        StaticProperty,

        Aliases,

        ContainedBy,

        Extends,
        Implements,

        Parameter,
        ReturnType,

        CallSignature,
        ConstructSignature,
        IndexSignature,
    }
    
    export var linkID = 0; // PULLTODO: Prune these if not in use

    export class IListItem {
        public next: IListItem = null;
        public prev: IListItem = null;

        constructor (public value: any) { }
    }

    export class LinkList {
        public head: IListItem = null;
        public last: IListItem = null;

        public addItem(item: any) {
            if (!this.head) {
                this.head = new IListItem(item);
                this.last = this.head;
                return;
            }
            
            this.last.next = new IListItem(item);
            this.last.next.prev = this.last;
            this.last = this.last.next;
        }

        // PULLTODO: Register callbacks for caching
        public find(p: (rn: any) => bool) {
            var node = this.head;
            var vals: any[] = [];

            while (node) {

                if (p(node.value)) {
                    vals[vals.length] = node.value;
                }
                node = node.next;
            }

            return vals;
        }

        public remove(p: (item: any) => bool) {
            var node = this.head;
            var prev: IListItem = null;
            var next: IListItem = null;

            while (node) {

                if (p(node.value)) {

                    prev = node.prev;
                    next = node.next;
                    prev.next = next;
                    next.prev = prev;
                    node = prev;
                }

                node = node.next;
            }
        }

        public update(map: (item: any, context: any) => void, context: any ) {
            var node = this.head;

            while (node) {
                map(node.value, context);
                
                node = node.next;
            }
        }
    }

    export class PullSymbolLink {
        public id = linkID++;
        public data: any;
        constructor (public start: PullSymbol, public end: PullSymbol, public kind: SymbolLinkKind) { }
    }

    export enum PullSymbolUpdateKind {
        NoUpdate,
        MemberRemoved,
        MemberAdded,
        SymbolRemoved,
    }

    export class PullSymbolUpdate {
        public updateKind = PullSymbolUpdateKind.NoUpdate;
        public symbolUpdated: PullSymbol = null;
        public oldMember: PullSymbol = null;
        public newMember: PullSymbol = null;
    }

    export class PullSymbolGraphUpdater {

        // for now, remove links - later on, see what happens if we leave stuff 'dangling'
        public RemoveSymbol(symbolToRemove: PullSymbol) {
            // - remove the symbol from its parent
            //  - if the parent is null, the symbol is global
            //  - what if the signature is a function?

            // - remove each of the symbol's outgoing links

            // - for each incoming link, update the symbol pointing in

            // - invalidate everything along the way
        }

        public AddSymbol(symbolToAdd: PullSymbol, symbolToAddTo: PullTypeSymbol) {

        }

    }
}