// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='typescript.ts' />


module TypeScript {

    // The resolver associates types with a given AST
    export class PullTypeResolver {

        constructor (private semanticInfoChain: SemanticInfoChain, private unitPath: string) { }

        public getUnitPath() { return this.unitPath; }
        
        public setUnitPath(unitPath: string) { this.unitPath = unitPath; }

        private getDeclForAST(ast: AST, unitPath?: string) {
            return this.semanticInfoChain.getDeclForAST(ast, unitPath ? unitPath : this.unitPath);
        }

        public getTypeSymbolForAST(ast: AST, unitPath?: string) {
            return this.semanticInfoChain.getTypeSymbolForAST(ast, unitPath ? unitPath : this.unitPath);
        }

        public setTypeSymbolForAST(ast: AST, typeSymbol: PullTypeSymbol, unitPath?: string) {
            return this.semanticInfoChain.setTypeSymbolForAST(ast, typeSymbol, unitPath ? unitPath : this.unitPath);
        }

        // returns a list of decls leading up to decl, inclusive
        public getPathToDecl(decl: PullDecl): PullDecl[] {

            if (!decl) {
                return [];
            }
            
            var searchDecls = this.semanticInfoChain.getUnit(decl.getScriptName()).getTopLevelDecls();
            var decls: PullDecl[] = [];
            var spanToFind = decl.getSpan();
            var candidateSpan: ASTSpan = null;
            var searchKinds = DeclKind.Global | DeclKind.Script | DeclKind.Module | DeclKind.Interface | DeclKind.Class | DeclKind.Function;
            var found = false;

            while (true) {
                // Of the top-level decls, find the one to search off of
                found = false;
                for (var i = 0; i < searchDecls.length; i++) {
                    candidateSpan = searchDecls[i].getSpan();

                    if (spanToFind.minChar >= candidateSpan.minChar && spanToFind.limChar <= candidateSpan.limChar) {
                        if (searchDecls[i].getKind() & searchKinds) { // only consider types, which have scopes
                            if (!(searchDecls[i].getKind() & DeclKind.Script)) {
                                decls[decls.length] = searchDecls[i];
                            }
                            searchDecls = searchDecls[i].getChildDecls();
                            found = true;
                        }
                    }
                }

                if (!found) {
                    break;
                }
            }

            // if the decl is a function expression, it would not have been parented during binding
            if (decls.length && (decl.getKind() & DeclKind.Function) && (decls[decls.length - 1] != decl)) {
                decls[decls.length] = decl;
            }

            return decls;
        }

        public getEnclosingDecl(decl: PullDecl): PullDecl {
            var declPath = this.getPathToDecl(decl);

            if (!declPath.length) {
                return null;
            }
            else if (declPath.length > 1 && declPath[declPath.length - 1] == decl) {
                return declPath[declPath.length - 2];
            }
            else {
                return declPath[declPath.length - 1];
            }
        }

        //  Given a path to a name, e.g. ["foo"] or ["Foo", "Baz", "bar"], find the associated symbol
        public findSymbolForPath(pathToName: string[], enclosingDecl: PullDecl, declKind: DeclKind): PullSymbol {

            if (!pathToName.length) {
                return null;
            }

            var symbolName = pathToName[pathToName.length - 1];
            var contextDeclPath = this.getPathToDecl(enclosingDecl);

            var contextSymbolPath: string[] = [];
            var nestedSymbolPath: string[] = [];

            // first, search within the given symbol path
            // (copy path to name so as not to mutate the input array)
            for (var i = 0; i < pathToName.length; i++) {
                nestedSymbolPath[nestedSymbolPath.length] = pathToName[i];
            }

            var symbol: PullSymbol = null; 
        
            while (nestedSymbolPath.length >= 2) {
                symbol = this.semanticInfoChain.findSymbol(nestedSymbolPath, declKind);

                if (symbol) {
                    return symbol;
                }
                nestedSymbolPath.length -= 2;
                nestedSymbolPath[nestedSymbolPath.length] = symbolName;
            }

            // next, try the enclosing context
            for (var i = 0; i < contextDeclPath.length; i++) {
                contextSymbolPath[contextSymbolPath.length] = contextDeclPath[i].getName();
            }

            for (var i = 0; i < pathToName.length; i++) {
                contextSymbolPath[contextSymbolPath.length] = pathToName[i];
            }

            while (contextSymbolPath.length >= 2) {
                symbol = this.semanticInfoChain.findSymbol(contextSymbolPath, declKind);

                if (symbol) {
                    return symbol;
                }
                contextSymbolPath.length -= 2;
                contextSymbolPath[contextSymbolPath.length] = symbolName;
            }

            // finally, try searching globally
            symbol = this.semanticInfoChain.findSymbol([symbolName], declKind);

            return symbol;
        }

        // search for an unqualified symbol name within a given decl path
        public getSymbolFromDeclPath(symbolName: string, declPath: PullDecl[], declKind: DeclKind): PullSymbol {
            var symbol: PullSymbol = null;

            // search backwards through the decl list
            //  - if the decl in question is a function, search its members
            //  - if the decl in question is a module, search the decl then the symbol
            //  - Otherwise, search globally

            var decl: PullDecl = null;
            var childDecls: PullDecl[];
            var declSymbol: PullTypeSymbol = null;
            var declMembers: PullSymbol[];
            var pathDeclKind: DeclKind;

            for (var i = declPath.length - 1; i >= 0; i--) {
                decl = declPath[i];
                pathDeclKind = decl.getKind();

                if (pathDeclKind & DeclKind.Module) {
                    // first check locally
                    childDecls = decl.findChildDecls(symbolName, declKind);

                    if (childDecls.length) {
                        return childDecls[0].getSymbol();
                    }

                    // otherwise, check the members
                    declSymbol = <PullTypeSymbol>decl.getSymbol();
                    declMembers = declSymbol.getMembers();

                    for (var j = 0; j < declMembers.length; j++) {
                        // PULLTODO: declkind should equal declkind, or is it ok to just mask the value?
                        if (declMembers[j].getName() == symbolName && (declMembers[j].getKind() & declKind)) {
                            return declMembers[j];
                        }
                    }
                    
                }
                else if (pathDeclKind & DeclKind.Function) {
                    childDecls = decl.findChildDecls(symbolName, declKind);

                    if (childDecls.length) {
                        return childDecls[0].getSymbol();
                    }
                }
            }

            // otherwise, search globally
            symbol = this.semanticInfoChain.findSymbol([symbolName], declKind);

            return symbol;
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Declaration Resolution
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

        public resolveDeclaration(declAST: AST): PullSymbol {
            switch (declAST.nodeType) {
                case NodeType.Module:
                    return this.resolveModuleDeclaration(<ModuleDecl>declAST);
                case NodeType.Interface:
                    return this.resolveInterfaceDeclaration(<TypeDecl>declAST);
                case NodeType.Class:
                    return this.resolveClassDeclaration(<ClassDecl>declAST);
                case NodeType.FuncDecl:
                    return this.resolveFunctionDeclaration(<FuncDecl>declAST);
                case NodeType.VarDecl:
                case NodeType.ArgDecl:
                    return this.resolveVariableDeclaration(<BoundDecl>declAST);
                default:
                    CompilerDiagnostics.Alert("Invalid declaration type...");
                    return this.semanticInfoChain.anyTypeSymbol;
            }
        }

        // PULLTODO: VERY IMPORTANT
        // Right now, the assumption is that the declaration's parse tree is still in memory
        // we need to add a cache-in/cache-out mechanism so that we can break the dependency on in-memory ASTs
        public resolveDeclaredSymbol(symbol: PullSymbol) {

            if (symbol.isResolved()) {
                return;
            }

            var thisUnit = this.unitPath;
            var decls = symbol.getDeclarations();

            for (var i = 0; i < decls.length; i++) {
                var decl = decls[i];
                var ast = this.semanticInfoChain.getASTForDecl(decl, decl.getScriptName());

                this.setUnitPath(decl.getScriptName());
                this.resolveDeclaration(ast);
            }
            
            this.setUnitPath(thisUnit);
        }

        //
        // Resolve a module declaration
        //
        // The module and its members are pre-bound, so no further resolution is necessary
        //
        public resolveModuleDeclaration(ast: ModuleDecl): PullTypeSymbol {
            var decl: PullDecl = this.getDeclForAST(ast);
            var declSymbol = <PullTypeSymbol>decl.getSymbol();

            return declSymbol;
        }

        //
        // Resolve a class declaration
        //
        // A class's implements and extends lists are not pre-bound, so they must be bound here
        // Once bound, we can add the parent type's members to the class
        //
        public resolveClassDeclaration(classDeclAST: ClassDecl): PullTypeSymbol {
            var classDecl: PullDecl = this.getDeclForAST(classDeclAST);
            var enclosingDecl = this.getEnclosingDecl(classDecl);
            var classDeclSymbol = <PullClassSymbol>classDecl.getSymbol();
            var instanceDeclSymbol = classDeclSymbol.getInstanceType();

            if (classDeclSymbol.isResolved()) {
                return classDeclSymbol;
            }
            
            if (classDeclAST.extendsList) {
                var parentType: PullTypeSymbol = null;
                for (var i = 0; i < classDeclAST.extendsList.members.length; i++) {
                    parentType = this.resolveTypeReference(new TypeReference(classDeclAST.extendsList.members[i], 0), enclosingDecl);
                    classDeclSymbol.addExtendedType(parentType);
                    instanceDeclSymbol.addExtendedType((<PullClassSymbol>parentType).getInstanceType());
                }
            }

            if (classDeclAST.implementsList) {
                var implementedType: PullTypeSymbol = null;
                for (var i = 0; i < classDeclAST.implementsList.members.length; i++) {
                    implementedType = this.resolveTypeReference(new TypeReference(classDeclAST.implementsList.members[i], 0), enclosingDecl);
                    classDeclSymbol.addImplementedType(implementedType);
                    instanceDeclSymbol.addImplementedType(implementedType);
                }
            }

            classDeclSymbol.setResolved();
            instanceDeclSymbol.setResolved();

            return classDeclSymbol;
        }

        public resolveInterfaceDeclaration(interfaceDeclAST: TypeDecl): PullTypeSymbol {
            var interfaceDecl: PullDecl = this.getDeclForAST(interfaceDeclAST);
            var enclosingDecl = this.getEnclosingDecl(interfaceDecl);
            var interfaceDeclSymbol = <PullTypeSymbol>interfaceDecl.getSymbol();

            if (interfaceDeclSymbol.isResolved()) {
                return interfaceDeclSymbol;
            }
            
            if (interfaceDeclAST.extendsList) {
                var parentType: PullTypeSymbol = null;
                for (var i = 0; i < interfaceDeclAST.extendsList.members.length; i++) {
                    parentType = this.resolveTypeReference(new TypeReference(interfaceDeclAST.extendsList.members[i], 0), enclosingDecl);
                    interfaceDeclSymbol.addExtendedType(parentType);
                }
            }

            if (interfaceDeclAST.implementsList) {
                var implementedType: PullTypeSymbol = null;
                for (var i = 0; i < interfaceDeclAST.implementsList.members.length; i++) {
                    implementedType = this.resolveTypeReference(new TypeReference(interfaceDeclAST.implementsList.members[i], 0), enclosingDecl);
                    interfaceDeclSymbol.addImplementedType(implementedType);
                }
            }

            interfaceDeclSymbol.setResolved();

            return interfaceDeclSymbol;
        }

        public resolveFunctionTypeSignature(funcDeclAST: FuncDecl, enclosingDecl : PullDecl): PullTypeSymbol {

            var funcName = funcDeclAST.name ? funcDeclAST.name.text : funcDeclAST.hint;

            var isConstructor = hasFlag(funcDeclAST.fncFlags,FncFlags.ConstructMember);
            var isIndex = hasFlag(funcDeclAST.fncFlags,FncFlags.IndexerMember);
            var sigDeclKind = isConstructor ? DeclKind.ConstructSignature :
                            isIndex ? DeclKind.IndexSignature : DeclKind.CallSignature;
            
            var funcDeclSymbol = new PullFunctionSymbol(funcName, DeclKind.Function);
            var signature = new PullSignatureSymbol(null, sigDeclKind);

            funcDeclSymbol.addSignature(signature);

            // resolve the return type annotation
            if (funcDeclAST.returnTypeAnnotation) {
                var returnTypeRef = <TypeReference>funcDeclAST.returnTypeAnnotation;
                var returnTypeSymbol = this.resolveTypeReference(returnTypeRef, enclosingDecl);
                
                signature.setReturnType(returnTypeSymbol);
            }
            else {
                signature.setReturnType(this.semanticInfoChain.anyTypeSymbol);
            }

            // link parameters and resolve their annotations
            if (funcDeclAST.args) {
                for (var i = 0; i < funcDeclAST.args.members.length; i++) {
                    this.resolveFunctionTypeSignatureParameters(<ArgDecl>funcDeclAST.args.members[i], signature, enclosingDecl);
                }
            }

            funcDeclSymbol.setResolved();

            return funcDeclSymbol;
        }

        public resolveFunctionTypeSignatureParameters(argDecl: ArgDecl, signatureSymbol: PullSymbol, enclosingDecl: PullDecl) {
            var paramSymbol = new PullSymbol(argDecl.id.actualText, DeclKind.Argument);

            signatureSymbol.addOutgoingLink(paramSymbol, SymbolLinkKind.Parameter);

            if (argDecl.typeExpr) {
                var typeRef = this.resolveTypeReference(<TypeReference>argDecl.typeExpr, enclosingDecl);
                if (typeRef.hasBrand()) {
                    typeRef = (<PullClassSymbol>typeRef).getInstanceType();
                }
                paramSymbol.setType(typeRef);
            } // PULLTODO: default values?
            else {
                paramSymbol.setType(this.semanticInfoChain.anyTypeSymbol);
            }

            paramSymbol.setResolved();
        }

        public resolveInterfaceTypeReference(interfaceDeclAST: NamedType, enclosingDecl: PullDecl): PullTypeSymbol {
            var interfaceSymbol = new PullTypeSymbol("", DeclKind.Interface);
            var memberSymbol: PullSymbol = null;
            var varDecl: VarDecl = null;
            var funcDecl: FuncDecl = null;

            if (interfaceDeclAST.members) {

                // PULLTODO: Why are the members in a TypeDecl an AST and not an ASTList?
                var typeMembers = <ASTList> interfaceDeclAST.members;

                for (var i = 0; i < typeMembers.members.length; i++) {

                    if (typeMembers.members[i].nodeType == NodeType.VarDecl) {
                        varDecl = <VarDecl>typeMembers.members[i];
                        memberSymbol = new PullSymbol(varDecl.id.actualText, DeclKind.Field);
                        interfaceSymbol.addMember(memberSymbol, SymbolLinkKind.PublicProperty);
                    }
                    else if (typeMembers.members[i].nodeType == NodeType.FuncDecl) {
                        memberSymbol = this.resolveFunctionTypeSignature(<FuncDecl>typeMembers.members[i], enclosingDecl);
                        interfaceSymbol.addMember(memberSymbol, SymbolLinkKind.PublicProperty);
                    }
                }
            }

            interfaceSymbol.setResolved();

            return interfaceSymbol;
        }

        // PULLTODO: Watch for infinite recursion when resloving mutually recursive types
        public resolveTypeReference(typeRef: TypeReference, enclosingDecl: PullDecl): PullTypeSymbol {
            // the type reference can be
            // a name
            // a function
            // an interface
            // a dotted name
            // an array of any of the above

            if (!typeRef) {
                return null;
            }

            var typeDeclSymbol: PullTypeSymbol = null;

            // a name
            if (typeRef.term.nodeType == NodeType.Name) {
                var typeName = <Identifier>typeRef.term;
            
                //typeDeclSymbol = <PullTypeSymbol>this.findSymbolForPath([typeName.actualText], enclosingDecl, DeclKind.SomeType);
                typeDeclSymbol = <PullTypeSymbol>this.getSymbolFromDeclPath(typeName.actualText, this.getPathToDecl(enclosingDecl), DeclKind.SomeType);
                if (!typeDeclSymbol) {
                    // PULLTODOERROR
                    CompilerDiagnostics.Alert("Could not find type '" + typeName.actualText + "'");
                    return this.semanticInfoChain.anyTypeSymbol;
                }
            }

            // a function
            else if (typeRef.term.nodeType == NodeType.FuncDecl) {

                typeDeclSymbol = this.resolveFunctionTypeSignature(<FuncDecl>typeRef.term, enclosingDecl);
            }

            // an interface
            else if (typeRef.term.nodeType == NodeType.Interface) {

                typeDeclSymbol = this.resolveInterfaceTypeReference(<NamedType>typeRef.term, enclosingDecl);
            }

            // a dotted name
            else if (typeRef.term.nodeType == NodeType.Dot) {

                // assemble the dotted name path
                var dottedName = <BinaryExpression> typeRef.term;
                var dottedNamePath: string[] = [];
                var lastTypeName = (<Identifier>dottedName.operand2).actualText;
                var previousPathAST = dottedName.operand1;

                while (previousPathAST.nodeType == NodeType.Dot) {
                    dottedNamePath[dottedNamePath.length] = (<Identifier>(<BinaryExpression>previousPathAST).operand2).actualText;
                    previousPathAST = (<BinaryExpression>previousPathAST).operand1;
                }
                dottedNamePath[dottedNamePath.length] = (<Identifier>previousPathAST).actualText;
                dottedNamePath = dottedNamePath.reverse();
                dottedNamePath[dottedNamePath.length] = lastTypeName;

                // find the decl
                typeDeclSymbol = <PullTypeSymbol>this.findSymbolForPath(dottedNamePath, enclosingDecl, DeclKind.SomeType);
                
                if (!typeDeclSymbol) {
                    CompilerDiagnostics.Alert("Could not find dotted type '" + lastTypeName + "'");
                    return this.semanticInfoChain.anyTypeSymbol;
                }
            }

            if (!typeDeclSymbol) {
                CompilerDiagnostics.Alert("Couldn't bind to the type symbol before creating the array, for some reason");
                return this.semanticInfoChain.anyTypeSymbol;
            }

            // an array of any of the above
            // PULLTODO: Arity > 1
            // PULLTODO: Lots to optimize here
            if (typeRef.arrayCount) {
                var arraySymbol: PullTypeSymbol = null;
                var arrayLinks = typeDeclSymbol.findIncomingLinks((psl: PullSymbolLink) => psl.kind == SymbolLinkKind.ArrayOf);

                // first, look to see if there's already an array symbol for this type
                if (arrayLinks.length) {
                    if (arrayLinks.length > 1) {
                        CompilerDiagnostics.Alert("For some reason, there's more than one array link for type '" + typeDeclSymbol.getName() + "'");
                    }
                    arraySymbol = <PullTypeSymbol>arrayLinks[0].start;
                }

                // otherwise, create a new array symbol
                else {                    
                    // for each member in the array interface symbol, substitute in the the typeDecl symbol for "_element"
                    //var arrayInterfaceSymbol = <PullTypeSymbol>this.findSymbolForPath(["Array"], enclosingDecl, DeclKind.Interface);
                    var arrayInterfaceSymbol = <PullTypeSymbol>this.getSymbolFromDeclPath("Array", this.getPathToDecl(enclosingDecl), DeclKind.Interface);

                    arraySymbol = specializeToArrayType(arrayInterfaceSymbol, this.semanticInfoChain.elementTypeSymbol, typeDeclSymbol, this);
                }
            
                typeDeclSymbol = arraySymbol;
            }

            return typeDeclSymbol;
        }

        // Also resolves parameter declarations
        public resolveVariableDeclaration(varDecl: BoundDecl): PullSymbol {
      
            var decl: PullDecl = this.getDeclForAST(varDecl);
            var declSymbol = decl.getSymbol();
            var declPropertySymbol = decl.getPropertySymbol();

            if (declSymbol.isResolved()) {
                return declSymbol.getType();
            }

            // Does this have a type expression? If so, that's the type
            if (varDecl.typeExpr) {
                var typeExprSymbol = this.resolveTypeReference(<TypeReference>varDecl.typeExpr, this.getEnclosingDecl(decl));

                // PULLTODOERROR
                if (!typeExprSymbol) {
                    CompilerDiagnostics.Alert("Could not resolve type expression for variable '" + varDecl.id.actualText + "'");
                    declSymbol.setType(this.semanticInfoChain.anyTypeSymbol);
                    if (declPropertySymbol) {
                        declPropertySymbol.setType(this.semanticInfoChain.anyTypeSymbol);
                    }
                }
                else {
                    if (typeExprSymbol.hasBrand()) { // PULLTODO: These brand checks should go under resolveTypeReference
                        typeExprSymbol = (<PullClassSymbol>typeExprSymbol).getInstanceType();
                    }
                    declSymbol.setType(typeExprSymbol);
                    if (declPropertySymbol) {
                        declPropertySymbol.setType(typeExprSymbol);
                    }
                }
            }

            // Does it have an initializer? If so, typecheck and use that
            else if (varDecl.init) {
                // PULLTODO
                var initExprSymbol = this.resolveExpression(varDecl.init, varDecl, this.getEnclosingDecl(decl));

                if (!initExprSymbol) {
                    CompilerDiagnostics.Alert("Could not resolve type of initializer expression for variable '" + varDecl.id.actualText + "'");
                    declSymbol.setType(this.semanticInfoChain.anyTypeSymbol);
                    if (declPropertySymbol) {
                        declPropertySymbol.setType(this.semanticInfoChain.anyTypeSymbol);
                    }
                }
                else {
                    declSymbol.setType(initExprSymbol.getType());
                    initExprSymbol.addOutgoingLink(declSymbol, SymbolLinkKind.ProvidesInferredType);
                    if (declPropertySymbol) {
                        declPropertySymbol.setType(initExprSymbol.getType());
                        initExprSymbol.addOutgoingLink(declPropertySymbol, SymbolLinkKind.ProvidesInferredType);
                    }
                }
            }

            // Otherwise, it's of type 'any'
            else {
                declSymbol.setType(this.semanticInfoChain.anyTypeSymbol);
                if (declPropertySymbol) {
                    declPropertySymbol.setType(this.semanticInfoChain.anyTypeSymbol);
                }
            }
        
            declSymbol.setResolved();

            if (declPropertySymbol) {
                declPropertySymbol.setResolved();
            }

            return declSymbol;
        }

        public resolveFunctionBodyReturnTypes(funcDeclAST: FuncDecl, signature: PullSignatureSymbol, enclosingDecl: PullDecl) {
            var returnStatements: ReturnStatement[] = [];
            var preFindReturnExpressionTypes = function (ast: AST, parent: AST, walker: IAstWalker) {
                    var go = true;
                    switch (ast.nodeType) {
                        case NodeType.FuncDecl:
                            // don't recurse into a function decl - we don't want to confuse a nested
                            // return type with the top-level function's return type
                            go = false;
                            break;
                        case NodeType.Return:
                            var returnStatement: ReturnStatement = <ReturnStatement>ast;
                            returnStatements[returnStatements.length] = returnStatement;

                        default:
                            break;
                    }
                    walker.options.goChildren = go;
                    walker.options.goNextSibling = go;
                    return ast;
                }

            getAstWalkerFactory().walk(funcDeclAST.bod, preFindReturnExpressionTypes);

            if (!returnStatements.length) {
                signature.setReturnType(this.semanticInfoChain.voidTypeSymbol);
            }

            else {
                var returnExpressionSymbols: PullSymbol[] = [];

                for (var i = 0; i < returnStatements.length; i++) {
                    if (returnStatements[i].returnExpression) {
                        returnExpressionSymbols[returnExpressionSymbols.length] = this.resolveExpression(returnStatements[i].returnExpression, null, enclosingDecl);
                    }
                }

                if (!returnExpressionSymbols.length) {
                    signature.setReturnType(this.semanticInfoChain.voidTypeSymbol);
                }
                else {

                    // combine return expression types for best common type
                    signature.setReturnType(this.findBestCommonType(returnExpressionSymbols));

                    // link return expressions to signature type to denote inference
                    for (var i = 0; i < returnExpressionSymbols.length; i++) {
                        returnExpressionSymbols[i].addOutgoingLink(signature, SymbolLinkKind.ProvidesInferredType);
                    }
                }
            }
        }

        public resolveFunctionDeclaration(funcDeclAST: FuncDecl): PullSymbol {
      
            var funcDecl: PullDecl = this.getDeclForAST(funcDeclAST);

            var funcSymbol = <PullFunctionSymbol>funcDecl.getSymbol();

            var signature: PullSignatureSymbol = funcDecl.getSignatureSymbol();

            if (signature.isResolved()) {
                return funcSymbol;
            }

            if (signature) {
                
                // resolve parameter type annotations as necessary
                if (funcDeclAST.args) {
                    for (var i = 0; i < funcDeclAST.args.members.length; i++) {
                        this.resolveVariableDeclaration(<BoundDecl>funcDeclAST.args.members[i]);
                    }
                }

                // resolve the return type annotation
                if (funcDeclAST.returnTypeAnnotation) {
                    var returnTypeRef = <TypeReference>funcDeclAST.returnTypeAnnotation;
                    var returnTypeSymbol = this.resolveTypeReference(returnTypeRef, this.getEnclosingDecl(funcDecl));

                    if (!returnTypeSymbol) {
                        CompilerDiagnostics.Alert("Could not resolve return type reference for some reason...");
                        signature.setReturnType(this.semanticInfoChain.anyTypeSymbol);
                    }
                    else {
                        signature.setReturnType(returnTypeSymbol);
                    }
                }

                    // if there's no return-type annotation
                    //     - if it's not a definition signature, set the return type to 'any'
                    //     - if it's a definition sigature, take the best common type of all return expressions
                else {
                    if (funcDeclAST.isSignature) {
                        signature.setReturnType(this.semanticInfoChain.anyTypeSymbol);
                    }
                    else {
                        this.resolveFunctionBodyReturnTypes(funcDeclAST, signature, funcDecl);
                    }
                }
            }

            signature.setResolved();

            return funcSymbol;
        }


        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Expression and statement Resolution
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

        // PULLTODORESOLUTION: Import statements
        // PULLTODORESOLUTION: Loop statements
        // PULLTODORESOLUTION: With blocks
        // PULLTODORESOLUTION: Switch statements
        // PULLTODORESOLUTION: if statements
        // PULLTODORESOLUTION: try/catch
        // PULLTODORESOLUTION: debugger statement

        public resolveExpression(expressionAST: AST, assigningAST: AST, enclosingDecl: PullDecl):PullSymbol {

            switch (expressionAST.nodeType) {
                case NodeType.Name:
                    return this.resolveNameExpression(<Identifier>expressionAST, enclosingDecl);
                case NodeType.Dot:
                    return this.resolveDottedNameExpression(<BinaryExpression>expressionAST, enclosingDecl);
                case NodeType.FuncDecl:
                    return this.resolveFunctionExpression(<FuncDecl>expressionAST, assigningAST, enclosingDecl);
                case NodeType.This:
                    return this.resolveThisExpression(expressionAST, enclosingDecl);
                case NodeType.Super:
                    return this.resolveSuperExpression(expressionAST, enclosingDecl);

                // primitives
                case NodeType.NumberLit:
                    return this.semanticInfoChain.numberTypeSymbol;
                case NodeType.QString:
                    return this.semanticInfoChain.stringTypeSymbol;
                case NodeType.Null:
                    return this.semanticInfoChain.nullTypeSymbol;
                case NodeType.True:
                case NodeType.False:
                    return this.semanticInfoChain.boolTypeSymbol;
                case NodeType.Void:
                    return this.semanticInfoChain.voidTypeSymbol;
            }

            return this.semanticInfoChain.anyTypeSymbol;
        }

        public resolveNameExpression(nameAST: Identifier, enclosingDecl: PullDecl): PullSymbol {
            // PULLTODO: We should just be searching the 
            var id = nameAST.actualText;

            // first, resolve the id as a value
            //var nameSymbol: PullSymbol = this.findSymbolForPath([id], enclosingDecl, DeclKind.SomeValue);
            var nameSymbol = this.getSymbolFromDeclPath(id, this.getPathToDecl(enclosingDecl), DeclKind.SomeValue);

            // no luck? check the type space
            if (!nameSymbol) {
                //nameSymbol = this.findSymbolForPath([id], enclosingDecl, DeclKind.SomeType);
                nameSymbol = this.getSymbolFromDeclPath(id, this.getPathToDecl(enclosingDecl), DeclKind.SomeType);
            }

            if (!nameSymbol) {
                CompilerDiagnostics.Alert("Could not find symbol '" + id + "'");
                return this.semanticInfoChain.anyTypeSymbol;
            }

            // PULLTODO: This requires that the AST related to the symbol in question be in memory
            if (!nameSymbol.isResolved()) {
                this.resolveDeclaredSymbol(nameSymbol);
            }

            //enclosingDecl.addContainedExpressionSymbol(nameSymbol);

            return nameSymbol;
        }

        public resolveDottedNameExpression(dottedNameAST: BinaryExpression, enclosingDecl: PullDecl) {
            // assemble the dotted name path
            var rhsName = (<Identifier>dottedNameAST.operand2).actualText;


            var lhs: PullSymbol = this.resolveExpression(dottedNameAST.operand1, null, enclosingDecl);
            var lhsType = lhs.getType();

            if (lhsType == this.semanticInfoChain.anyTypeSymbol) {
                return lhsType;
            }

            if (!lhsType.isResolved) {
                this.resolveDeclaredSymbol(lhsType);
            }

            // now for the name...
            var nameSymbol = lhsType.findMember(rhsName);

            if (!nameSymbol) {
                CompilerDiagnostics.Alert("Could not find dotted symbol name '" + rhsName + "'");
                return this.semanticInfoChain.anyTypeSymbol;
            }

            if (!nameSymbol.isResolved()) {
                this.resolveDeclaredSymbol(nameSymbol);
            }

            return nameSymbol;
        }

        public resolveFunctionExpression(funcDeclAST: FuncDecl, assigningAST: AST, enclosingDecl: PullDecl): PullSymbol {

            // if we have an assigning AST with a type, and the funcDecl has no parameter types or return type annotation
            // we'll contextually type it
            // otherwise, just process it as a normal function declaration
            
            var shouldContextuallyType = assigningAST != null && ((<BoundDecl>assigningAST).typeExpr != null);

            if (funcDeclAST.returnTypeAnnotation) {
                shouldContextuallyType = false;
            }

            if (shouldContextuallyType && funcDeclAST.args) {

                for (var i = 0; i < funcDeclAST.args.members.length; i++) {
                    if ((<ArgDecl>funcDeclAST.args.members[i]).typeExpr) {
                        shouldContextuallyType = false;
                        break;
                    }
                }
            }

            if (shouldContextuallyType) {
                var functionTypeSymbol = this.getDeclForAST(assigningAST).getSymbol().getType();
                return functionTypeSymbol;
            }

            var funcName = funcDeclAST.name ? funcDeclAST.name.text : funcDeclAST.hint;

            var isConstructor = hasFlag(funcDeclAST.fncFlags,FncFlags.ConstructMember);
            var isIndex = hasFlag(funcDeclAST.fncFlags,FncFlags.IndexerMember);
            var sigDeclKind = isConstructor ? DeclKind.ConstructSignature :
                            isIndex ? DeclKind.IndexSignature : DeclKind.CallSignature;
            
            var funcDeclSymbol = new PullFunctionSymbol(funcName, DeclKind.Function);
            var signature = new PullSignatureSymbol(null, sigDeclKind);

            funcDeclSymbol.addSignature(signature);

            // resolve the return type annotation
            if (funcDeclAST.returnTypeAnnotation) {
                var returnTypeRef = <TypeReference>funcDeclAST.returnTypeAnnotation;
                var returnTypeSymbol = this.resolveTypeReference(returnTypeRef, enclosingDecl);
                
                signature.setReturnType(returnTypeSymbol);
            }
            else {
                signature.setReturnType(this.semanticInfoChain.anyTypeSymbol);
            }

            // link parameters and resolve their annotations
            if (funcDeclAST.args) {
                for (var i = 0; i < funcDeclAST.args.members.length; i++) {
                    this.resolveFunctionTypeSignatureParameters(<ArgDecl>funcDeclAST.args.members[i], signature, enclosingDecl);
                }
            }

            // create a new function decl
            var semanticInfo = this.semanticInfoChain.getUnit(this.unitPath);
            var declCollectionContext = new DeclCollectionContext(semanticInfo);

            declCollectionContext.scriptName = this.unitPath;

            getAstWalkerFactory().walk(funcDeclAST, preCollectDecls, postCollectDecls, null, declCollectionContext);

            var functionDecl = this.getDeclForAST(funcDeclAST);

            // bind the symbols

            var pullSymbolBindingContext = new PullSymbolBindingContext(this.semanticInfoChain, this.unitPath);
            bindDeclSymbol(functionDecl, pullSymbolBindingContext);

            this.resolveFunctionBodyReturnTypes(funcDeclAST, signature, functionDecl);

            funcDeclSymbol.setResolved();

            enclosingDecl.addContainedExpressionSymbol(funcDeclSymbol);

            return funcDeclSymbol;
        }

        public resolveThisExpression(ast: AST, enclosingDecl: PullDecl) {
            return this.semanticInfoChain.anyTypeSymbol;
        }

        public resolveSuperExpression(ast: AST, enclosingDecl: PullDecl) {
            return this.semanticInfoChain.anyTypeSymbol;
        }

              
        // PULLTODORESOLUTION: Dotted identifiers
        // PULLTODORESOLUTION: Object literals
        // PULLTODORESOLUTION: Type Assertions
        // PULLTODORESOLUTION: Unary Expressions
        // PULLTODORESOLUTION: Binary expressions
        // PULLTODORESOLUTION: Call expressions
        // PULLTODORESOLUTION: Conditional expressions
        // PULLTODORESOLUTION: Literals
        // PULLTODORESOLUTION: Throw
        
        public findBestCommonType(typeSymbols: PullSymbol[]): PullTypeSymbol {
            return this.semanticInfoChain.anyTypeSymbol;
        }
    }














}