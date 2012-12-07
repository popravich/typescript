// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='typescript.ts' />

module TypeScript {

    export class DeclCollectionContext {

        private parentChain: PullDecl[] = [];
        public scriptName: string = "";

        constructor (public semanticInfo: SemanticInfo) {
        }

        public getParent() { return this.parentChain ? this.parentChain[this.parentChain.length - 1] : null; }

        public pushParent(parentDecl: PullDecl) { if (parentDecl) { this.parentChain[this.parentChain.length] = parentDecl; } }

        public popParent() { this.parentChain.length--; }
    }

    export function preCollectImportDecls(ast: AST, parent: AST, context: DeclCollectionContext) {
        var importDecl = <ImportDecl>ast;
        var isExported = hasFlag(importDecl.varFlags, VarFlags.Exported);
        var declFlags = isExported ? DeclFlags.Exported : DeclFlags.None;
        var span = new ASTSpan();

        span.minChar = importDecl.minChar;

        span.limChar = importDecl.limChar

        var decl = new PullDecl(importDecl.id.actualText, DeclKind.Import, declFlags, span, context.scriptName);

        context.getParent().addChildDecl(decl);

        context.semanticInfo.setDeclForAST(ast, decl);

        context.semanticInfo.setASTForDecl(decl,ast);

        return false;
    }

    export function preCollectModuleDecls(ast: AST, parent: AST, context: DeclCollectionContext) {
        var moduleDecl: ModuleDecl = <ModuleDecl>ast;
        var declFlags = DeclFlags.None;

        if (hasFlag(moduleDecl.modFlags, ModuleFlags.Ambient)) {
            declFlags |= DeclFlags.Ambient;
        }

        if (hasFlag(moduleDecl.modFlags, ModuleFlags.IsEnum)) {
            declFlags |= DeclFlags.Enum;
        }

        if (hasFlag(moduleDecl.modFlags, ModuleFlags.Exported)) {
            declFlags |= DeclFlags.Exported;
        }

        var modName = (<Identifier>moduleDecl.name).text;
        var span = new ASTSpan();

        span.minChar = moduleDecl.minChar;

        span.limChar = moduleDecl.limChar;

        var isDynamic = isQuoted(modName);
        var decl = new PullDecl(modName, isDynamic ? DeclKind.DynamicModule : DeclKind.Module, declFlags, span, context.scriptName);

        context.getParent().addChildDecl(decl);

        context.pushParent(decl);

        context.semanticInfo.setDeclForAST(ast, decl);

        context.semanticInfo.setASTForDecl(decl,ast);

        return true;
    }

    export function preCollectClassDecls(ast: AST, parent: AST, context: DeclCollectionContext) {
        var classDecl = <ClassDecl>ast;
        var declFlags = DeclFlags.None;

        if (hasFlag(classDecl.varFlags, VarFlags.Ambient)) {
            declFlags |= DeclFlags.Ambient;
        }

        if (hasFlag(classDecl.varFlags, VarFlags.Exported)) {
            declFlags |= DeclFlags.Exported;
        }

        var span = new ASTSpan();

        span.minChar = classDecl.minChar;

        span.limChar = classDecl.limChar;

        var decl = new PullDecl(classDecl.name.text, DeclKind.Class, declFlags, span, context.scriptName);

        context.getParent().addChildDecl(decl);

        context.pushParent(decl);

        context.semanticInfo.setDeclForAST(ast, decl);

        context.semanticInfo.setASTForDecl(decl,ast);

        return true;
    }

    export function preCollectInterfaceDecls(ast: AST, parent: AST, context: DeclCollectionContext) {
        var interfaceDecl = <TypeDecl>ast;
        var declFlags = DeclFlags.None;

        if (hasFlag(interfaceDecl.varFlags, VarFlags.Exported)) {
            declFlags |= DeclFlags.Exported;
        }

        var span = new ASTSpan();

        span.minChar = interfaceDecl.minChar;

        span.limChar = interfaceDecl.limChar;

        var decl = new PullDecl(interfaceDecl.name.text, DeclKind.Interface, declFlags, span, context.scriptName);

        context.getParent().addChildDecl(decl);

        context.pushParent(decl);

        context.semanticInfo.setDeclForAST(ast, decl);

        context.semanticInfo.setASTForDecl(decl,ast);

        return true;
    }

    export function preCollectArgDecls(ast: AST, parent: AST, context: DeclCollectionContext) {
        var argDecl = <BoundDecl>ast;
        var declFlags = DeclFlags.None;

        if (hasFlag(argDecl.varFlags, VarFlags.Private)) {
            declFlags |= DeclFlags.Private;
        }

        var declType = hasFlag(argDecl.varFlags, VarFlags.Property) ? DeclKind.Field : DeclKind.Argument;

        var span = new ASTSpan();

        span.minChar = argDecl.minChar;

        span.limChar = argDecl.limChar;

        var decl = new PullDecl(argDecl.id.text, declType, declFlags, span, context.scriptName);

        context.getParent().addChildDecl(decl);

        context.semanticInfo.setDeclForAST(ast, decl);

        context.semanticInfo.setASTForDecl(decl,ast);
        
        return false;
    }

    export function preCollectVarDecls(ast: AST, parent: AST, context: DeclCollectionContext) {
        var varDecl = <VarDecl>ast;
        var declFlags = DeclFlags.None;
        var declType = DeclKind.Variable;
        var isProperty = false;
        var isStatic = false;

        if (hasFlag(varDecl.varFlags, VarFlags.Ambient)) {
            declFlags |= DeclFlags.Ambient;
        }

        if (hasFlag(varDecl.varFlags, VarFlags.Exported)) {
            declFlags |= DeclFlags.Exported;
        }

        if (hasFlag(varDecl.varFlags, VarFlags.Property)) {
            isProperty = true;
            declFlags |= DeclFlags.Public;
        }

        if (hasFlag(varDecl.varFlags, VarFlags.Static)) {
            isProperty = true;
            isStatic = true;
        }

        if (hasFlag(varDecl.varFlags, VarFlags.Private)) {
            isProperty = true;
            declFlags |= DeclFlags.Private;
        }

        if (hasFlag(varDecl.id.flags, ASTFlags.OptionalName)) {
            declFlags |= DeclFlags.Optional;
        }

        if (isStatic) {
            declType = DeclKind.StaticField;
        }
        else if (isProperty) {
            declType = DeclKind.Field;
        }
        
        var span = new ASTSpan();

        span.minChar = varDecl.minChar;

        span.limChar = varDecl.limChar;

        var decl = new PullDecl(varDecl.id.text, declType, declFlags, span, context.scriptName);

        context.getParent().addChildDecl(decl);

        context.semanticInfo.setDeclForAST(ast, decl);

        context.semanticInfo.setASTForDecl(decl,ast);

        return false;
    }

    export function preCollectFuncDecls(ast: AST, parent: AST, context: DeclCollectionContext) {

        var funcDecl = <FuncDecl>ast;
        var declFlags = DeclFlags.None;
        var declType = DeclKind.Function;
        var isProperty = false;
        var isStatic = false;
        var isOverload

        if (hasFlag(funcDecl.fncFlags, FncFlags.Ambient)) {
            declFlags |= DeclFlags.Ambient;
        }

        if (hasFlag(funcDecl.fncFlags, FncFlags.Exported)) {
            declFlags |= DeclFlags.Exported;
        }

        if (hasFlag(funcDecl.fncFlags, FncFlags.Method)) {
            isProperty = true;
        }

        if (hasFlag(funcDecl.fncFlags, FncFlags.Static)) {
            isProperty = true;
            isStatic = true;
        }

        if (hasFlag(funcDecl.fncFlags, FncFlags.Private)) {
            isProperty = true;
            declFlags |= DeclFlags.Private;
        }

        if (hasFlag(funcDecl.fncFlags, FncFlags.ConstructMember) || funcDecl.isConstructor) {
            declFlags |= DeclFlags.Constructor;
        }

        if (hasFlag(funcDecl.fncFlags, FncFlags.CallMember)) {
            declFlags |= DeclFlags.Call;
        }

        if (hasFlag(funcDecl.fncFlags, FncFlags.IndexerMember)) {
            declFlags |= DeclFlags.Index;
        }

        if (funcDecl.isSignature()) {
            declFlags |= DeclFlags.Signature;
        }

        if (funcDecl.isGetAccessor()) {
            declFlags |= DeclFlags.GetAccessor;
        }

        if (funcDecl.isSetAccessor()) {
            declFlags |= DeclFlags.SetAccessor;
        }

        if (funcDecl.name && hasFlag(funcDecl.name.flags, ASTFlags.OptionalName)) {
            declFlags |= DeclFlags.Optional;
        }

        if (isStatic) {
            declType = DeclKind.StaticMethod;
        }
        else if (isProperty) {
            declType = DeclKind.Method;
        }

        var span = new ASTSpan();

        span.minChar = funcDecl.minChar;

        span.limChar = funcDecl.limChar;

        var funcName = funcDecl.name ? funcDecl.name.text : funcDecl.hint;

        var decl = new PullDecl(funcName, declType, declFlags, span, context.scriptName);

        // parent could be null if we're collecting decls for a lambda expression
        var parent = context.getParent();

        if (parent) {
            parent.addChildDecl(decl);
        }
        context.pushParent(decl);

        context.semanticInfo.setDeclForAST(ast, decl);

        context.semanticInfo.setASTForDecl(decl, ast);

        return true;
    }

    export function preCollectDecls(ast: AST, parent: AST, walker: IAstWalker) {
        var context: DeclCollectionContext = walker.state;
        var go = false;

        if (ast.nodeType == NodeType.Script) {
            var script: Script = <Script>ast;
            var span = new ASTSpan();

            span.minChar = script.minChar;

            span.limChar = script.limChar;

            var decl = new PullDecl(context.scriptName, DeclKind.Script, DeclFlags.None, span, context.scriptName);

            context.pushParent(decl);

            go = true;
        }
        else if (ast.nodeType == NodeType.List) {
            go = true;
        }
        else if (ast.nodeType == NodeType.Import) {
            go = preCollectImportDecls(ast, parent, context);
        }
        else if (ast.nodeType == NodeType.If) {
            go = true;
        }
        else if (ast.nodeType == NodeType.For) {
            go = true;
        }
        else if (ast.nodeType == NodeType.ForIn) {
            go = true;
        }
        else if (ast.nodeType == NodeType.While) {
            go = true;
        }
        else if (ast.nodeType == NodeType.DoWhile) {
            go = true;
        }
        else if (ast.nodeType == NodeType.Module) {
            go = preCollectModuleDecls(ast, parent, context);
        }
        else if (ast.nodeType == NodeType.Class) {
            go = preCollectClassDecls(ast, parent, context);
        }
        else if (ast.nodeType == NodeType.Block) {
            go = true;
        }
        else if (ast.nodeType == NodeType.Interface) {
            go = preCollectInterfaceDecls(ast, parent, context);
        }
        else if (ast.nodeType == NodeType.ArgDecl) {
            go = preCollectArgDecls(ast, parent, context);
        }
        else if (ast.nodeType == NodeType.VarDecl) {
            go = preCollectVarDecls(ast, parent, context);
        }
        else if (ast.nodeType == NodeType.FuncDecl) {
            go = preCollectFuncDecls(ast, parent, context);
        }

        walker.options.goChildren = go;

        return ast;
    }

    export function postCollectDecls(ast: AST, parent: AST, walker: IAstWalker) {
        var context: DeclCollectionContext = walker.state;

        // Note that we never pop the Script - after the traversal, it should be the
        // one parent left in the context

        if (ast.nodeType == NodeType.Module) {
            context.popParent();
        }
        else if (ast.nodeType == NodeType.Class) {
            context.popParent();
        }
        else if (ast.nodeType == NodeType.Interface) {
            context.popParent();
        }
        else if (ast.nodeType == NodeType.FuncDecl) {
            context.popParent();
        }

        return ast;
    }
}