// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='typescript.ts' />


module TypeScript {

    // The resolver associates types with a given AST
    export class PullTypeResolver {

        private cachedArrayInterfaceType: PullTypeSymbol = null;
        private cachedNumberInterfaceType: PullTypeSymbol = null;
        private cachedStringInterfaceType: PullTypeSymbol = null;
        private cachedBooleanInterfaceType: PullTypeSymbol = null;
        private cachedObjectInterfaceType: PullTypeSymbol = null;

        constructor (private semanticInfoChain: SemanticInfoChain, private unitPath: string, private logger: ILogger) {
            this.cachedArrayInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("Array", [], DeclKind.Interface);
            this.cachedNumberInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("Number", [], DeclKind.Interface);
            this.cachedStringInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("String", [], DeclKind.Interface);
            this.cachedBooleanInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("Boolean", [], DeclKind.Interface);
            this.cachedObjectInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("Object", [], DeclKind.Interface);
        }

        public getUnitPath() { return this.unitPath; }
        
        public setUnitPath(unitPath: string) { this.unitPath = unitPath; }

        private log(message: string) {
            if (this.logger) {
                this.logger.log(message);
            }
            else {
                this.log(message);
            }
        }

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
                else /*if (pathDeclKind & DeclKind.Function)*/ {
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
                    this.log("RESOLUTION ERROR: Invalid declaration type...");
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

            var classMembers = classDeclSymbol.getMembers();
            var instanceMembers = instanceDeclSymbol.getMembers();

            for (var i = 0; i < classMembers.length; i++) {
                this.resolveDeclaredSymbol(classMembers[i]);
            }

            for (i = 0; i < instanceMembers.length; i++) {
                this.resolveDeclaredSymbol(instanceMembers[i]);
            }

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

            if (isConstructor) {
                funcDeclSymbol.addConstructSignature(signature);
            }
            else if (isIndex) {
                funcDeclSymbol.addIndexSignature(signature);
            }
            else {
                funcDeclSymbol.addCallSignature(signature);
            }

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
                    this.resolveFunctionTypeSignatureParameter(<ArgDecl>funcDeclAST.args.members[i], signature, null, enclosingDecl);
                }
            }

            funcDeclSymbol.setResolved();

            return funcDeclSymbol;
        }

        public resolveFunctionTypeSignatureParameter(argDecl: ArgDecl, signatureSymbol: PullSymbol, contextParam: PullSymbol, enclosingDecl: PullDecl) {
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
                if (contextParam) {
                    paramSymbol.setType(contextParam.getType());
                }
                else {
                    paramSymbol.setType(this.semanticInfoChain.anyTypeSymbol);
                }
            }

            paramSymbol.setResolved();
        }

        public resolveInterfaceTypeReference(interfaceDeclAST: NamedType, enclosingDecl: PullDecl): PullTypeSymbol {
            var interfaceSymbol = new PullTypeSymbol("", DeclKind.Interface);

            if (interfaceDeclAST.members) {

                // PULLTODO: Why are the members in a TypeDecl an AST and not an ASTList?
                var memberSymbol: PullSymbol = null;
                var varDecl: VarDecl = null;
                var funcDecl: FuncDecl = null;
                var typeMembers = <ASTList> interfaceDeclAST.members;
                var methodSymbol: PullFunctionSymbol = null;

                for (var i = 0; i < typeMembers.members.length; i++) {

                    if (typeMembers.members[i].nodeType == NodeType.VarDecl) {
                        varDecl = <VarDecl>typeMembers.members[i];
                        memberSymbol = new PullSymbol(varDecl.id.actualText, DeclKind.Field);
                        interfaceSymbol.addMember(memberSymbol, SymbolLinkKind.PublicProperty);
                    }
                    else if (typeMembers.members[i].nodeType == NodeType.FuncDecl) {
                        methodSymbol = <PullFunctionSymbol>this.resolveFunctionTypeSignature(<FuncDecl>typeMembers.members[i], enclosingDecl);

                        // check to see if it's a "special" function
                        if (methodSymbol.getName() == "_construct") {
                            interfaceSymbol.addConstructSignatures(methodSymbol.getConstructSignatures());
                        }
                        else if (methodSymbol.getName() == "_call") {
                            interfaceSymbol.addCallSignatures(methodSymbol.getCallSignatures());
                        }
                        else if (methodSymbol.getName() == "__item") {
                            interfaceSymbol.addIndexSignatures(methodSymbol.getIndexSignatures());
                        }
                        else {
                            interfaceSymbol.addMember(methodSymbol, SymbolLinkKind.PublicProperty);
                        }
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
                    this.log("RESOLUTION ERROR: Could not find type '" + typeName.actualText + "'");
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
                    this.log("RESOLUTION ERROR: Could not find dotted type '" + lastTypeName + "'");
                    return this.semanticInfoChain.anyTypeSymbol;
                }
            }

            if (!typeDeclSymbol) {
                this.log("RESOLUTION ERROR: Couldn't bind to the type symbol before creating the array, for some reason");
                return this.semanticInfoChain.anyTypeSymbol;
            }

            // an array of any of the above
            // PULLTODO: Arity > 1
            // PULLTODO: Lots to optimize here
            if (typeRef.arrayCount) {
                var arraySymbol: PullTypeSymbol = typeDeclSymbol.getArrayType();

                // otherwise, create a new array symbol
                if (!arraySymbol) {                    
                    // for each member in the array interface symbol, substitute in the the typeDecl symbol for "_element"
                    //var arrayInterfaceSymbol = <PullTypeSymbol>this.findSymbolForPath(["Array"], enclosingDecl, DeclKind.Interface);
                    
                    if (!this.cachedArrayInterfaceType) {
                        // PULLTODO: We shouldn't need to keep searching out 'Array'
                        this.cachedArrayInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("Array", this.getPathToDecl(enclosingDecl), DeclKind.Interface);
                    }
                    arraySymbol = specializeToArrayType(this.cachedArrayInterfaceType, this.semanticInfoChain.elementTypeSymbol, typeDeclSymbol, this);

                    if (!arraySymbol) {
                        arraySymbol = this.semanticInfoChain.anyTypeSymbol;
                    }
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
                    this.log("RESOLUTION ERROR: Could not resolve type expression for variable '" + varDecl.id.actualText + "'");
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
                var initExprSymbol = this.resolveStatementOrExpression(varDecl.init, varDecl, this.getEnclosingDecl(decl));

                if (!initExprSymbol) {
                    this.log("RESOLUTION ERROR: Could not resolve type of initializer expression for variable '" + varDecl.id.actualText + "'");
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
                        returnExpressionSymbols[returnExpressionSymbols.length] = this.resolveStatementOrExpression(returnStatements[i].returnExpression, null, enclosingDecl);
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
                        this.log("RESOLUTION ERROR: Could not resolve return type reference for some reason...");
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
                    if (funcDeclAST.isSignature()) {
                        signature.setReturnType(this.semanticInfoChain.anyTypeSymbol);
                    }
                    else {
                        this.resolveFunctionBodyReturnTypes(funcDeclAST, signature, funcDecl);
                    }
                }
                
                signature.setResolved();
            }

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
        // PULLTODORESOLUTION: Conditional expressions        
        // PULLTODORESOLUTION: Throw

        public resolveAST(ast: AST, assigningAST: AST, enclosingDecl: PullDecl) {
            switch (ast.nodeType) {
                case NodeType.Module:
                case NodeType.Interface:
                case NodeType.Class:
                case NodeType.FuncDecl:
                case NodeType.VarDecl:
                case NodeType.ArgDecl:
                    return this.resolveDeclaration(ast);
                default:
                    return this.resolveStatementOrExpression(ast, assigningAST, enclosingDecl);
            }
        }

        public resolveStatementOrExpression(expressionAST: AST, assigningAST: AST, enclosingDecl: PullDecl):PullSymbol {

            switch (expressionAST.nodeType) {
                case NodeType.Name:
                    return this.resolveNameExpression(<Identifier>expressionAST, enclosingDecl);
                case NodeType.Dot:
                    return this.resolveDottedNameExpression(<BinaryExpression>expressionAST, enclosingDecl);
                case NodeType.FuncDecl:
                    return this.resolveFunctionExpression(<FuncDecl>expressionAST, assigningAST, enclosingDecl);

                case NodeType.ObjectLit:
                    return this.resolveObjectLiteralExpression(expressionAST, assigningAST, enclosingDecl);

                case NodeType.ArrayLit:
                    return this.resolveArrayLiteralExpression(expressionAST, assigningAST, enclosingDecl);

                case NodeType.This:
                    return this.resolveThisExpression(expressionAST, enclosingDecl);
                case NodeType.Super:
                    return this.resolveSuperExpression(expressionAST, enclosingDecl);

                case NodeType.Call:
                    return this.resolveCallExpression(expressionAST, assigningAST, enclosingDecl);

                case NodeType.New:
                    return this.resolveNewExpression(expressionAST, assigningAST, enclosingDecl);

                case NodeType.TypeAssertion:
                    return this.resolveTypeAssertionExpression(expressionAST, assigningAST, enclosingDecl);

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

                // boolean operations
                case NodeType.Not:
                case NodeType.LogNot:
                case NodeType.Ne:
                case NodeType.Eq:
                case NodeType.Eqv:
                case NodeType.NEqv:
                case NodeType.Lt:
                case NodeType.Le:
                case NodeType.Ge:
                case NodeType.Gt:
                    return this.semanticInfoChain.boolTypeSymbol;

                case NodeType.Add:
                case NodeType.Sub:
                case NodeType.Mul:
                case NodeType.Div:
                case NodeType.Mod:
                case NodeType.Or:
                case NodeType.And:
                case NodeType.AsgAdd:
                case NodeType.AsgSub:
                case NodeType.AsgMul:
                case NodeType.AsgDiv:
                case NodeType.AsgMod:
                case NodeType.AsgOr:
                case NodeType.AsgAnd:
                    return this.resolveArithmeticExpression(expressionAST, assigningAST, enclosingDecl);

                case NodeType.Pos:
                case NodeType.Neg:
                case NodeType.IncPost:
                case NodeType.IncPre:
                case NodeType.DecPost:
                case NodeType.DecPre:
                    return this.semanticInfoChain.numberTypeSymbol;

                case NodeType.Lsh:
                case NodeType.Rsh:
                case NodeType.Rs2:
                case NodeType.AsgLsh:
                case NodeType.AsgRsh:
                case NodeType.AsgRs2:
                    return this.semanticInfoChain.numberTypeSymbol;

                case NodeType.Index:
                    return this.resolveIndexExpression(expressionAST, assigningAST, enclosingDecl);

                case NodeType.LogOr:
                    return this.resolveLogicalOrExpression(expressionAST, assigningAST, enclosingDecl);
                case NodeType.LogAnd:
                    return this.resolveLogicalAndExpression(expressionAST, assigningAST, enclosingDecl);

                case NodeType.Typeof:
                    return this.semanticInfoChain.stringTypeSymbol;
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
                this.log("RESOLUTION ERROR: Could not find symbol '" + id + "'");
                return this.semanticInfoChain.anyTypeSymbol;
            }

            // PULLTODO: This requires that the AST related to the symbol in question be in memory
            if (!nameSymbol.isResolved()) {
                this.resolveDeclaredSymbol(nameSymbol);
            }

            if (nameSymbol.isType() && (<PullTypeSymbol>nameSymbol).hasBrand()) {
                var instanceType = (<PullClassSymbol>nameSymbol).getInstanceType();

                if (!instanceType.isResolved()) {
                    this.resolveDeclaredSymbol(instanceType);
                }
            }

            //enclosingDecl.addContainedExpressionSymbol(nameSymbol);

            return nameSymbol;
        }

        public resolveDottedNameExpression(dottedNameAST: BinaryExpression, enclosingDecl: PullDecl) {
            // assemble the dotted name path
            var rhsName = (<Identifier>dottedNameAST.operand2).actualText;


            var lhs: PullSymbol = this.resolveStatementOrExpression(dottedNameAST.operand1, null, enclosingDecl);
            var lhsType = lhs.getType();

            if (lhsType == this.semanticInfoChain.anyTypeSymbol) {
                return lhsType;
            }

            if (lhsType == this.semanticInfoChain.numberTypeSymbol && this.cachedNumberInterfaceType) {
                lhsType = this.cachedNumberInterfaceType;
            }
            else if (lhsType == this.semanticInfoChain.stringTypeSymbol && this.cachedStringInterfaceType) {
                lhsType = this.cachedStringInterfaceType;
            }
            else if (lhsType == this.semanticInfoChain.boolTypeSymbol && this.cachedBooleanInterfaceType) {
                lhsType = this.cachedBooleanInterfaceType;
            }

            if (!lhsType.isResolved()) {
                this.resolveDeclaredSymbol(lhsType);
            }

            // now for the name...
            var nameSymbol = lhsType.findMember(rhsName);

            if (!nameSymbol) {
                this.log("RESOLUTION ERROR: Could not find dotted symbol name '" + rhsName + "'");
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
            var assigningFunctionTypeSymbol: PullFunctionSymbol = null;
            var assigningFunctionSignature: PullSignatureSymbol = null;

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

                // PULLTODO: Check for parenthesization 

                assigningFunctionTypeSymbol = <PullFunctionSymbol>this.getDeclForAST(assigningAST).getSymbol().getType();
                assigningFunctionSignature = assigningFunctionTypeSymbol.getCallSignatures()[0];
            }

            // PULLTODO: Anonymous function names should be "" and not null
            var funcName = funcDeclAST.name ? funcDeclAST.name.text : funcDeclAST.hint;

            var isConstructor = hasFlag(funcDeclAST.fncFlags,FncFlags.ConstructMember);
            var isIndex = hasFlag(funcDeclAST.fncFlags,FncFlags.IndexerMember);
            var sigDeclKind = isConstructor ? DeclKind.ConstructSignature :
                            isIndex ? DeclKind.IndexSignature : DeclKind.CallSignature;
            
            var funcDeclSymbol = new PullFunctionSymbol(funcName, DeclKind.Function);

            // PULLTODO: "" or null for these names?
            var signature = new PullSignatureSymbol(null, sigDeclKind);

            funcDeclSymbol.addSignature(signature);

            // resolve the return type annotation
            if (funcDeclAST.returnTypeAnnotation) {
                var returnTypeRef = <TypeReference>funcDeclAST.returnTypeAnnotation;
                var returnTypeSymbol = this.resolveTypeReference(returnTypeRef, enclosingDecl);
                
                signature.setReturnType(returnTypeSymbol);
            }
            else {
                if (assigningFunctionSignature) {
                    var returnType = assigningFunctionSignature.getReturnType();

                    if (returnType) {
                        signature.setReturnType(returnType);
                    }
                    else {
                        signature.setReturnType(this.semanticInfoChain.anyTypeSymbol);
                    }
                }
                else {
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
                    //signature.setReturnType(this.semanticInfoChain.anyTypeSymbol);
                }
            }

            // link parameters and resolve their annotations
            if (funcDeclAST.args) {

                var contextParams: PullSymbol[] = [];
                var contextParam: PullSymbol = null;

                if (assigningFunctionSignature) {
                    contextParams = assigningFunctionSignature.getParameters();
                }

                for (var i = 0; i < funcDeclAST.args.members.length; i++) {

                    if (i < contextParams.length) {
                        contextParam = contextParams[i];
                    }

                    this.resolveFunctionTypeSignatureParameter(<ArgDecl>funcDeclAST.args.members[i], signature, contextParam, enclosingDecl);
                }
            }

            // set contextual type link
            if (assigningFunctionTypeSymbol) {
                funcDeclSymbol.addOutgoingLink(assigningFunctionTypeSymbol, SymbolLinkKind.ContextuallyTypedAs);
            }

            funcDeclSymbol.setResolved();

            // PULLTODO: REVIEW: Should this be placed in the file decl instead?
            if (enclosingDecl) {
                enclosingDecl.addContainedExpressionSymbol(funcDeclSymbol);
            }

            return funcDeclSymbol;
        }

        public resolveThisExpression(ast: AST, enclosingDecl: PullDecl) {
            return this.semanticInfoChain.anyTypeSymbol;
        }

        public resolveSuperExpression(ast: AST, enclosingDecl: PullDecl) {
            return this.semanticInfoChain.anyTypeSymbol;
        }

        // if there's no type annotation on the assigning AST, we need to create a type from each binary expression
        // in the object literal
        public resolveObjectLiteralExpression(expressionAST: AST, assigningAST: AST, enclosingDecl: PullDecl): PullSymbol {

            // walk the members of the object literal,
            // create fields for each based on the value assigned in
            var objectLitAST = <UnaryExpression>expressionAST;
            var typeSymbol = new PullTypeSymbol("", DeclKind.Interface);
            var memberDecls = <ASTList>objectLitAST.operand;

            if (memberDecls) {
                var binex:BinaryExpression;
                var id:AST;
                var text: string;
                var idText: string;
                var memberSymbol: PullSymbol;
                var memberExprType: PullSymbol;

                for (var i = 0, len = memberDecls.members.length; i < len; i++) {
                    binex = <BinaryExpression>memberDecls.members[i];

                    id = binex.operand1;

                    if (id.nodeType == NodeType.Name) {
                        text = (<Identifier>id).text;
                    }
                    else if (id.nodeType == NodeType.QString) {
                        idText = (<StringLiteral>id).text;
                        text = idText.substring(1, idText.length - 1);
                    }
                    else {
                        return this.semanticInfoChain.anyTypeSymbol;
                    }

                    memberSymbol = new PullSymbol(text, DeclKind.Field);

                    memberExprType = this.resolveStatementOrExpression(binex.operand2, binex.operand1, enclosingDecl);
                    
                    memberSymbol.setType(memberExprType.getType());
                }
            }

            return typeSymbol;
        }

        public resolveArrayLiteralExpression(expressionAST: AST, assigningAST: AST, enclosingDecl: PullDecl): PullSymbol {
            var typeDeclSymbol = this.semanticInfoChain.anyTypeSymbol;

            // PULLTODO: This info should be cached...
            var arraySymbol = typeDeclSymbol.getArrayType();
         
            // ...But in case we haven't...
            if (!arraySymbol) {                    
                // PULLTODO: We shouldn't need to keep searching out 'Array'
                if (!this.cachedArrayInterfaceType) {
                    this.cachedArrayInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("Array", this.getPathToDecl(enclosingDecl), DeclKind.Interface);
                }

                arraySymbol = specializeToArrayType(this.cachedArrayInterfaceType, this.semanticInfoChain.elementTypeSymbol, typeDeclSymbol, this);

                if (!arraySymbol) {
                    arraySymbol = this.semanticInfoChain.anyTypeSymbol;
                }
            }
            
            return arraySymbol;
        }

        // PULLTODO
        public resolveIndexExpression(expressionAST: AST, assigningAST: AST, enclosingDecl: PullDecl): PullSymbol {
            return this.semanticInfoChain.anyTypeSymbol;
        }

        public resolveBitwiseOperator(expressionAST: AST, assigningAST: AST, enclosingDecl: PullDecl): PullSymbol {

            var binex = <BinaryExpression>expressionAST;

            var leftType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand1, assigningAST, enclosingDecl);
            var rightType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand2, assigningAST, enclosingDecl);

            if (this.sourceIsSubtypeOfTarget(leftType, this.semanticInfoChain.numberTypeSymbol) &&
                this.sourceIsSubtypeOfTarget(rightType, this.semanticInfoChain.numberTypeSymbol)) {
                
                return this.semanticInfoChain.numberTypeSymbol;
            }
            else if ((leftType == this.semanticInfoChain.boolTypeSymbol) &&
                     (rightType == this.semanticInfoChain.boolTypeSymbol)) {
                
                return this.semanticInfoChain.boolTypeSymbol;
            }
            else if (leftType == this.semanticInfoChain.anyTypeSymbol) {
                if ((rightType == this.semanticInfoChain.anyTypeSymbol) ||
                    (rightType == this.semanticInfoChain.numberTypeSymbol) ||
                    (rightType == this.semanticInfoChain.boolTypeSymbol)) {

                    return this.semanticInfoChain.anyTypeSymbol;
                }
            }
            else if (rightType == this.semanticInfoChain.anyTypeSymbol) {
                if ((leftType == this.semanticInfoChain.numberTypeSymbol) ||
                    (leftType == this.semanticInfoChain.boolTypeSymbol)) {

                    return this.semanticInfoChain.anyTypeSymbol;
                }
            }

            return this.semanticInfoChain.anyTypeSymbol;
        }

        public resolveArithmeticExpression(expressionAST: AST, assigningAST: AST, enclosingDecl: PullDecl): PullSymbol {
            var binex = <BinaryExpression>expressionAST;

            var leftType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand1, assigningAST, enclosingDecl);
            var rightType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand2, assigningAST, enclosingDecl);
            
            // PULLTODO: Eh?
            if (this.isNullOrUndefinedType(leftType)) {
                leftType = rightType;
            }
            if (this.isNullOrUndefinedType(rightType)) {
                rightType = leftType;
            }

            leftType = this.widenType(leftType);
            rightType = this.widenType(rightType);

            if (expressionAST.nodeType == NodeType.Add || expressionAST.nodeType == NodeType.AsgAdd) {
                if (leftType == this.semanticInfoChain.stringTypeSymbol || rightType == this.semanticInfoChain.stringTypeSymbol) {
                    return this.semanticInfoChain.stringTypeSymbol;
                }
                else if (leftType == this.semanticInfoChain.numberTypeSymbol && rightType == this.semanticInfoChain.numberTypeSymbol) {
                    return this.semanticInfoChain.numberTypeSymbol;
                }
                else if (this.sourceIsSubtypeOfTarget(leftType, this.semanticInfoChain.numberTypeSymbol) && this.sourceIsSubtypeOfTarget(rightType, this.semanticInfoChain.numberTypeSymbol)) {
                    return this.semanticInfoChain.numberTypeSymbol;
                }
                else {
                    // could be an error
                    return this.semanticInfoChain.anyTypeSymbol;
                }
            }
            else {
                if (leftType == this.semanticInfoChain.numberTypeSymbol && rightType == this.semanticInfoChain.numberTypeSymbol) {
                    return this.semanticInfoChain.numberTypeSymbol;
                }
                else if (this.sourceIsSubtypeOfTarget(leftType, this.semanticInfoChain.numberTypeSymbol) && this.sourceIsSubtypeOfTarget(rightType, this.semanticInfoChain.numberTypeSymbol)) {
                    return this.semanticInfoChain.numberTypeSymbol;
                }
                else if (leftType == this.semanticInfoChain.anyTypeSymbol || rightType == this.semanticInfoChain.anyTypeSymbol) {
                    return this.semanticInfoChain.numberTypeSymbol;
                }
                else {
                    // error
                    return this.semanticInfoChain.anyTypeSymbol;
                }
            }
        }

        public resolveLogicalOrExpression(expressionAST: AST, assigningAST: AST, enclosingDecl: PullDecl): PullSymbol {
            var binex = <BinaryExpression>expressionAST;

            var leftType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand1, assigningAST, enclosingDecl);
            var rightType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand2, assigningAST, enclosingDecl);
            
            if (leftType == this.semanticInfoChain.anyTypeSymbol || rightType == this.semanticInfoChain.anyTypeSymbol) {
                return this.semanticInfoChain.anyTypeSymbol;
            }
            else if (leftType == this.semanticInfoChain.boolTypeSymbol) {
                if (rightType == this.semanticInfoChain.boolTypeSymbol) {
                    return this.semanticInfoChain.boolTypeSymbol;
                }
                else {
                    return this.semanticInfoChain.anyTypeSymbol;
                }
            }
            else if (leftType == this.semanticInfoChain.numberTypeSymbol) {
                if (rightType == this.semanticInfoChain.numberTypeSymbol) {
                    return this.semanticInfoChain.numberTypeSymbol;
                }
                else {
                    return this.semanticInfoChain.anyTypeSymbol
                }
            }
            else if (leftType == this.semanticInfoChain.stringTypeSymbol) {
                if (rightType == this.semanticInfoChain.stringTypeSymbol) {
                    return this.semanticInfoChain.stringTypeSymbol;
                }
                else {
                    return this.semanticInfoChain.anyTypeSymbol;
                }
            }
            else if (this.sourceIsSubtypeOfTarget(leftType, rightType)) {
                return rightType;
            }
            else if (this.sourceIsSubtypeOfTarget(rightType, leftType)) {
                return leftType;
            }

            return this.semanticInfoChain.anyTypeSymbol;
        }

        public resolveLogicalAndExpression(expressionAST: AST, assigningAST: AST, enclosingDecl: PullDecl): PullSymbol {
            var binex = <BinaryExpression>expressionAST;

            var leftType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand1, assigningAST, enclosingDecl);
            var rightType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand2, assigningAST, enclosingDecl);
            
            return rightType;
        }

        public resolveCallExpression(expressionAST: AST, assigningAST: AST, enclosingDecl: PullDecl): PullSymbol {
            var callEx = <CallExpression>expressionAST;

            // resolve the target
            var targetSymbol = this.resolveStatementOrExpression(callEx.target, assigningAST, enclosingDecl).getType();

            if (targetSymbol == this.semanticInfoChain.anyTypeSymbol) {
                return targetSymbol;
            }

            // the target should be a function
            //if (!targetSymbol.isType()) {
            //    this.log("Attempting to call a non-function symbol");
            //    return this.semanticInfoChain.anyTypeSymbol;
            //}

            var signatures = (<PullFunctionSymbol>targetSymbol).getCallSignatures();

            if (!signatures.length) {
                this.log("RESOLUTION ERROR: Attempting to call on a type with no call signatures");
                return this.semanticInfoChain.anyTypeSymbol;
            }

            // now grab the signature - the first one, for now, and return the return type
            // PULLTODO: Overload resolution
            var signature = signatures[0];
            var returnType = signature.getReturnType();

            if (returnType) {
                if (returnType.hasBrand()) {
                    return (<PullClassSymbol>returnType).getInstanceType();
                }
                else {
                    return returnType;
                }
            }
            else {
                return this.semanticInfoChain.anyTypeSymbol;
            }
        }

        public resolveNewExpression(expressionAST: AST, assigningAST: AST, enclosingDecl: PullDecl): PullSymbol {
            var callEx = <CallExpression>expressionAST;

            // resolve the target
            var targetSymbol = this.resolveStatementOrExpression(callEx.target, assigningAST, enclosingDecl);

            var targetTypeSymbol = targetSymbol.isType() ? <PullTypeSymbol>targetSymbol : targetSymbol.getType();

            if (targetTypeSymbol == this.semanticInfoChain.anyTypeSymbol) {
                return this.semanticInfoChain.anyTypeSymbol;
            }

            if (targetTypeSymbol.hasBrand()) {
                return (<PullClassSymbol>targetTypeSymbol).getInstanceType();
            }

            var constructSignatures = targetTypeSymbol.getConstructSignatures();

            // PULLTODO: Overload resolution
            if (constructSignatures.length) {
                return constructSignatures[0].getReturnType();
            }
            
            this.log("RESOLUTION ERROR: Invalid 'new' expression");

            return this.semanticInfoChain.anyTypeSymbol;

        }

        public resolveTypeAssertionExpression(expressionAST: AST, assigningAST: AST, enclosingDecl: PullDecl): PullSymbol {
            var assertionExpression = <UnaryExpression>expressionAST;
            var typeReference = this.resolveTypeReference(<TypeReference>assertionExpression.castTerm, enclosingDecl);

            if (typeReference.hasBrand()) {
                return (<PullClassSymbol>typeReference).getInstanceType();
            }
            else {
                return typeReference;
            }
        }
        
        // type relationships

        public findBestCommonType(typeSymbols: PullSymbol[]): PullTypeSymbol {
            if (typeSymbols.length) {
                return typeSymbols[0].getType();
            }
            return this.semanticInfoChain.anyTypeSymbol;
        }

        public widenType(type: PullTypeSymbol): PullTypeSymbol {
            return type;
        }

        public isNullOrUndefinedType(type: PullTypeSymbol) {
            return  type == this.semanticInfoChain.nullTypeSymbol ||
                    type == this.semanticInfoChain.undefinedTypeSymbol;
        }

        public sourceIsSubtypeOfTarget(sourceType: PullTypeSymbol, targetType: PullTypeSymbol) {
            return false;
        }

        public sourceIsAssignableToTarget(sourceType: PullTypeSymbol, targetType: PullTypeSymbol) {
            return false;
        }

        public resolveBoundDecls(decl: PullDecl): void {
            if (!decl) {
                return;
            }

            switch (decl.getKind()) {
                case DeclKind.Script:
                    var childDecls = decl.getChildDecls();
                    for (var i = 0; i < childDecls.length; i++) {
                        this.resolveBoundDecls(childDecls[i]);
                    }
                    break;
                case DeclKind.Module:
                    var moduleDecl = <ModuleDecl>this.semanticInfoChain.getASTForDecl(decl, this.unitPath);
                    this.resolveModuleDeclaration(moduleDecl);
                    break;
                case DeclKind.Interface:
                    var interfaceDecl = <TypeDecl>this.semanticInfoChain.getASTForDecl(decl, this.unitPath);
                    this.resolveInterfaceDeclaration(interfaceDecl);
                    break;
                case DeclKind.Class:
                    var classDecl = <ClassDecl>this.semanticInfoChain.getASTForDecl(decl, this.unitPath);
                    this.resolveClassDeclaration(classDecl);
                    break;
                case DeclKind.Method:
                case DeclKind.StaticMethod:
                case DeclKind.Function:
                    var funcDecl = <FuncDecl>this.semanticInfoChain.getASTForDecl(decl, this.unitPath);
                    this.resolveFunctionDeclaration(funcDecl);
                    break;
                case DeclKind.Field:
                case DeclKind.StaticField:
                case DeclKind.Variable:
                case DeclKind.Argument:
                    var varDecl = <BoundDecl>this.semanticInfoChain.getASTForDecl(decl, this.unitPath);
                    this.resolveVariableDeclaration(varDecl);
                    break;
            }
        }
    }
}