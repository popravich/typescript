// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='typescript.ts' />

module TypeScript {

    export class DataMap {
        public map: any = {};

        public link(id: string, data: any) {
            this.map[id] = data;
        }

        public unlink(id: string) {
            this.map[id] = undefined;
        }

        //public unlinkChildren(ast:AST) {
        //    TypeScript.getAstWalkerFactory().walk(ast, (ast: AST, parent: AST): AST => { this.unlink(ast); });
        //}

        public read(id: string) {
            return this.map[id];
        }

        public flush() {
            this.map = {};
        }

        public unpatch() { return null; }
    }

    export class PatchedDataMap extends DataMap {
        public diffs: any = {};
        
        constructor (public parent: DataMap) {
            super();
        }

        public link(id: string, data: any) {
            this.diffs[id] = data;
        }

        public unlink(id: string) {
            this.diffs[id] = undefined;
        }

        public read(id: string) {

            var data = this.diffs[id];
            
            if (data) {
                return data;
            }

            return this.parent.read(id);
        }

        public flush() {
            this.diffs = {};
        }

        public unpatch() { 
            this.flush();
            return this.parent;
        }
    }

    export function prePullTypeCheck(ast: AST, parent: AST, walker: IAstWalker): AST {

        var typeChecker: PullTypeChecker = walker.state;

        var go = false;

        if (ast.nodeType == NodeType.Script) {
            ast = typeChecker.typeCheckScript(<Script>ast);
            go = true;
        }
        else if (ast.nodeType == NodeType.VarDecl) {
            ast = typeChecker.typeCheckBoundDecl(<BoundDecl>ast);
        }
        else if (ast.nodeType == NodeType.ArgDecl) {
           ast = typeChecker.typeCheckBoundDecl(<BoundDecl>ast);
        }
        else if (ast.nodeType == NodeType.This) {
            ast = typeChecker.typeCheckThis(ast);
        }
        else if (ast.nodeType == NodeType.Name) {
            ast = typeChecker.typeCheckName(ast);
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
        else if (ast.nodeType == NodeType.ObjectLit) {
            ast = typeChecker.typeCheckObjectLit(<UnaryExpression>ast);
        }
        else if (ast.nodeType == NodeType.Return) {
            ast = typeChecker.typeCheckReturn(<ReturnStatement>ast);
        }
        else if (ast.nodeType == NodeType.New) {
            ast = typeChecker.typeCheckNew(ast);
        }
        else if (ast.nodeType == NodeType.Call) {
            ast = typeChecker.typeCheckCall(ast);
        }

        walker.options.goChildren = go;
        return ast;
    }

    export class PullTypeChecker {

        public typingMap: DataMap = new DataMap();
        public errorMap: DataMap = new DataMap();
        public symbolTypeCheckStatusMap: DataMap = new DataMap();

        public semanticInfoChain: SemanticInfoChain;

        constructor (semanticInfoChain) {
            this.semanticInfoChain = semanticInfoChain;
        }

        public setType(ast: AST, type: PullSymbol) {
            this.typingMap.link(ast.getID().toString(), type);
        }

        public typeCheck(ast: AST): AST {
            return null;
        }

        public typeCheckScript(script: Script): Script {
            return null;
        }

        public typeCheckBoundDecl(varDecl: BoundDecl): VarDecl {
            return null;
        }

        public typeCheckThis(ast: AST): AST {
            return null;
        }

        public typeCheckName(ast: AST): AST {
            return null;
        }

        public typeCheckAsgOperator(ast: AST): AST {
            return null;
        }

        public typeCheckFunction(funcDecl: FuncDecl): FuncDecl {
            return null;
        }

        public typeCheckClass(classDecl: ClassDecl): ClassDecl {
            return null;
        }

        public typeCheckInterface(interfaceDecl: TypeDecl): TypeDecl {
            return null;
        }

        public typeCheckModule(moduleDecl: ModuleDecl): ModuleDecl {
            return null;
        }

        public typeCheckObjectLit(objectLit: UnaryExpression): UnaryExpression {
            return null;
        }

        public typeCheckReturn(returnStmt: ReturnStatement): ReturnStatement {
            return null;
        }

        public typeCheckNew(ast: AST): AST {
            return null;
        }

        public typeCheckCall(ast: AST): AST {
            return null;
        }

        public updateTypes(oldInfo: SemanticInfo, newInfo: SemanticInfo) {

        }
    }
}
