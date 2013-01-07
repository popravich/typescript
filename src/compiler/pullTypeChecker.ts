// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='typescript.ts' />

module TypeScript {

    export function prePullTypeCheck(ast: AST, parent: AST, walker: IAstWalker): AST {

        var typeChecker: PullTypeChecker = walker.state;

        var go = false;

        if (ast.nodeType == NodeType.Script) {
            ast = typeChecker.typeCheckScript(<Script>ast);
            go = true;
        }
        if (ast.nodeType == NodeType.List) {
            go = true;
        }
        else if (ast.nodeType == NodeType.VarDecl) {
            ast = typeChecker.typeCheckBoundDecl(<BoundDecl>ast);
        }
        else if (ast.nodeType == NodeType.Asg) {
            ast = typeChecker.typeCheckAsgOperator(ast);
        }
        else if (ast.nodeType == NodeType.FuncDecl) {
            ast = typeChecker.typeCheckFunction(<FuncDecl>ast);
            go = true;
        }
        else if (ast.nodeType == NodeType.Class) {
            ast = typeChecker.typeCheckClass(<ClassDecl>ast);
            go = true;
        }
        else if (ast.nodeType == NodeType.Interface) {
            ast = typeChecker.typeCheckInterface(<TypeDecl>ast);
            go = true;
        }
        else if (ast.nodeType == NodeType.Module) {
            ast = typeChecker.typeCheckModule(<ModuleDecl>ast);
            go = true;
        }
        //else if (ast.nodeType == NodeType.This) {
        //    ast = typeChecker.typeCheckThis(ast);
        //}
        //else if (ast.nodeType == NodeType.Name) {
        //    ast = typeChecker.typeCheckName(ast);
        //}
        //else if (ast.nodeType == NodeType.ObjectLit) {
        //    ast = typeChecker.typeCheckObjectLit(<UnaryExpression>ast);
        //}
        //else if (ast.nodeType == NodeType.Return) {
        //    ast = typeChecker.typeCheckReturn(<ReturnStatement>ast);
        //}
        //else if (ast.nodeType == NodeType.New) {
        //    ast = typeChecker.typeCheckNew(ast);
        //}
        //else if (ast.nodeType == NodeType.Call) {
        //    ast = typeChecker.typeCheckCall(ast);
        //}

        walker.options.goChildren = go;
        return ast;
    }

    export class PullTypeChecker {

        public typingMap: DataMap = new DataMap();
        public errorMap: DataMap = new DataMap();
        public symbolTypeCheckStatusMap: DataMap = new DataMap();

        public semanticInfoChain: SemanticInfoChain;

        public resolver: PullTypeResolver = null;

        constructor (semanticInfoChain) {
            this.semanticInfoChain = semanticInfoChain;
        }

        public setUnit(unitPath: string, logger?: ILogger) {
            this.resolver = new PullTypeResolver(this.semanticInfoChain, unitPath, logger);
        }

        public typeCheck(ast: AST): AST {
            return ast;
        }

        public typeCheckScript(script: Script): Script {
            return script;
        }

        public typeCheckFunction(funcDecl: FuncDecl): FuncDecl {
            var sym = this.resolver.resolveFunctionDeclaration(funcDecl);
            return funcDecl;
        }

        public typeCheckClass(classDecl: ClassDecl): ClassDecl {
            var sym = this.resolver.resolveClassDeclaration(classDecl);
            return classDecl;
        }

        public typeCheckInterface(interfaceDecl: TypeDecl): TypeDecl {
            var sym = this.resolver.resolveInterfaceDeclaration(interfaceDecl);
            return interfaceDecl;
        }

        public typeCheckModule(moduleDecl: ModuleDecl): ModuleDecl {
            var sym = this.resolver.resolveModuleDeclaration(moduleDecl);
            return moduleDecl;
        }

        public typeCheckBoundDecl(varDecl: BoundDecl): BoundDecl {
            var sym = this.resolver.resolveVariableDeclaration(varDecl);
            return varDecl;
        }

        public typeCheckThis(ast: AST): AST {
            return ast;
        }

        public typeCheckName(ast: AST): AST {
            return ast;
        }

        public typeCheckAsgOperator(ast: AST): AST {
            return ast;
        }

        public typeCheckObjectLit(objectLit: UnaryExpression): UnaryExpression {
            return objectLit;
        }

        public typeCheckReturn(returnStmt: ReturnStatement): ReturnStatement {
            return returnStmt;
        }

        public typeCheckNew(ast: AST): AST {
            return ast;
        }

        public typeCheckCall(ast: AST): AST {
            return ast;
        }
    }
}
