//
// Copyright (c) Microsoft Corporation.  All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

///<reference path='references.ts' />

module TypeScript {
    export function scriptIsElided(script: Script): boolean {
        return scriptOrModuleIsElided(script.modifiers, script.moduleElements);
    }

    export function moduleIsElided(declaration: ModuleDeclaration): boolean {
        return scriptOrModuleIsElided(declaration.modifiers, declaration.moduleElements);
    }

    function scriptOrModuleIsElided(modifiers: PullElementFlags[], moduleMembers: ASTList): boolean {
        if (hasModifier(modifiers, PullElementFlags.Ambient)) {
            return true;
        }

        return moduleMembersAreElided(moduleMembers);
    }

    function moduleMembersAreElided(members: ASTList): boolean {
        for (var i = 0, n = members.members.length; i < n; i++) {
            var member = members.members[i];

            // We should emit *this* module if it contains any non-interface types. 
            // Caveat: if we have contain a module, then we should be emitted *if we want to
            // emit that inner module as well.
            if (member.nodeType() === NodeType.ModuleDeclaration) {
                if (!moduleIsElided(<ModuleDeclaration>member)) {
                    return false;
                }
            }
            else if (member.nodeType() !== NodeType.InterfaceDeclaration) {
                return false;
            }
        }

        return true;
    }

    export function enumIsElided(declaration: EnumDeclaration): boolean {
        if (hasModifier(declaration.modifiers, PullElementFlags.Ambient)) {
            return true;
        }

        return false;
    }

    export function importDeclarationIsElided(importDeclAST: ImportDeclaration, semanticInfoChain: SemanticInfoChain, compilationSettings: ImmutableCompilationSettings = null) {
        var isExternalModuleReference = importDeclAST.isExternalImportDeclaration();
        var importDecl = semanticInfoChain.getDeclForAST(importDeclAST);
        var isExported = hasFlag(importDecl.flags, PullElementFlags.Exported);
        var isAmdCodeGen = compilationSettings && compilationSettings.moduleGenTarget() == ModuleGenTarget.Asynchronous;

        if (!isExternalModuleReference || // Any internal reference needs to check if the emit can happen
            isExported || // External module reference with export modifier always needs to be emitted
            !isAmdCodeGen) {// commonjs needs the var declaration for the import declaration
            var importSymbol = <PullTypeAliasSymbol>importDecl.getSymbol();
            if (!importDeclAST.isExternalImportDeclaration()) {
                if (importSymbol.getExportAssignedValueSymbol()) {
                    return true;
                }
                var containerSymbol = importSymbol.getExportAssignedContainerSymbol();
                if (containerSymbol && containerSymbol.getInstanceSymbol()) {
                    return true;
                }
            }

            return importSymbol.isUsedAsValue();
        }

        return false;
    }

    export function isValidAstNode(ast: IASTSpan): boolean {
        if (!ast)
            return false;

        if (ast.minChar === -1 || ast.limChar === -1)
            return false;

        return true;
    }

    ///
    /// Return the AST containing "position"
    ///
    export function getAstAtPosition(script: AST, pos: number, useTrailingTriviaAsLimChar: boolean = true, forceInclusive: boolean = false): AST {
        var top: AST = null;

        var pre = function (cur: AST, walker: IAstWalker) {
            if (isValidAstNode(cur)) {
                var isInvalid1 = cur.nodeType() === NodeType.ExpressionStatement && cur.getLength() === 0;

                if (isInvalid1) {
                    walker.options.goChildren = false;
                }
                else {
                    // Add "cur" to the stack if it contains our position
                    // For "identifier" nodes, we need a special case: A position equal to "limChar" is
                    // valid, since the position corresponds to a caret position (in between characters)
                    // For example:
                    //  bar
                    //  0123
                    // If "position === 3", the caret is at the "right" of the "r" character, which should be considered valid
                    var inclusive =
                        forceInclusive ||
                        cur.nodeType() === NodeType.Name ||
                        cur.nodeType() === NodeType.MemberAccessExpression ||
                        cur.nodeType() === NodeType.QualifiedName ||
                        cur.nodeType() === NodeType.TypeRef ||
                        cur.nodeType() === NodeType.VariableDeclaration ||
                        cur.nodeType() === NodeType.VariableDeclarator ||
                        cur.nodeType() === NodeType.InvocationExpression ||
                        pos === script.limChar + script.trailingTriviaWidth; // Special "EOF" case

                    var minChar = cur.minChar;
                    var limChar = cur.limChar + (useTrailingTriviaAsLimChar ? cur.trailingTriviaWidth : 0) + (inclusive ? 1 : 0);
                    if (pos >= minChar && pos < limChar) {

                        // Ignore empty lists
                        if (cur.nodeType() !== NodeType.List || cur.limChar > cur.minChar) {
                            // TODO: Since AST is sometimes not correct wrt to position, only add "cur" if it's better
                            //       than top of the stack.
                            if (top === null) {
                                top = cur;
                            }
                            else if (cur.minChar >= top.minChar &&
                                (cur.limChar + (useTrailingTriviaAsLimChar ? cur.trailingTriviaWidth : 0)) <= (top.limChar + (useTrailingTriviaAsLimChar ? top.trailingTriviaWidth : 0))) {
                                // this new node appears to be better than the one we're 
                                // storing.  Make this the new node.

                                // However, If the current top is a missing identifier, we 
                                // don't want to replace it with another missing identifier.
                                // We want to return the first missing identifier found in a
                                // depth first walk of  the tree.
                                if (top.getLength() !== 0 || cur.getLength() !== 0) {
                                    top = cur;
                                }
                            }
                        }
                    }

                    // Don't go further down the tree if pos is outside of [minChar, limChar]
                    walker.options.goChildren = (minChar <= pos && pos <= limChar);
                }
            }
        };

        getAstWalkerFactory().walk(script, pre);
        return top;
    }

    export function getExtendsHeritageClause(clauses: ASTList): HeritageClause {
        if (!clauses) {
            return null;
        }

        return ArrayUtilities.firstOrDefault(<HeritageClause[]>clauses.members,
            c => c.typeNames.members.length > 0 && c.nodeType() === NodeType.ExtendsHeritageClause);
    }

    export function getImplementsHeritageClause(clauses: ASTList): HeritageClause {
        if (!clauses) {
            return null;
        }

        return ArrayUtilities.firstOrDefault(<HeritageClause[]>clauses.members,
            c => c.typeNames.members.length > 0 && c.nodeType() === NodeType.ImplementsHeritageClause);
    }

    export function isCallExpression(ast: AST): boolean {
        return (ast && ast.nodeType() === NodeType.InvocationExpression) ||
            (ast && ast.nodeType() === NodeType.ObjectCreationExpression);
    }

    export function isCallExpressionTarget(ast: AST): boolean {
        if (!ast) {
            return false;
        }

        var current = ast;

        while (current && current.parent) {
            if (current.parent.nodeType() === NodeType.MemberAccessExpression &&
                (<MemberAccessExpression>current.parent).name === current) {
                current = current.parent;
                continue;
            }

            break;
        }

        if (current && current.parent) {
            if (current.parent.nodeType() === NodeType.InvocationExpression || current.parent.nodeType() === NodeType.ObjectCreationExpression) {
                return current === (<InvocationExpression>current.parent).expression;
            }
        }

        return false;
    }

    function isNameOfSomeDeclaration(ast: AST) {
        if (ast === null || ast.parent === null) {
            return false;
        }
        if (ast.nodeType() !== NodeType.Name) {
            return false;
        }

        switch (ast.parent.nodeType()) {
            case NodeType.ClassDeclaration:
                return (<ClassDeclaration>ast.parent).identifier === ast;
            case NodeType.InterfaceDeclaration:
                return (<InterfaceDeclaration>ast.parent).identifier === ast;
            case NodeType.EnumDeclaration:
                return (<EnumDeclaration>ast.parent).identifier === ast;
            case NodeType.ModuleDeclaration:
                return (<ModuleDeclaration>ast.parent).name === ast;
            case NodeType.VariableDeclarator:
                return (<VariableDeclarator>ast.parent).identifier === ast;
            case NodeType.FunctionDeclaration:
                return (<FunctionDeclaration>ast.parent).identifier === ast;
            case NodeType.MemberFunctionDeclaration:
                return (<MemberFunctionDeclaration>ast.parent).propertyName === ast;
            case NodeType.Parameter:
                return (<Parameter>ast.parent).identifier === ast;
            case NodeType.TypeParameter:
                return (<TypeParameter>ast.parent).identifier === ast;
            case NodeType.SimplePropertyAssignment:
                return (<SimplePropertyAssignment>ast.parent).propertyName === ast;
            case NodeType.FunctionPropertyAssignment:
                return (<FunctionPropertyAssignment>ast.parent).propertyName === ast;
            case NodeType.EnumElement:
                return (<EnumElement>ast.parent).propertyName === ast;
            case NodeType.ImportDeclaration:
                return (<ImportDeclaration>ast.parent).identifier === ast;
        }

        return false;
    }

    export function isDeclarationASTOrDeclarationNameAST(ast: AST) {
        return isNameOfSomeDeclaration(ast) || isDeclarationAST(ast);
    }

    export function isNameOfFunction(ast: AST) {
        return ast
            && ast.parent
            && ast.nodeType() === NodeType.Name
            && ast.parent.nodeType() === NodeType.FunctionDeclaration
            && (<FunctionDeclaration>ast.parent).identifier === ast;
    }

    export function isNameOfMemberFunction(ast: AST) {
        return ast
            && ast.parent
            && ast.nodeType() === NodeType.Name
            && ast.parent.nodeType() === NodeType.MemberFunctionDeclaration
            && (<MemberFunctionDeclaration>ast.parent).propertyName === ast;
    }

    export function isNameOfMemberAccessExpression(ast: AST) {
        if (ast &&
            ast.parent &&
            ast.parent.nodeType() === NodeType.MemberAccessExpression &&
            (<MemberAccessExpression>ast.parent).name === ast) {

            return true;
        }

        return false;
    }

    export function isRightSideOfQualifiedName(ast: AST) {
        if (ast &&
            ast.parent &&
            ast.parent.nodeType() === NodeType.QualifiedName &&
            (<QualifiedName>ast.parent).right === ast) {

            return true;
        }

        return false;
    }

    export interface IParameters {
        length: number;
        lastParameterIsRest(): boolean;
        ast: AST;
        astAt(index: number): AST;
        identifierAt(index: number): Identifier;
        typeAt(index: number): TypeReference;
        initializerAt(index: number): EqualsValueClause;
        isOptionalAt(index: number): boolean;
    }

    export module Parameters {
        export function fromIdentifier(id: Identifier): IParameters {
            return {
                length: 1,
                lastParameterIsRest: () => false,
                ast: id,
                astAt: (index: number) => id,
                identifierAt: (index: number) => id,
                typeAt: (index: number): TypeReference => null,
                initializerAt: (index: number): EqualsValueClause => null,
                isOptionalAt: (index: number) => false,
            }
        }

        export function fromParameter(parameter: Parameter): IParameters {
            return {
                length: 1,
                lastParameterIsRest: () => parameter.isRest,
                ast: parameter,
                astAt: (index: number) => parameter,
                identifierAt: (index: number) => parameter.identifier,
                typeAt: (index: number) => parameter.typeAnnotation,
                initializerAt: (index: number) => parameter.equalsValueClause,
                isOptionalAt: (index: number) => parameter.isOptionalArg(),
            }
        }

        export function fromParameterList(list: ASTList): IParameters {
            return {
                length: list.members.length,
                lastParameterIsRest: () => lastParameterIsRest(list),
                ast: list,
                astAt: (index: number) => list.members[index],
                identifierAt: (index: number) => (<Parameter>list.members[index]).identifier,
                typeAt: (index: number) => (<Parameter>list.members[index]).typeAnnotation,
                initializerAt: (index: number) => (<Parameter>list.members[index]).equalsValueClause,
                isOptionalAt: (index: number) => (<Parameter>list.members[index]).isOptionalArg(),
            }
        }
    }

    export function isDeclarationAST(ast: AST): boolean {
        switch (ast.nodeType()) {
            case NodeType.ImportDeclaration:
            case NodeType.ClassDeclaration:
            case NodeType.InterfaceDeclaration:
            case NodeType.VariableDeclarator:
            case NodeType.Parameter:
            case NodeType.SimpleArrowFunctionExpression:
            case NodeType.ParenthesizedArrowFunctionExpression:
            case NodeType.IndexSignature:
            case NodeType.FunctionDeclaration:
            case NodeType.ModuleDeclaration:
            case NodeType.ArrayType:
            case NodeType.ObjectType:
            case NodeType.TypeParameter:
            case NodeType.ConstructorDeclaration:
            case NodeType.MemberFunctionDeclaration:
            case NodeType.GetAccessor:
            case NodeType.SetAccessor:
            case NodeType.MemberVariableDeclaration:
            case NodeType.IndexMemberDeclaration:
            case NodeType.EnumDeclaration:
            case NodeType.EnumElement:
            case NodeType.SimplePropertyAssignment:
            case NodeType.FunctionPropertyAssignment:
            case NodeType.FunctionExpression:
            case NodeType.CallSignature:
            case NodeType.ConstructSignature:
            case NodeType.MethodSignature:
            case NodeType.PropertySignature:
                return true;
            default:
                return false;
        }
    }

    export function docComments(ast: AST): Comment[] {
        if (!isDeclarationAST(ast) || !ast.preComments() || ast.preComments().length === 0) {
            return [];
        }

        var preComments = ast.preComments();
        var preCommentsLength = preComments.length;
        var docComments = new Array<Comment>();
        for (var i = preCommentsLength - 1; i >= 0; i--) {
            if (preComments[i].isDocComment()) {
                docComments.push(preComments[i]);
                continue;
            }

            break;
        }

        return docComments.reverse();
    }

    export function getTextForBinaryToken(nodeType: NodeType): string {
        switch (nodeType) {
            case NodeType.CommaExpression: return ",";
            case NodeType.AssignmentExpression: return "=";
            case NodeType.AddAssignmentExpression: return "+=";
            case NodeType.SubtractAssignmentExpression: return "-=";
            case NodeType.MultiplyAssignmentExpression: return "*=";
            case NodeType.DivideAssignmentExpression: return "/=";
            case NodeType.ModuloAssignmentExpression: return "%=";
            case NodeType.AndAssignmentExpression: return "&=";
            case NodeType.ExclusiveOrAssignmentExpression: return "^=";
            case NodeType.OrAssignmentExpression: return "|=";
            case NodeType.LeftShiftAssignmentExpression: return "<<=";
            case NodeType.SignedRightShiftAssignmentExpression: return ">>=";
            case NodeType.UnsignedRightShiftAssignmentExpression: return ">>>=";
            case NodeType.LogicalOrExpression: return "||";
            case NodeType.LogicalAndExpression: return "&&";
            case NodeType.BitwiseOrExpression: return "|";
            case NodeType.BitwiseExclusiveOrExpression: return "^";
            case NodeType.BitwiseAndExpression: return "&";
            case NodeType.EqualsWithTypeConversionExpression: return "==";
            case NodeType.NotEqualsWithTypeConversionExpression: return "!=";
            case NodeType.EqualsExpression: return "===";
            case NodeType.NotEqualsExpression: return "!==";
            case NodeType.LessThanExpression: return "<";
            case NodeType.GreaterThanExpression: return ">";
            case NodeType.LessThanOrEqualExpression: return "<=";
            case NodeType.GreaterThanOrEqualExpression: return ">=";
            case NodeType.InstanceOfExpression: return "instanceof";
            case NodeType.InExpression: return "in";
            case NodeType.LeftShiftExpression: return "<<";
            case NodeType.SignedRightShiftExpression: return ">>";
            case NodeType.UnsignedRightShiftExpression: return ">>>";
            case NodeType.MultiplyExpression: return "*";
            case NodeType.DivideExpression: return "/";
            case NodeType.ModuloExpression: return "%";
            case NodeType.AddExpression: return "+";
            case NodeType.SubtractExpression: return "-";
        }

        throw Errors.invalidOperation();
    }

    export function getParameterList(ast: AST): ASTList {
        if (ast) {
            switch (ast.nodeType()) {
                case NodeType.ConstructorDeclaration:
                    return (<ConstructorDeclaration>ast).parameterList;
                case NodeType.FunctionDeclaration:
                    return getParameterList((<FunctionDeclaration>ast).callSignature);
                case NodeType.ParenthesizedArrowFunctionExpression:
                    return getParameterList((<ParenthesizedArrowFunctionExpression>ast).callSignature);
                case NodeType.ConstructSignature:
                    return getParameterList((<ConstructSignature>ast).callSignature);
                case NodeType.MemberFunctionDeclaration:
                    return getParameterList((<MemberFunctionDeclaration>ast).callSignature);
                case NodeType.FunctionPropertyAssignment:
                    return getParameterList((<FunctionPropertyAssignment>ast).callSignature);
                case NodeType.FunctionExpression:
                    return getParameterList((<FunctionExpression>ast).callSignature);
                case NodeType.MethodSignature:
                    return getParameterList((<MethodSignature>ast).callSignature);
                case NodeType.ConstructorType:
                    return (<ConstructorType>ast).parameterList;
                case NodeType.FunctionType:
                    return (<FunctionType>ast).parameterList;
                case NodeType.CallSignature:
                    return (<CallSignature>ast).parameterList;
                case NodeType.GetAccessor:
                    return (<GetAccessor>ast).parameterList;
                case NodeType.SetAccessor:
                    return (<SetAccessor>ast).parameterList;
            }
        }

        return null;
    }

    export function getTypeAnnotation(ast: AST): TypeReference {
        if (ast) {
            switch (ast.nodeType()) {
                case NodeType.FunctionDeclaration:
                    return getTypeAnnotation((<FunctionDeclaration>ast).callSignature);
                case NodeType.ParenthesizedArrowFunctionExpression:
                    return getTypeAnnotation((<ParenthesizedArrowFunctionExpression>ast).callSignature);
                case NodeType.ConstructSignature:
                    return getTypeAnnotation((<ConstructSignature>ast).callSignature);
                case NodeType.MemberFunctionDeclaration:
                    return getTypeAnnotation((<MemberFunctionDeclaration>ast).callSignature);
                case NodeType.FunctionPropertyAssignment:
                    return getTypeAnnotation((<FunctionPropertyAssignment>ast).callSignature);
                case NodeType.FunctionExpression:
                    return getTypeAnnotation((<FunctionExpression>ast).callSignature);
                case NodeType.MethodSignature:
                    return getTypeAnnotation((<MethodSignature>ast).callSignature);
                case NodeType.ConstructorType:
                    return (<ConstructorType>ast).type;
                case NodeType.FunctionType:
                    return (<FunctionType>ast).type;
                case NodeType.CallSignature:
                    return (<CallSignature>ast).typeAnnotation;
                case NodeType.GetAccessor:
                    return (<GetAccessor>ast).typeAnnotation;
            }
        }

        return null;
    }
}