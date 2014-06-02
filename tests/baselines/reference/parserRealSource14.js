//// [parserRealSource14.js]
// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0.
// See LICENSE.txt in the project root for complete license information.
///<reference path='typescript.ts' />
var TypeScript;
(function (TypeScript) {
    function lastOf(items) {
        return (items === null || items.length === 0) ? null : items[items.length - 1];
    }
    TypeScript.lastOf = lastOf;

    function max(a, b) {
        return a >= b ? a : b;
    }
    TypeScript.max = max;

    function min(a, b) {
        return a <= b ? a : b;
    }
    TypeScript.min = min;

    //
    // Helper class representing a path from a root ast node to a (grand)child ast node.
    // This is helpful as our tree don't have parents.
    //
    var AstPath = (function () {
        function AstPath() {
            this.asts = [];
            this.top = -1;
        }
        AstPath.reverseIndexOf = function (items, index) {
            return (items === null || items.length <= index) ? null : items[items.length - index - 1];
        };

        AstPath.prototype.clone = function () {
            var clone = new AstPath();
            clone.asts = this.asts.map(function (value) {
                return value;
            });
            clone.top = this.top;
            return clone;
        };

        AstPath.prototype.pop = function () {
            var head = this.ast();
            this.up();

            while (this.asts.length > this.count()) {
                this.asts.pop();
            }
            return head;
        };

        AstPath.prototype.push = function (ast) {
            while (this.asts.length > this.count()) {
                this.asts.pop();
            }
            this.top = this.asts.length;
            this.asts.push(ast);
        };

        AstPath.prototype.up = function () {
            if (this.top <= -1)
                throw new Error("Invalid call to 'up'");
            this.top--;
        };

        AstPath.prototype.down = function () {
            if (this.top == this.ast.length - 1)
                throw new Error("Invalid call to 'down'");
            this.top++;
        };

        AstPath.prototype.nodeType = function () {
            if (this.ast() == null)
                return TypeScript.NodeType.None;
            return this.ast().nodeType;
        };

        AstPath.prototype.ast = function () {
            return AstPath.reverseIndexOf(this.asts, this.asts.length - (this.top + 1));
        };

        AstPath.prototype.parent = function () {
            return AstPath.reverseIndexOf(this.asts, this.asts.length - this.top);
        };

        AstPath.prototype.count = function () {
            return this.top + 1;
        };

        AstPath.prototype.get = function (index) {
            return this.asts[index];
        };

        AstPath.prototype.isNameOfClass = function () {
            if (this.ast() === null || this.parent() === null)
                return false;

            return (this.ast().nodeType === TypeScript.NodeType.Name) && (this.parent().nodeType === TypeScript.NodeType.ClassDeclaration) && (this.parent().name === this.ast());
        };

        AstPath.prototype.isNameOfInterface = function () {
            if (this.ast() === null || this.parent() === null)
                return false;

            return (this.ast().nodeType === TypeScript.NodeType.Name) && (this.parent().nodeType === TypeScript.NodeType.InterfaceDeclaration) && (this.parent().name === this.ast());
        };

        AstPath.prototype.isNameOfArgument = function () {
            if (this.ast() === null || this.parent() === null)
                return false;

            return (this.ast().nodeType === TypeScript.NodeType.Name) && (this.parent().nodeType === TypeScript.NodeType.ArgDecl) && (this.parent().id === this.ast());
        };

        AstPath.prototype.isNameOfVariable = function () {
            if (this.ast() === null || this.parent() === null)
                return false;

            return (this.ast().nodeType === TypeScript.NodeType.Name) && (this.parent().nodeType === TypeScript.NodeType.VarDecl) && (this.parent().id === this.ast());
        };

        AstPath.prototype.isNameOfModule = function () {
            if (this.ast() === null || this.parent() === null)
                return false;

            return (this.ast().nodeType === TypeScript.NodeType.Name) && (this.parent().nodeType === TypeScript.NodeType.ModuleDeclaration) && (this.parent().name === this.ast());
        };

        AstPath.prototype.isNameOfFunction = function () {
            if (this.ast() === null || this.parent() === null)
                return false;

            return (this.ast().nodeType === TypeScript.NodeType.Name) && (this.parent().nodeType === TypeScript.NodeType.FuncDecl) && (this.parent().name === this.ast());
        };

        AstPath.prototype.isChildOfScript = function () {
            var ast = lastOf(this.asts);
            return this.count() >= 3 && this.asts[this.top] === ast && this.asts[this.top - 1].nodeType === TypeScript.NodeType.List && this.asts[this.top - 2].nodeType === TypeScript.NodeType.Script;
        };

        AstPath.prototype.isChildOfModule = function () {
            var ast = lastOf(this.asts);
            return this.count() >= 3 && this.asts[this.top] === ast && this.asts[this.top - 1].nodeType === TypeScript.NodeType.List && this.asts[this.top - 2].nodeType === TypeScript.NodeType.ModuleDeclaration;
        };

        AstPath.prototype.isChildOfClass = function () {
            var ast = lastOf(this.asts);
            return this.count() >= 3 && this.asts[this.top] === ast && this.asts[this.top - 1].nodeType === TypeScript.NodeType.List && this.asts[this.top - 2].nodeType === TypeScript.NodeType.ClassDeclaration;
        };

        AstPath.prototype.isArgumentOfClassConstructor = function () {
            var ast = lastOf(this.asts);
            return this.count() >= 5 && this.asts[this.top] === ast && this.asts[this.top - 1].nodeType === TypeScript.NodeType.List && this.asts[this.top - 2].nodeType === TypeScript.NodeType.FuncDecl && this.asts[this.top - 3].nodeType === TypeScript.NodeType.List && this.asts[this.top - 4].nodeType === TypeScript.NodeType.ClassDeclaration && (this.asts[this.top - 2].isConstructor) && (this.asts[this.top - 2].arguments === this.asts[this.top - 1]) && (this.asts[this.top - 4].constructorDecl === this.asts[this.top - 2]);
        };

        AstPath.prototype.isChildOfInterface = function () {
            var ast = lastOf(this.asts);
            return this.count() >= 3 && this.asts[this.top] === ast && this.asts[this.top - 1].nodeType === TypeScript.NodeType.List && this.asts[this.top - 2].nodeType === TypeScript.NodeType.InterfaceDeclaration;
        };

        AstPath.prototype.isTopLevelImplicitModule = function () {
            return this.count() >= 1 && this.asts[this.top].nodeType === TypeScript.NodeType.ModuleDeclaration && TypeScript.hasFlag(this.asts[this.top].modFlags, TypeScript.ModuleFlags.IsWholeFile);
        };

        AstPath.prototype.isBodyOfTopLevelImplicitModule = function () {
            return this.count() >= 2 && this.asts[this.top - 0].nodeType === TypeScript.NodeType.List && this.asts[this.top - 1].nodeType === TypeScript.NodeType.ModuleDeclaration && this.asts[this.top - 1].members == this.asts[this.top - 0] && TypeScript.hasFlag(this.asts[this.top - 1].modFlags, TypeScript.ModuleFlags.IsWholeFile);
        };

        AstPath.prototype.isBodyOfScript = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.Script && this.asts[this.top - 1].bod == this.asts[this.top - 0];
        };

        AstPath.prototype.isBodyOfSwitch = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.Switch && this.asts[this.top - 1].caseList == this.asts[this.top - 0];
        };

        AstPath.prototype.isBodyOfModule = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.ModuleDeclaration && this.asts[this.top - 1].members == this.asts[this.top - 0];
        };

        AstPath.prototype.isBodyOfClass = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.ClassDeclaration && this.asts[this.top - 1].members == this.asts[this.top - 0];
        };

        AstPath.prototype.isBodyOfFunction = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.FuncDecl && this.asts[this.top - 1].bod == this.asts[this.top - 0];
        };

        AstPath.prototype.isBodyOfInterface = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.InterfaceDeclaration && this.asts[this.top - 1].members == this.asts[this.top - 0];
        };

        AstPath.prototype.isBodyOfBlock = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.Block && this.asts[this.top - 1].statements == this.asts[this.top - 0];
        };

        AstPath.prototype.isBodyOfFor = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.For && this.asts[this.top - 1].body == this.asts[this.top - 0];
        };

        AstPath.prototype.isBodyOfCase = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.Case && this.asts[this.top - 1].body == this.asts[this.top - 0];
        };

        AstPath.prototype.isBodyOfTry = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.Try && this.asts[this.top - 1].body == this.asts[this.top - 0];
        };

        AstPath.prototype.isBodyOfCatch = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.Catch && this.asts[this.top - 1].body == this.asts[this.top - 0];
        };

        AstPath.prototype.isBodyOfDoWhile = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.DoWhile && this.asts[this.top - 1].body == this.asts[this.top - 0];
        };

        AstPath.prototype.isBodyOfWhile = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.While && this.asts[this.top - 1].body == this.asts[this.top - 0];
        };

        AstPath.prototype.isBodyOfForIn = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.ForIn && this.asts[this.top - 1].body == this.asts[this.top - 0];
        };

        AstPath.prototype.isBodyOfWith = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.With && this.asts[this.top - 1].body == this.asts[this.top - 0];
        };

        AstPath.prototype.isBodyOfFinally = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.Finally && this.asts[this.top - 1].body == this.asts[this.top - 0];
        };

        AstPath.prototype.isCaseOfSwitch = function () {
            return this.count() >= 3 && this.asts[this.top - 2].nodeType === TypeScript.NodeType.Switch && this.asts[this.top - 1].nodeType === TypeScript.NodeType.List && this.asts[this.top - 2].caseList == this.asts[this.top - 1];
        };

        AstPath.prototype.isDefaultCaseOfSwitch = function () {
            return this.count() >= 3 && this.asts[this.top - 2].nodeType === TypeScript.NodeType.Switch && this.asts[this.top - 1].nodeType === TypeScript.NodeType.List && this.asts[this.top - 2].caseList == this.asts[this.top - 1] && this.asts[this.top - 2].defaultCase == this.asts[this.top - 0];
        };

        AstPath.prototype.isListOfObjectLit = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.ObjectLit && this.asts[this.top - 0].nodeType === TypeScript.NodeType.List && this.asts[this.top - 1].operand == this.asts[this.top - 0];
        };

        AstPath.prototype.isBodyOfObjectLit = function () {
            return this.isListOfObjectLit();
        };

        AstPath.prototype.isEmptyListOfObjectLit = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.ObjectLit && this.asts[this.top - 0].nodeType === TypeScript.NodeType.List && this.asts[this.top - 1].operand == this.asts[this.top - 0] && this.asts[this.top - 0].members.length == 0;
        };

        AstPath.prototype.isMemberOfObjectLit = function () {
            return this.count() >= 3 && this.asts[this.top - 2].nodeType === TypeScript.NodeType.ObjectLit && this.asts[this.top - 1].nodeType === TypeScript.NodeType.List && this.asts[this.top - 0].nodeType === TypeScript.NodeType.Member && this.asts[this.top - 2].operand == this.asts[this.top - 1];
        };

        AstPath.prototype.isNameOfMemberOfObjectLit = function () {
            return this.count() >= 4 && this.asts[this.top - 3].nodeType === TypeScript.NodeType.ObjectLit && this.asts[this.top - 2].nodeType === TypeScript.NodeType.List && this.asts[this.top - 1].nodeType === TypeScript.NodeType.Member && this.asts[this.top - 0].nodeType === TypeScript.NodeType.Name && this.asts[this.top - 3].operand == this.asts[this.top - 2];
        };

        AstPath.prototype.isListOfArrayLit = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.ArrayLit && this.asts[this.top - 0].nodeType === TypeScript.NodeType.List && this.asts[this.top - 1].operand == this.asts[this.top - 0];
        };

        AstPath.prototype.isTargetOfMember = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.Member && this.asts[this.top - 1].operand1 === this.asts[this.top - 0];
        };

        AstPath.prototype.isMemberOfMember = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.Member && this.asts[this.top - 1].operand2 === this.asts[this.top - 0];
        };

        AstPath.prototype.isItemOfList = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.List;
            //(<Tools.ASTList>this.asts[this.top - 1]).operand2 === this.asts[this.top - 0];
        };

        AstPath.prototype.isThenOfIf = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.If && this.asts[this.top - 1].thenBod == this.asts[this.top - 0];
        };

        AstPath.prototype.isElseOfIf = function () {
            return this.count() >= 2 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.If && this.asts[this.top - 1].elseBod == this.asts[this.top - 0];
        };

        AstPath.prototype.isBodyOfDefaultCase = function () {
            return this.isBodyOfCase();
        };

        AstPath.prototype.isSingleStatementList = function () {
            return this.count() >= 1 && this.asts[this.top].nodeType === TypeScript.NodeType.List && this.asts[this.top].members.length === 1;
        };

        AstPath.prototype.isArgumentListOfFunction = function () {
            return this.count() >= 2 && this.asts[this.top - 0].nodeType === TypeScript.NodeType.List && this.asts[this.top - 1].nodeType === TypeScript.NodeType.FuncDecl && this.asts[this.top - 1].arguments === this.asts[this.top - 0];
        };

        AstPath.prototype.isArgumentOfFunction = function () {
            return this.count() >= 3 && this.asts[this.top - 1].nodeType === TypeScript.NodeType.List && this.asts[this.top - 2].nodeType === TypeScript.NodeType.FuncDecl && this.asts[this.top - 2].arguments === this.asts[this.top - 1];
        };

        AstPath.prototype.isArgumentListOfCall = function () {
            return this.count() >= 2 && this.asts[this.top - 0].nodeType === TypeScript.NodeType.List && this.asts[this.top - 1].nodeType === TypeScript.NodeType.Call && this.asts[this.top - 1].arguments === this.asts[this.top - 0];
        };

        AstPath.prototype.isArgumentListOfNew = function () {
            return this.count() >= 2 && this.asts[this.top - 0].nodeType === TypeScript.NodeType.List && this.asts[this.top - 1].nodeType === TypeScript.NodeType.New && this.asts[this.top - 1].arguments === this.asts[this.top - 0];
        };

        AstPath.prototype.isSynthesizedBlock = function () {
            return this.count() >= 1 && this.asts[this.top - 0].nodeType === TypeScript.NodeType.Block && this.asts[this.top - 0].isStatementBlock === false;
        };
        return AstPath;
    })();
    TypeScript.AstPath = AstPath;

    function isValidAstNode(ast) {
        if (ast === null)
            return false;

        if (ast.minChar === -1 || ast.limChar === -1)
            return false;

        return true;
    }
    TypeScript.isValidAstNode = isValidAstNode;

    var AstPathContext = (function () {
        function AstPathContext() {
            this.path = new TypeScript.AstPath();
        }
        return AstPathContext;
    })();
    TypeScript.AstPathContext = AstPathContext;

    (function (GetAstPathOptions) {
        GetAstPathOptions[GetAstPathOptions["Default"] = 0] = "Default";
        GetAstPathOptions[GetAstPathOptions["EdgeInclusive"] = 1] = "EdgeInclusive";

        //We need this options dealing with an AST coming from an incomplete AST. For example:
        //     class foo { // r
        // If we ask for the AST at the position after the "r" character, we won't see we are
        // inside a comment, because the "class" AST node has a limChar corresponding to the position of
        // the "{" character, meaning we don't traverse the tree down to the stmt list of the class, meaning
        // we don't find the "precomment" attached to the errorneous empty stmt.
        //TODO: It would be nice to be able to get rid of this.
        GetAstPathOptions[GetAstPathOptions["DontPruneSearchBasedOnPosition"] = 1 << 1] = "DontPruneSearchBasedOnPosition";
    })(TypeScript.GetAstPathOptions || (TypeScript.GetAstPathOptions = {}));
    var GetAstPathOptions = TypeScript.GetAstPathOptions;

    ///
    /// Return the stack of AST nodes containing "position"
    ///
    function getAstPathToPosition(script, pos, options) {
        if (typeof options === "undefined") { options = 0 /* Default */; }
        var lookInComments = function (comments) {
            if (comments && comments.length > 0) {
                for (var i = 0; i < comments.length; i++) {
                    var minChar = comments[i].minChar;
                    var limChar = comments[i].limChar;
                    if (!comments[i].isBlockComment) {
                        limChar++; // For single line comments, include 1 more character (for the newline)
                    }
                    if (pos >= minChar && pos < limChar) {
                        ctx.path.push(comments[i]);
                    }
                }
            }
        };

        var pre = function (cur, parent, walker) {
            if (isValidAstNode(cur)) {
                // Add "cur" to the stack if it contains our position
                // For "identifier" nodes, we need a special case: A position equal to "limChar" is
                // valid, since the position corresponds to a caret position (in between characters)
                // For example:
                //  bar
                //  0123
                // If "position == 3", the caret is at the "right" of the "r" character, which should be considered valid
                var inclusive = hasFlag(options, 1 /* EdgeInclusive */) || cur.nodeType === TypeScript.NodeType.Name || pos === script.limChar;

                var minChar = cur.minChar;
                var limChar = cur.limChar + (inclusive ? 1 : 0);
                if (pos >= minChar && pos < limChar) {
                    // TODO: Since AST is sometimes not correct wrt to position, only add "cur" if it's better
                    //       than top of the stack.
                    var previous = ctx.path.ast();
                    if (previous == null || (cur.minChar >= previous.minChar && cur.limChar <= previous.limChar)) {
                        ctx.path.push(cur);
                    } else {
                        //logger.log("TODO: Ignoring node because minChar, limChar not better than previous node in stack");
                    }
                }

                // The AST walker skips comments, but we might be in one, so check the pre/post comments for this node manually
                if (pos < limChar) {
                    lookInComments(cur.preComments);
                }
                if (pos >= minChar) {
                    lookInComments(cur.postComments);
                }

                if (!hasFlag(options, GetAstPathOptions.DontPruneSearchBasedOnPosition)) {
                    // Don't go further down the tree if pos is outside of [minChar, limChar]
                    walker.options.goChildren = (minChar <= pos && pos <= limChar);
                }
            }
            return cur;
        };

        var ctx = new AstPathContext();
        TypeScript.getAstWalkerFactory().walk(script, pre, null, null, ctx);
        return ctx.path;
    }
    TypeScript.getAstPathToPosition = getAstPathToPosition;

    //
    // Find a source text offset that is safe for lexing tokens at the given position.
    // This is used when "position" might be inside a comment or string, etc.
    //
    function getTokenizationOffset(script, position) {
        var bestOffset = 0;
        var pre = function (cur, parent, walker) {
            if (TypeScript.isValidAstNode(cur)) {
                // Did we find a closer offset?
                if (cur.minChar <= position) {
                    bestOffset = max(bestOffset, cur.minChar);
                }

                // Stop the walk if this node is not related to "minChar"
                if (cur.minChar > position || cur.limChar < bestOffset) {
                    walker.options.goChildren = false;
                }
            }

            return cur;
        };

        TypeScript.getAstWalkerFactory().walk(script, pre);
        return bestOffset;
    }
    TypeScript.getTokenizationOffset = getTokenizationOffset;

    ///
    /// Simple function to Walk an AST using a simple callback function.
    ///
    function walkAST(ast, callback) {
        var pre = function (cur, parent, walker) {
            var path = walker.state;
            path.push(cur);
            callback(path, walker);
            return cur;
        };
        var post = function (cur, parent, walker) {
            var path = walker.state;
            path.pop();
            return cur;
        };

        var path = new AstPath();
        TypeScript.getAstWalkerFactory().walk(ast, pre, post, null, path);
    }
    TypeScript.walkAST = walkAST;
})(TypeScript || (TypeScript = {}));
