// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='typescript.ts' />

module TypeScript {

    export function preBindImportPullSymbols(importDecl: PullDecl, context: PullSymbolBindingContext) {
        //var importDecl = <ImportDecl>ast;
        //var isExported = hasFlag(importDecl.varFlags, VarFlags.Exported);
        //var declFlags = isExported ? DeclFlags.Exported : DeclFlags.None;
        //var span = new ASTSpan();
        //span.minChar = importDecl.minChar;
        //span.limChar = importDecl.limChar;

        //var decl = new PullDecl(importDecl.id.actualText, DeclType.ImportDecl, declFlags, span, context.scriptName);
        //context.getParent().addChildDecl(decl);

        return false;
    }

    export function bindModulePullSymbol(moduleDecl: PullDecl, context: PullSymbolBindingContext) {

        // 1. Test for existing decl - if it exists, use its symbol
        // 2. If no other decl exists, create a new symbol and use that one
        
        // PULLTODO: Extends/Implements symbols
        var modName = moduleDecl.getName();
        var moduleSymbol: PullTypeSymbol = <PullTypeSymbol>findSymbolInContext(modName, DeclKind.Module, context, []);
        var createdNewSymbol = false;

        if (!moduleSymbol) {
            var moduleSymbol = new PullTypeSymbol(modName, DeclKind.Module);
            createdNewSymbol = true;
        }

        if (moduleDecl) {
            moduleSymbol.addDeclaration(moduleDecl);
            moduleDecl.setSymbol(moduleSymbol);            
        }

        context.semanticInfo.setSymbolForDecl(moduleDecl, moduleSymbol);
        
        if (createdNewSymbol) {
            var parent = context.getParent();

            if (parent) {
                var linkKind = moduleDecl.getDeclFlags() & DeclFlags.Exported ? SymbolLinkKind.PublicProperty : SymbolLinkKind.PrivateProperty;
                parent.addMember(moduleSymbol, linkKind);
            }
        }

        context.pushParent(moduleSymbol);

        var childDecls = moduleDecl.getChildDecls();

        for (var i = 0; i < childDecls.length; i++) {
            bindDeclSymbol(childDecls[i], context);
        }

        context.popParent();
    }

    export function bindClassPullSymbol(classDecl: PullDecl, context: PullSymbolBindingContext) {

        // PULLTODO: Check for name collisions
        // PULLTODO: Extends/Implements symbols
        var className = classDecl.getName();
        var classSymbol = new PullClassSymbol(className, DeclKind.Class);

        var instanceSymbol = new PullClassInstanceSymbol(className, DeclKind.ClassInstanceDecl);

        classSymbol.setInstanceType(instanceSymbol);
        
        classSymbol.addDeclaration(classDecl);
        instanceSymbol.addDeclaration(classDecl);

        classDecl.setSymbol(classSymbol);

        context.semanticInfo.setSymbolForDecl(classDecl, classSymbol);

        var parent = context.getParent();
        
        if (parent) {
            var linkKind = classDecl.getDeclFlags() & DeclFlags.Exported ? SymbolLinkKind.PublicProperty : SymbolLinkKind.PrivateProperty;
            parent.addMember(classSymbol, linkKind);
        }

        context.pushParent(classSymbol);

        var childDecls = classDecl.getChildDecls();

        for (var i = 0; i < childDecls.length; i++) {
            bindDeclSymbol(childDecls[i], context);
        }

        context.popParent();
    }

    export function bindInterfacePullSymbol(interfaceDecl: PullDecl, context: PullSymbolBindingContext) {

        // 1. Test for existing decl - if it exists, use its symbol
        // 2. If no other decl exists, create a new symbol and use that one
        var interfaceName = interfaceDecl.getName();
        var interfaceSymbol: PullTypeSymbol = <PullTypeSymbol>findSymbolInContext(interfaceName, DeclKind.Interface, context, []);
        var createdNewSymbol = false;

        if (!interfaceSymbol) {
            interfaceSymbol = new PullTypeSymbol(interfaceName, DeclKind.Interface);
            createdNewSymbol = true;
        }

        if (interfaceDecl) {
            interfaceSymbol.addDeclaration(interfaceDecl);
            interfaceDecl.setSymbol(interfaceSymbol);
        }

        context.semanticInfo.setSymbolForDecl(interfaceDecl, interfaceSymbol);
        
        if (createdNewSymbol) {
            var parent = context.getParent();

            if (parent) {
                var linkKind = interfaceDecl.getDeclFlags() & DeclFlags.Exported ? SymbolLinkKind.PublicProperty : SymbolLinkKind.PrivateProperty;
                parent.addMember(interfaceSymbol, linkKind);
            }
        }

        context.pushParent(interfaceSymbol);

        var childDecls = interfaceDecl.getChildDecls();

        for (var i = 0; i < childDecls.length; i++) {
            bindDeclSymbol(childDecls[i], context);
        }

        context.popParent();
    }

    export function bindVariablePullSymbol(varDecl: PullDecl, context: PullSymbolBindingContext) {
        var declFlags = varDecl.getDeclFlags();
        var declType = varDecl.getKind();
        var isProperty = false;
        var isStatic = false;
        var isExported = false;
        var linkKind = SymbolLinkKind.PrivateProperty;

        if (hasFlag(declFlags, DeclFlags.Exported)) {
            isExported = true;
            linkKind = SymbolLinkKind.PublicProperty;
        }
        if (hasFlag(declFlags, DeclFlags.Public)) {
            isProperty = true;
            linkKind = SymbolLinkKind.PublicProperty;
        }
        if (hasFlag(declFlags, DeclFlags.Static)) {
            isProperty = true;
            isStatic = true;
            linkKind = SymbolLinkKind.StaticProperty;
        }
        if (hasFlag(declFlags, DeclFlags.Private)) {
            isProperty = true;
        }

        var declType =  varDecl ? varDecl.getKind() :
                        isStatic ? DeclKind.StaticField :
                            isProperty ? DeclKind.Field : DeclKind.Variable;

        var declName = varDecl.getName();
        var variableSymbol = new PullSymbol(declName, declType);
        var parent = context.getParent();

        if (varDecl) {
            variableSymbol.addDeclaration(varDecl);
            varDecl.setSymbol(variableSymbol);
        }

        if (parent) {
            if (parent.hasBrand()) {
                var classTypeSymbol = <PullClassSymbol>parent;
                if (isStatic) {
                    classTypeSymbol.addStaticMember(variableSymbol);
                }
                else {
                    classTypeSymbol.getInstanceType().addMember(variableSymbol, linkKind);
                }
            }
            else {
                if (isProperty || isStatic || isExported) {
                    parent.addMember(variableSymbol, linkKind);
                }
                else {
                    variableSymbol.addOutgoingLink(parent, SymbolLinkKind.ContainedBy);
                }
            }
        }
    }

    export function bindParameterSymbols(funcDecl: FuncDecl, context: PullSymbolBindingContext, signatureSymbol: PullSignatureSymbol) {
        // create a symbol for each ast
        // if it's a property, add the symbol to the enclosing type's member list
        var parameters: PullSymbol[] = [];
        var decl: PullDecl = null;
        var argDecl: BoundDecl = null;
        var parameterSymbol: PullSymbol = null;
        var isProperty = false;

        if (funcDecl.args) {

            for (var i = 0; i < funcDecl.args.members.length; i++) {
                argDecl = <BoundDecl>funcDecl.args.members[i];
                decl = context.semanticInfo.getDeclForAST(argDecl);
                isProperty = hasFlag(argDecl.varFlags, VarFlags.Property);
                parameterSymbol = new PullSymbol(argDecl.id.actualText, DeclKind.Variable);
                
                if (decl) {
                    parameterSymbol.addDeclaration(decl);
                    decl.setSymbol(parameterSymbol);
                }

                signatureSymbol.addParameter(parameterSymbol);

                // add a member to the parent type
                if (decl && isProperty) {
                    parameterSymbol = new PullSymbol(argDecl.id.actualText, DeclKind.Field);

                    parameterSymbol.addDeclaration(decl);
                    decl.setPropertySymbol(parameterSymbol);

                    var linkKind = (decl.getDeclFlags() & DeclFlags.Private) ? SymbolLinkKind.PrivateProperty : SymbolLinkKind.PublicProperty;
                    var parent = context.getParent(1);
                    if (parent.hasBrand()) {
                        (<PullClassSymbol>parent).getInstanceType().addMember(parameterSymbol, linkKind);
                    }
                    else {
                        // PULLTODO: I don't think we ever even take this branch...
                        parent.addMember(parameterSymbol, linkKind);
                    }
                }
            }
        }
        
    }

    export function bindFunctionPullSymbol(funcDecl: PullDecl, context: PullSymbolBindingContext) {  
        var declKind = funcDecl.getKind();
        var declFlags = funcDecl.getDeclFlags();
        var isProperty = false;
        var isPrivate = false;
        var isStatic = false;
        var isExported = false;

        if (declKind & DeclKind.Property) {
            isProperty = true;
        }
        if (declKind & DeclKind.StaticProperty) {
            isProperty = true;
            isStatic = true;
        }
        if (declFlags & DeclFlags.Private) {
            isProperty = true;
            isPrivate = true;
        }
        if (declFlags & DeclFlags.Exported) {
            isExported = true;
        }

        var funcName = funcDecl.getName();

        // 1. Test for existing decl - if it exists, use its symbol
        // 2. If no other decl exists, create a new symbol and use that one

        var isConstructor: bool = (declFlags & DeclFlags.Constructor) != 0;
        var isIndex: bool = (declFlags & DeclFlags.Index) != 0;
        var isSignature: bool = (declKind & DeclKind.SomeSignature) != 0;

        var functionSymbol: PullFunctionSymbol = <PullFunctionSymbol>findSymbolInContext(funcName, declKind, context, []);

        // if it's a function definition, add a call signature to this signature
        // if it's a function signature, add a call signature to this signature
        //
        // if it's a constructor definition, add a construct signature to the parent
        // if it's an index signature, add an index signature to the parent
        // if it's a call signature, add a call signature to the parent
        // if it's a construct signature, add a construct signature to the parent

        var linkKind = isStatic ? SymbolLinkKind.StaticProperty :
                        isPrivate ? SymbolLinkKind.PrivateProperty : SymbolLinkKind.PublicProperty;

        if (!functionSymbol) {
            // PULLTODO: Make sure that we properly flag signature decl types when collecting decls
            functionSymbol = new PullFunctionSymbol(funcName, isProperty ? DeclKind.Method : DeclKind.Function);
        }

        if (funcDecl) {
            funcDecl.setSymbol(functionSymbol);
            functionSymbol.addDeclaration(funcDecl);
            context.semanticInfo.setSymbolForDecl(funcDecl, functionSymbol);
        }

        var parent = context.getParent();
        
        if (parent && !isConstructor) {

            if (parent.hasBrand()) {
                if (isStatic) {
                    (<PullClassSymbol>parent).addStaticMember(functionSymbol);
                }
                else {
                    (<PullClassSymbol>parent).getInstanceType().addMember(functionSymbol, linkKind);
                }

            }
            else {

                if (isProperty || isExported) {
                    parent.addMember(functionSymbol, linkKind);
                }
                else {
                    functionSymbol.addOutgoingLink(parent, SymbolLinkKind.ContainedBy);
                }
            }
        }

        if (!isSignature) {
            context.pushParent(functionSymbol);
        }

        var sigKind = isConstructor ? DeclKind.ConstructSignature :
                        isIndex ? DeclKind.IndexSignature : DeclKind.CallSignature;

        var signature = isSignature ? new PullSignatureSymbol("", sigKind) : new PullDefinitionSignatureSymbol("", sigKind);

        bindParameterSymbols(<FuncDecl>context.semanticInfo.getASTForDecl(funcDecl), context, signature);

        // add the implicit call member for this function type
        if (funcName && !(isConstructor || isIndex)) {
            functionSymbol.addSignature(signature);
        }
        else if (parent) {
            if (isConstructor) {
                parent.addConstructSignature(signature);
            }
            else if (isIndex) {
                parent.addIndexSignature(signature);
            }
            else {
                parent.addCallSignature(signature);
            }
        }
        
        if (!isSignature) {
            var childDecls = funcDecl.getChildDecls();

            for (var i = 0; i < childDecls.length; i++) {
                bindDeclSymbol(childDecls[i], context);
            }

            context.popParent();
        }
    }

    export function bindDeclSymbol(decl: PullDecl, context: PullSymbolBindingContext): void {
        if (!decl) {
            return;
        }

        switch (decl.getKind()) {
            case DeclKind.Script:
                var childDecls = decl.getChildDecls();
                for (var i = 0; i < childDecls.length; i++) {
                    bindDeclSymbol(childDecls[i], context);
                }
                break;
            case DeclKind.Module:
                bindModulePullSymbol(decl, context);
                break;
            case DeclKind.Interface:
                bindInterfacePullSymbol(decl, context);
                break;
            case DeclKind.Class:
                bindClassPullSymbol(decl, context);
                break;
            case DeclKind.Method:
            case DeclKind.StaticMethod:
            case DeclKind.Function:
                bindFunctionPullSymbol(decl, context);
                break;
            case DeclKind.Field:
            case DeclKind.StaticField:
            case DeclKind.Variable:
                bindVariablePullSymbol(decl, context);
                break;
        }

    }

}