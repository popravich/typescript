// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='typescript.ts' />

module TypeScript {
    export enum SymbolLinkKind {
        TypedAs,
        ContextuallyTypedAs,

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

    export class PullSymbolGraph {

        public topLevelNodes: LinkList = new LinkList();

        public addTopLevelNode(node: PullSymbol) {
            this.topLevelNodes.addItem(node);
        }

        public deleteTopLevelNode(node: PullSymbol) {
            this.topLevelNodes.remove(tln => tln === node);
        }

        public getTopLevelNodes() { return this.topLevelNodes.find(node => node); }

        public updateTopLevelNodes(map: (item: PullSymbolLink, context: any) => void , context: any) {
            this.topLevelNodes.update(map, context);
        }
    }
}