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
        var modName = moduleDecl.getDeclName();
        var symbol: PullSymbol = findSymbolInContext(modName, DeclKind.Module, context, []);
        var createdNewSymbol = false;

        if (!symbol) {
            var symbol = new PullSymbol(modName, DeclKind.Module);
            createdNewSymbol = true;
        }

        if (moduleDecl) {
            symbol.addDeclaration(moduleDecl);
            moduleDecl.setSymbol(symbol);            
        }

        context.semanticInfo.setSymbolForDecl(moduleDecl, symbol);
        
        if (createdNewSymbol) {
            var parent = context.getParent();

            if (parent) {
                var linkKind = moduleDecl.getDeclFlags() & DeclFlags.Exported ? SymbolLinkKind.PublicProperty : SymbolLinkKind.PrivateProperty;
                parent.addOutgoingLink(symbol, linkKind);
                symbol.addOutgoingLink(parent, SymbolLinkKind.ContainedBy);
            }
        }

        context.pushParent(symbol);

        var childDecls = moduleDecl.getChildDecls();

        for (var i = 0; i < childDecls.length; i++) {
            bindDeclSymbol(childDecls[i], context);
        }

        context.popParent();
    }

    export function bindClassPullSymbol(classDecl: PullDecl, context: PullSymbolBindingContext) {

        // PULLTODO: Check for name collisions
        // PULLTODO: Extends/Implements symbols
        var className = classDecl.getDeclName();
        var symbol = new PullSymbol(className, DeclKind.Class);

        var instanceSymbol = new PullSymbol(className, DeclKind.ClassInstanceDecl);

        symbol.addOutgoingLink(instanceSymbol, SymbolLinkKind.InstanceType);
        
        symbol.addDeclaration(classDecl);
        
        classDecl.setSymbol(symbol);

        context.semanticInfo.setSymbolForDecl(classDecl, symbol);

        var parent = context.getParent();
        
        if (parent) {
            var linkKind = classDecl.getDeclFlags() & DeclFlags.Exported ? SymbolLinkKind.PublicProperty : SymbolLinkKind.PrivateProperty;

            parent.addOutgoingLink(symbol, linkKind);

            symbol.addOutgoingLink(parent, SymbolLinkKind.ContainedBy);
        }

        context.pushParent(symbol);

        var childDecls = classDecl.getChildDecls();

        for (var i = 0; i < childDecls.length; i++) {
            bindDeclSymbol(childDecls[i], context);
        }

        context.popParent();
    }

    export function bindInterfacePullSymbol(interfaceDecl: PullDecl, context: PullSymbolBindingContext) {

        // 1. Test for existing decl - if it exists, use its symbol
        // 2. If no other decl exists, create a new symbol and use that one
        var interfaceName = interfaceDecl.getDeclName();
        var symbol: PullSymbol = findSymbolInContext(interfaceName, DeclKind.Interface, context, []);
        var createdNewSymbol = false;

        if (!symbol) {
            symbol = new PullSymbol(interfaceName, DeclKind.Interface);
            createdNewSymbol = true;
        }

        if (interfaceDecl) {
            symbol.addDeclaration(interfaceDecl);
            interfaceDecl.setSymbol(symbol);
        }

        context.semanticInfo.setSymbolForDecl(interfaceDecl, symbol);
        
        if (createdNewSymbol) {
            var parent = context.getParent();

            if (parent) {
                var linkKind = interfaceDecl.getDeclFlags() & DeclFlags.Exported ? SymbolLinkKind.PublicProperty : SymbolLinkKind.PrivateProperty;
                parent.addOutgoingLink(symbol, linkKind);
                symbol.addOutgoingLink(parent, SymbolLinkKind.ContainedBy);
            }
        }

        context.pushParent(symbol);

        var childDecls = interfaceDecl.getChildDecls();

        for (var i = 0; i < childDecls.length; i++) {
            bindDeclSymbol(childDecls[i], context);
        }

        context.popParent();
    }

    export function bindVariablePullSymbol(varDecl: PullDecl, context: PullSymbolBindingContext) {
        var declFlags = varDecl.getDeclFlags();
        var declType = varDecl.getDeclKind();
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

        var declType =  varDecl ? varDecl.getDeclKind() :
                        isStatic ? DeclKind.StaticField :
                            isProperty ? DeclKind.Field : DeclKind.Variable;

        var declName = varDecl.getDeclName();
        var symbol = new PullSymbol(declName, declType);
        var parent = context.getParent();

        if (varDecl) {
            symbol.addDeclaration(varDecl);
            varDecl.setSymbol(symbol);
        }

        if (parent) {

            if (isProperty || isStatic || isExported) {
                parent.addOutgoingLink(symbol, linkKind);
            }

            symbol.addOutgoingLink(parent, SymbolLinkKind.ContainedBy);
        }
    }

    export function bindParameterSymbols(funcDecl: FuncDecl, context: PullSymbolBindingContext, signatureSymbol: PullSymbol) {
        // create a symbol for each ast
        // if it's a property, add the symbol to the enclosing type's member list
        var parameters: PullSymbol[] = [];
        var decl: PullDecl = null;
        var argDecl: BoundDecl = null;
        var parameterSymbol: PullSymbol = null;
        var isProperty = false;
        var parent = context.getParent();

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

                signatureSymbol.addOutgoingLink(parameterSymbol, SymbolLinkKind.Parameter);

                // add a member to the parent type
                if (decl && isProperty) {
                    parameterSymbol = new PullSymbol(argDecl.id.actualText, DeclKind.Field);

                    parameterSymbol.addDeclaration(decl);

                    var linkKind = (decl.getDeclFlags() & DeclFlags.Private) ? SymbolLinkKind.PrivateProperty : SymbolLinkKind.PublicProperty;

                    parent.addOutgoingLink(parameterSymbol, linkKind);
                    parameterSymbol.addOutgoingLink(parent, SymbolLinkKind.ContainedBy);
                }
            }
        }
        
        // DO NOT set the last bound symbol here
    }

    export function bindFunctionPullSymbol(funcDecl: PullDecl, context: PullSymbolBindingContext) {  
        var declKind = funcDecl.getDeclKind();
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

        var funcName = funcDecl.getDeclName();

        // 1. Test for existing decl - if it exists, use its symbol
        // 2. If no other decl exists, create a new symbol and use that one

        var isConstructor: bool = (declFlags & DeclFlags.Constructor) != 0;
        var isIndex: bool = (declFlags & DeclFlags.Index) != 0;
        var isSignature: bool = (declKind & DeclKind.SomeSignature) != 0;

        var symbol: PullSymbol = findSymbolInContext(funcName, declKind, context, []);

        // if it's a function definition, add a call signature to this signature
        // if it's a function signature, add a call signature to this signature
        //
        // if it's a constructor definition, add a construct signature to the parent
        // if it's an index signature, add an index signature to the parent
        // if it's a call signature, add a call signature to the parent
        // if it's a construct signature, add a construct signature to the parent


        if (!symbol) {
            // PULLTODO: Make sure that we properly flag signature decl types when collecting decls
            symbol = new PullSymbol(funcName, isProperty ? DeclKind.Method : DeclKind.Function);
        }

        if (funcDecl) {
            funcDecl.setSymbol(symbol);
            symbol.addDeclaration(funcDecl);
            context.semanticInfo.setSymbolForDecl(funcDecl, symbol);
        }

        var parent = context.getParent();
        
        if (parent) {

            if (isProperty || isStatic || isExported) {

                var linkKind = isStatic ? SymbolLinkKind.StaticProperty :
                                isPrivate ? SymbolLinkKind.PrivateProperty : SymbolLinkKind.PublicProperty;

                parent.addOutgoingLink(symbol, linkKind);
            }

            symbol.addOutgoingLink(parent, SymbolLinkKind.ContainedBy);
        }

        if (!isSignature) {
            context.pushParent(symbol);
        }

        var sigKind = isConstructor ? DeclKind.ConstructSignature :
                        isIndex ? DeclKind.IndexSignature : DeclKind.CallSignature;

        var signature = new PullSymbol("", sigKind);

        bindParameterSymbols(<FuncDecl>context.semanticInfo.getASTForDecl(funcDecl), context, signature);

        // add the implicit call member for this function type
        if (funcName) {
            if (isConstructor) {
                symbol.addOutgoingLink(signature, SymbolLinkKind.ConstructSignature);
            }
            else {
                symbol.addOutgoingLink(signature, SymbolLinkKind.CallSignature);
            }
        }
        else if (parent) {
            if (isConstructor) {
                parent.addOutgoingLink(signature, SymbolLinkKind.ConstructSignature);
            }
            else if (isIndex) {
                parent.addOutgoingLink(signature, SymbolLinkKind.IndexSignature);
            }
            else {
                parent.addOutgoingLink(signature, SymbolLinkKind.CallSignature);
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

        switch (decl.getDeclKind()) {
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
            case DeclKind.Function:
                bindFunctionPullSymbol(decl, context);
                break;
            case DeclKind.Variable:
                bindVariablePullSymbol(decl, context);
                break;
        }

    }

}