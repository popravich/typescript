///<reference path='references.ts' />

module TypeScript {
    export class SyntaxNode implements ISyntaxNodeOrToken {
        public parent: ISyntaxElement = null;

        constructor(private _data: number) {
            // this._data = parsedInStrictMode ? SyntaxConstants.NodeParsedInStrictModeMask : 0;
        }

        public resetData(): void {
            this._data = this.parsedInStrictMode() ? SyntaxConstants.NodeParsedInStrictModeMask : 0
        }

        public syntaxTree(): SyntaxTree {
            return this.parent.syntaxTree();
        }

        public kind(): SyntaxKind {
            throw Errors.abstract();
        }

        public childCount(): number {
            throw Errors.abstract();
        }

        public childAt(slot: number): ISyntaxElement {
            throw Errors.abstract();
        }

        public isShared(): boolean {
            return false;
        }

        public fullStart(): number {
            var firstToken = this.firstToken();
            return firstToken ? firstToken.fullStart() : -1;
        }

        public fullEnd(): number {
            var lastToken = this.lastToken();
            return lastToken ? lastToken.fullEnd() : -1;
        }

        public start(): number {
            var firstToken = this.firstToken();
            return firstToken ? firstToken.start() : -1;
        }

        public end(): number {
            var lastToken = this.lastToken();
            return lastToken ? lastToken.end() : -1;
        }

        // Returns the first non-missing token inside this node (or null if there are no such token).
        public firstToken(): ISyntaxToken {
            for (var i = 0, n = this.childCount(); i < n; i++) {
                var element = this.childAt(i);

                if (element !== null) {
                    if (element.kind() === SyntaxKind.EndOfFileToken) {
                        return <ISyntaxToken>element;
                    }

                    var token = element.firstToken();
                    if (token && token.fullWidth() > 0) {
                        return token;
                    }
                }
            }

            return null;
        }

        // Returns the last non-missing token inside this node (or null if there are no such token).
        public lastToken(): ISyntaxToken {
            for (var i = this.childCount() - 1; i >= 0; i--) {
                var element = this.childAt(i);

                if (element !== null) {
                    if (element.kind() === SyntaxKind.EndOfFileToken) {
                        return <ISyntaxToken>element;
                    }

                    var token = element.lastToken();
                    if (token && token.fullWidth() > 0) {
                        return token;
                    }
                }
            }

            return null;
        }

        public toJSON(key: any): any {
            var result: any = {}

            for (var name in SyntaxKind) {
                if (<any>SyntaxKind[name] === this.kind()) {
                    result.kind = name;
                    break;
                }
            }

            result.fullStart = this.fullStart();
            result.fullEnd = this.fullEnd();

            result.start = this.start();
            result.end = this.end();

            result.fullWidth = this.fullWidth();
            result.width = this.width();

            if (this.isIncrementallyUnusable()) {
                result.isIncrementallyUnusable = true;
            }

            if (this.parsedInStrictMode()) {
                result.parsedInStrictMode = true;
            }

            var thisAsIndexable: IIndexable<any> = <any>this;
            for (var i = 0, n = this.childCount(); i < n; i++) {
                var value = this.childAt(i);

                if (value) {
                    for (var name in this) {
                        if (value === thisAsIndexable[name]) {
                            result[name] = value;
                            break;
                        }
                    }
                }
            }

            return result;
        }

        public hasLeadingTrivia(): boolean {
            return this.lastToken().hasLeadingTrivia();
        }

        public hasTrailingTrivia(): boolean {
            return this.lastToken().hasTrailingTrivia();
        }

        public isIncrementallyUnusable(): boolean {
            return (this.data() & SyntaxConstants.NodeIncrementallyUnusableMask) !== 0;
        }

        // True if this node was parsed while the parser was in 'strict' mode.  A node parsed in strict
        // mode cannot be reused if the parser is non-strict mode (and vice versa).  This is because 
        // the parser parses things differently in strict mode and thus the tokens may be interpretted
        // differently if the mode is changed. 
        public parsedInStrictMode(): boolean {
            return (this.data() & SyntaxConstants.NodeParsedInStrictModeMask) !== 0;
        }

        public fullWidth(): number {
            return this.data() >>> SyntaxConstants.NodeFullWidthShift;
        }

        private computeData(): number {
            var slotCount = this.childCount();

            var fullWidth = 0;

            // If we have no children (like an OmmittedExpressionSyntax), we're automatically not reusable.
            var isIncrementallyUnusable = slotCount === 0;

            for (var i = 0, n = slotCount; i < n; i++) {
                var element = this.childAt(i);

                if (element !== null) {
                    fullWidth += element.fullWidth();

                    /*
                    if (!isIncrementallyUnusable) {
                        
                        var childIsUnusable = element.isIncrementallyUnusable();
                        isIncrementallyUnusable = childIsUnusable;
                    }
                    /*/
                    isIncrementallyUnusable = isIncrementallyUnusable || element.isIncrementallyUnusable();
                    //*/
                }
            }

            return (fullWidth << SyntaxConstants.NodeFullWidthShift)
                 | (isIncrementallyUnusable ? SyntaxConstants.NodeIncrementallyUnusableMask : 0)
                 | SyntaxConstants.NodeDataComputed;
        }

        private data(): number {
            if ((this._data & SyntaxConstants.NodeDataComputed) === 0) {
                this._data |= this.computeData();
            }

            return this._data;
        }

        /**
         * Finds a token according to the following rules:
         * 1) If position matches the End of the node/s FullSpan and the node is SourceUnitSyntax,
         *    then the EOF token is returned. 
         * 
         *  2) If node.FullSpan.Contains(position) then the token that contains given position is
         *     returned.
         * 
         *  3) Otherwise an ArgumentOutOfRangeException is thrown
         *
         * Note: findToken will always return a non-missing token with width greater than or equal to
         * 1 (except for EOF).  Empty tokens synthesized by the parser are never returned.
         */
        public findToken(position: number, includeSkippedTokens: boolean = false): ISyntaxToken {
            var endOfFileToken = this.tryGetEndOfFileAt(position);
            if (endOfFileToken !== null) {
                return endOfFileToken;
            }

            if (position < 0 || position >= this.fullWidth()) {
                throw Errors.argumentOutOfRange("position");
            }

            var positionedToken = Syntax.findToken(this, position);

            if (includeSkippedTokens) {
                return Syntax.findSkippedTokenInPositionedToken(positionedToken, position) || positionedToken;
            }

            // Could not find a better match
            return positionedToken;

        }

        private tryGetEndOfFileAt(position: number): ISyntaxToken {
            if (this.kind() === SyntaxKind.SourceUnit && position === this.fullWidth()) {
                var sourceUnit = <SourceUnitSyntax>this;
                return sourceUnit.endOfFileToken;
            }

            return null;
        }

        public findTokenOnLeft(position: number, includeSkippedTokens: boolean = false): ISyntaxToken {
            var positionedToken = this.findToken(position, /*includeSkippedTokens*/ false);
            var start = positionedToken.start();
            
            // Position better fall within this token.
            // Debug.assert(position >= positionedToken.fullStart());
            // Debug.assert(position < positionedToken.fullEnd() || positionedToken.token().tokenKind === SyntaxKind.EndOfFileToken);

            if (includeSkippedTokens) {
                positionedToken = Syntax.findSkippedTokenOnLeft(positionedToken, position) || positionedToken;
            }

            // if position is after the start of the token, then this token is the token on the left.
            if (position > start) {
                return positionedToken;
            }

            // we're in the trivia before the start of the token.  Need to return the previous token.
            if (positionedToken.fullStart() === 0) {
                // Already on the first token.  Nothing before us.
                return null;
            }

            return positionedToken.previousToken(includeSkippedTokens);
        }

        public findCompleteTokenOnLeft(position: number, includeSkippedTokens: boolean = false): ISyntaxToken {
            var positionedToken = this.findToken(position, /*includeSkippedTokens*/ false);

            // Position better fall within this token.
            // Debug.assert(position >= positionedToken.fullStart());
            // Debug.assert(position < positionedToken.fullEnd() || positionedToken.token().tokenKind === SyntaxKind.EndOfFileToken);

            if (includeSkippedTokens) {
                positionedToken = Syntax.findSkippedTokenOnLeft(positionedToken, position) || positionedToken;
            }

            // if position is after the end of the token, then this token is the token on the left.
            if (positionedToken.width() > 0 && position >= positionedToken.end()) {
                return positionedToken;
            }

            return positionedToken.previousToken(includeSkippedTokens);
        }

        public structuralEquals(node: SyntaxNode): boolean {
            if (this === node) { return true; }
            if (node === null) { return false; }
            if (this.kind() !== node.kind()) { return false; }

            for (var i = 0, n = this.childCount(); i < n; i++) {
                var element1 = this.childAt(i);
                var element2 = node.childAt(i);

                if (!Syntax.elementStructuralEquals(element1, element2)) {
                    return false;
                }
            }

            return true;
        }

        public width(): number {
            return this.fullWidth() - leadingTriviaWidth(this) - trailingTriviaWidth(this);
        }
    }
}