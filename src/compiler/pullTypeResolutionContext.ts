// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='typescript.ts' />

module TypeScript {

    export class PullContextualTypeContext {

        public hadProvisionalErrors = false;

        constructor (public contextualType: PullTypeSymbol,
                     public provisional: bool) { }
    }

    export class PullTypeResolutionContext {
        private contextStack: PullContextualTypeContext[] = [];

        public resolveAggressively = false;
        
        public pushContextualType(type: PullTypeSymbol, provisional: bool) {
            this.contextStack.push(new PullContextualTypeContext(type, provisional));
        }
        
        public popContextualType(): PullContextualTypeContext {
            var tc = this.contextStack.pop();

            return tc;
        }
        
        public getContextualType(): PullTypeSymbol {
            var context = !this.contextStack.length ? null : this.contextStack[this.contextStack.length - 1];
            
            if (context) {
                return context.contextualType;
            }
            
            return null;
        }
        
        public inProvisionalResolution() {
            return (!this.contextStack.length ? false : this.contextStack[this.contextStack.length - 1].provisional);
        }
    }

}