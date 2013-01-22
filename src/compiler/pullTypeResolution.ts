// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='typescript.ts' />


/*

Architectural TODO:

- More consistent use of PullSymbol subtyping.  (Basically, audit all return and param types)
- Make better use of the AST/Symbol cache
- Replace assigningAST param on resolution methods with something that accepts both and AST or a PullSymbol
- Adopt a consistent approach to determining if something has been resolved.  
 (Basically, we need to straighten out how we get the symbol - do we ask a decl for it, or just consult the cache?)
- Straighten out default names ("" or null?)

*/
module TypeScript {

    export interface IPullTypeCollection {
        // returns null when types are exhausted
        getLength(): number;
        setTypeAtIndex(index: number, type: PullTypeSymbol): void;
        getTypeAtIndex(index: number): PullTypeSymbol;
    }

    // The resolver associates types with a given AST
    export class PullTypeResolver {

        private cachedArrayInterfaceType: PullTypeSymbol = null;
        private cachedNumberInterfaceType: PullTypeSymbol = null;
        private cachedStringInterfaceType: PullTypeSymbol = null;
        private cachedBooleanInterfaceType: PullTypeSymbol = null;
        private cachedObjectInterfaceType: PullTypeSymbol = null;
        private cachedFunctionInterfaceType: PullTypeSymbol = null;
        private cachedIArgumentsInterfaceType: PullTypeSymbol = null;

        private assignableCache: any[] = <any>{};
        private subtypeCache: any[] = <any>{};
        private identicalCache: any[] = <any>{};

        constructor (private semanticInfoChain: SemanticInfoChain, private unitPath: string, private logger: ILogger) {
            this.cachedArrayInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("Array", [], DeclKind.Interface);
            this.cachedNumberInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("Number", [], DeclKind.Interface);
            this.cachedStringInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("String", [], DeclKind.Interface);
            this.cachedBooleanInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("Boolean", [], DeclKind.Interface);
            this.cachedObjectInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("Object", [], DeclKind.Interface);
            this.cachedFunctionInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("Function", [], DeclKind.Interface);
            this.cachedIArgumentsInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("IArguments", [], DeclKind.Interface);
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

        public getSymbolForAST(ast: AST, unitPath?: string) {
            return this.semanticInfoChain.getSymbolForAST(ast, unitPath ? unitPath : this.unitPath);
        }

        public setSymbolForAST(ast: AST, typeSymbol: PullSymbol, unitPath?: string) {
            return this.semanticInfoChain.setSymbolForAST(ast, typeSymbol, unitPath ? unitPath : this.unitPath);
        }

        public getASTForSymbol(symbol: PullSymbol, unitPath?: string) {
            return this.semanticInfoChain.getASTForSymbol(symbol, unitPath ? unitPath : this.unitPath);
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

            if (!symbol || symbol.isResolved()) {
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

            var funcName = funcDeclAST.name ? funcDeclAST.name.text : funcDeclAST.hint ? funcDeclAST.hint : "";

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

            this.setSymbolForAST(funcDeclAST, funcDeclSymbol);

            return funcDeclSymbol;
        }

        public resolveFunctionTypeSignatureParameter(argDeclAST: ArgDecl, signatureSymbol: PullSymbol, contextParam: PullSymbol, enclosingDecl: PullDecl) {
            var paramSymbol = new PullSymbol(argDeclAST.id.actualText, DeclKind.Argument);

            (<PullSignatureSymbol>signatureSymbol).addParameter(paramSymbol);            

            if (argDeclAST.typeExpr) {
                var typeRef = this.resolveTypeReference(<TypeReference>argDeclAST.typeExpr, enclosingDecl);
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

            var argDecl = this.getDeclForAST(argDeclAST);

            if (argDecl) {
                argDecl.setSymbol(paramSymbol);
            }

            this.setSymbolForAST(argDeclAST, paramSymbol);
        }

        public resolveInterfaceTypeReference(interfaceDeclAST: NamedType, enclosingDecl: PullDecl): PullTypeSymbol {
            var interfaceSymbol = new PullTypeSymbol("", DeclKind.Interface);

            if (interfaceDeclAST.members) {

                var memberSymbol: PullSymbol = null;
                var varDecl: VarDecl = null;
                var funcDecl: FuncDecl = null;
                var typeMembers = <ASTList> interfaceDeclAST.members;
                var methodSymbol: PullFunctionSymbol = null;

                for (var i = 0; i < typeMembers.members.length; i++) {

                    if (typeMembers.members[i].nodeType == NodeType.VarDecl) {
                        varDecl = <VarDecl>typeMembers.members[i];
                        memberSymbol = new PullSymbol(varDecl.id.actualText, DeclKind.Field);

                        if (varDecl.typeExpr) {
                            var typeExprSymbol = this.resolveTypeReference(<TypeReference>varDecl.typeExpr, enclosingDecl);

                            if (!typeExprSymbol) {
                                this.log("RESOLUTION ERROR: Could not resolve type expression for variable '" + varDecl.id.actualText + "'");
                                memberSymbol.setType(this.semanticInfoChain.anyTypeSymbol);
                            }
                            else {
                                if (typeExprSymbol.hasBrand()) {
                                    typeExprSymbol = (<PullClassSymbol>typeExprSymbol).getInstanceType();
                                }
                                memberSymbol.setType(typeExprSymbol);
                            }

                            memberSymbol.setResolved();
                        }

                        this.setSymbolForAST(varDecl, memberSymbol);

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

                        methodSymbol.setResolved();
                    }
                }
            }

            interfaceSymbol.setResolved();

            return interfaceSymbol;
        }

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
            if (typeRef.arrayCount) {
                var arraySymbol: PullTypeSymbol = typeDeclSymbol.getArrayType();

                // otherwise, create a new array symbol
                if (!arraySymbol) {                    
                    // for each member in the array interface symbol, substitute in the the typeDecl symbol for "_element"
                    //var arrayInterfaceSymbol = <PullTypeSymbol>this.findSymbolForPath(["Array"], enclosingDecl, DeclKind.Interface);
                    
                    if (!this.cachedArrayInterfaceType) {
                        this.cachedArrayInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("Array", this.getPathToDecl(enclosingDecl), DeclKind.Interface);
                    }
                    arraySymbol = specializeToArrayType(this.cachedArrayInterfaceType, this.semanticInfoChain.elementTypeSymbol, typeDeclSymbol, this);

                    if (!arraySymbol) {
                        arraySymbol = this.semanticInfoChain.anyTypeSymbol;
                    }
                }
            
                typeDeclSymbol = arraySymbol;
            }

            this.setSymbolForAST(typeRef, typeDeclSymbol);

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

                if (!typeExprSymbol) {
                    this.log("RESOLUTION ERROR: Could not resolve type expression for variable '" + varDecl.id.actualText + "'");
                    declSymbol.setType(this.semanticInfoChain.anyTypeSymbol);
                    if (declPropertySymbol) {
                        declPropertySymbol.setType(this.semanticInfoChain.anyTypeSymbol);
                    }
                }
                else {
                    if (typeExprSymbol.hasBrand()) {
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

                var initExprSymbol = this.resolveStatementOrExpression(varDecl.init, false, this.getEnclosingDecl(decl), new PullTypeResolutionContext());

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
                this.setSymbolForAST(varDecl, declPropertySymbol);
            }
            else {
                this.setSymbolForAST(varDecl, declSymbol);
            }            

            return declSymbol;
        }

        public resolveFunctionBodyReturnTypes(funcDeclAST: FuncDecl, signature: PullSignatureSymbol, enclosingDecl: PullDecl, context: PullTypeResolutionContext) {
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
                var returnExpressionSymbols: PullTypeSymbol[] = [];

                for (var i = 0; i < returnStatements.length; i++) {
                    if (returnStatements[i].returnExpression) {
                        returnExpressionSymbols[returnExpressionSymbols.length] = this.resolveStatementOrExpression(returnStatements[i].returnExpression, false, enclosingDecl, context).getType();
                    }
                }

                if (!returnExpressionSymbols.length) {
                    signature.setReturnType(this.semanticInfoChain.voidTypeSymbol);
                }
                else {

                    // combine return expression types for best common type

                    var collection: IPullTypeCollection = {
                            getLength: () => {return returnExpressionSymbols.length;},
                            setTypeAtIndex: (index: number, type: PullTypeSymbol) => { },
                            getTypeAtIndex: (index: number) => {
                            return returnExpressionSymbols[index].getType();
                            }
                    }
                    var returnType = this.findBestCommonType(returnExpressionSymbols[0], null, collection, true, new TypeComparisonInfo());
                    signature.setReturnType(returnType ? returnType : this.semanticInfoChain.anyTypeSymbol);

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
                        this.resolveFunctionBodyReturnTypes(funcDeclAST, signature, funcDecl, new PullTypeResolutionContext());
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

        public resolveAST(ast: AST, isTypedAssignment: bool, enclosingDecl: PullDecl, context: PullTypeResolutionContext) {
            switch (ast.nodeType) {
                case NodeType.Module:
                case NodeType.Interface:
                case NodeType.Class:
                case NodeType.VarDecl:
                case NodeType.ArgDecl:
                    return this.resolveDeclaration(ast);

                case NodeType.FuncDecl:
                    if (isTypedAssignment) {
                        return this.resolveStatementOrExpression(ast, isTypedAssignment, enclosingDecl, context);
                    }
                    else {
                        return this.resolveDeclaration(ast);
                    }

                default:
                    return this.resolveStatementOrExpression(ast, isTypedAssignment, enclosingDecl, context);
            }
        }

        public resolveStatementOrExpression(expressionAST: AST, isTypedAssignment: bool, enclosingDecl: PullDecl, context: PullTypeResolutionContext):PullSymbol {

            switch (expressionAST.nodeType) {
                case NodeType.Name:
                    return this.resolveNameExpression(<Identifier>expressionAST, enclosingDecl, context);
                case NodeType.Dot:
                    return this.resolveDottedNameExpression(<BinaryExpression>expressionAST, enclosingDecl, context);
                case NodeType.FuncDecl:
                    return this.resolveFunctionExpression(<FuncDecl>expressionAST, isTypedAssignment, enclosingDecl, context);

                case NodeType.ObjectLit:
                    return this.resolveObjectLiteralExpression(expressionAST, isTypedAssignment, enclosingDecl, context);

                case NodeType.ArrayLit:
                    return this.resolveArrayLiteralExpression(expressionAST, isTypedAssignment, enclosingDecl, context);

                case NodeType.This:
                    return this.resolveThisExpression(expressionAST, enclosingDecl, context);
                case NodeType.Super:
                    return this.resolveSuperExpression(expressionAST, enclosingDecl, context);

                case NodeType.Call:
                    return this.resolveCallExpression(expressionAST, isTypedAssignment, enclosingDecl, context);

                case NodeType.New:
                    return this.resolveNewExpression(expressionAST, isTypedAssignment, enclosingDecl, context);

                case NodeType.TypeAssertion:
                    return this.resolveTypeAssertionExpression(expressionAST, isTypedAssignment, enclosingDecl, context);

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
                    return this.resolveArithmeticExpression(expressionAST, isTypedAssignment, enclosingDecl, context);

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
                    return this.resolveIndexExpression(expressionAST, isTypedAssignment, enclosingDecl, context);

                case NodeType.LogOr:
                    return this.resolveLogicalOrExpression(expressionAST, isTypedAssignment, enclosingDecl, context);
                case NodeType.LogAnd:
                    return this.resolveLogicalAndExpression(expressionAST, isTypedAssignment, enclosingDecl, context);

                case NodeType.Typeof:
                    return this.semanticInfoChain.stringTypeSymbol;
            }

            return this.semanticInfoChain.anyTypeSymbol;
        }

        public resolveNameExpression(nameAST: Identifier, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {
  
            var id = nameAST.actualText;

            var declPath = this.getPathToDecl(enclosingDecl);

            if (enclosingDecl && !declPath.length) {
                declPath = [enclosingDecl];
            }

            // first, resolve the id as a value
            //var nameSymbol: PullSymbol = this.findSymbolForPath([id], enclosingDecl, DeclKind.SomeValue);
            var nameSymbol = this.getSymbolFromDeclPath(id, declPath, DeclKind.SomeValue);

            // no luck? check the type space
            if (!nameSymbol) {
                //nameSymbol = this.findSymbolForPath([id], enclosingDecl, DeclKind.SomeType);
                nameSymbol = this.getSymbolFromDeclPath(id, declPath, DeclKind.SomeType);
            }

            if (!nameSymbol) {
                this.log("RESOLUTION ERROR: Could not find symbol '" + id + "'");
                return this.semanticInfoChain.anyTypeSymbol;
            }

            // PULLREVIEW: This requires that the AST related to the symbol in question be in memory
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

        public resolveDottedNameExpression(dottedNameAST: BinaryExpression, enclosingDecl: PullDecl, context: PullTypeResolutionContext) {
            // assemble the dotted name path
            var rhsName = (<Identifier>dottedNameAST.operand2).actualText;


            var lhs: PullSymbol = this.resolveStatementOrExpression(dottedNameAST.operand1, false, enclosingDecl, context);
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

        public resolveFunctionExpression(funcDeclAST: FuncDecl, isTypedAssignment: bool, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {
             
            var functionDecl = this.getDeclForAST(funcDeclAST);

            if (functionDecl) {
                var symbol = functionDecl.getSymbol();
                if (symbol.isResolved()) {
                    return symbol;
                }
            }

            // if we have an assigning AST with a type, and the funcDecl has no parameter types or return type annotation
            // we'll contextually type it
            // otherwise, just process it as a normal function declaration
            
            var shouldContextuallyType = isTypedAssignment;
            
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

                assigningFunctionTypeSymbol = <PullFunctionSymbol>context.getContextualType(); // this.getDeclForAST(assigningAST).getSymbol().getType();

                this.resolveDeclaredSymbol(assigningFunctionTypeSymbol);

                if (assigningFunctionTypeSymbol) {
                    assigningFunctionSignature = assigningFunctionTypeSymbol.getCallSignatures()[0];
                }
            }

            // PULLTODO: Anonymous function names should be "" and not null
            var funcName = funcDeclAST.name ? funcDeclAST.name.text : funcDeclAST.hint;

            var isConstructor = hasFlag(funcDeclAST.fncFlags,FncFlags.ConstructMember);
            var isIndex = hasFlag(funcDeclAST.fncFlags,FncFlags.IndexerMember);
            var sigDeclKind = isConstructor ? DeclKind.ConstructSignature :
                            isIndex ? DeclKind.IndexSignature : DeclKind.CallSignature;
            
            var funcDeclSymbol = new PullFunctionSymbol(funcName, DeclKind.Function);

            var signature = new PullSignatureSymbol(null, sigDeclKind);

            funcDeclSymbol.addSignature(signature);

            // create a new function decl
            var semanticInfo = this.semanticInfoChain.getUnit(this.unitPath);
            var declCollectionContext = new DeclCollectionContext(semanticInfo);

            declCollectionContext.scriptName = this.unitPath;

            getAstWalkerFactory().walk(funcDeclAST, preCollectDecls, postCollectDecls, null, declCollectionContext);

            functionDecl = this.getDeclForAST(funcDeclAST);

            if (functionDecl) {
                functionDecl.setSymbol(funcDeclSymbol);
                funcDeclSymbol.addDeclaration(functionDecl);
            }

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

                    this.resolveFunctionBodyReturnTypes(funcDeclAST, signature, functionDecl, context);
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

            // PULLREVIEW: Should this be placed in the file decl instead?
            if (enclosingDecl) {
                enclosingDecl.addContainedExpressionSymbol(funcDeclSymbol);
            }

            return funcDeclSymbol;
        }

        public resolveThisExpression(ast: AST, enclosingDecl: PullDecl, context: PullTypeResolutionContext) {

            if (!enclosingDecl) {
                return this.semanticInfoChain.anyTypeSymbol;
            }

            var declPath = this.getPathToDecl(enclosingDecl);
            var decl: PullDecl;
            var classSymbol: PullClassSymbol;

            // work back up the decl path, until you can find a class
            // PULLTODO: Obviously not completely correct, but this sufficiently unblocks testing of the pull model
            if (declPath.length) {
                for (var i = declPath.length - 1; i >= 0; i--) {
                    decl = declPath[i];

                    if (decl.getKind() == DeclKind.Class) {
                        classSymbol = <PullClassSymbol>decl.getSymbol();
                        
                        // set to the instance type
                        classSymbol = <PullClassSymbol>classSymbol.getInstanceType();
                        return classSymbol;
                    }
                }
            }
            
            return this.semanticInfoChain.anyTypeSymbol;
        }

        public resolveSuperExpression(ast: AST, enclosingDecl: PullDecl, context: PullTypeResolutionContext) {
            return this.semanticInfoChain.anyTypeSymbol;
        }

        // if there's no type annotation on the assigning AST, we need to create a type from each binary expression
        // in the object literal
        public resolveObjectLiteralExpression(expressionAST: AST, isTypedAssignment: bool, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {

            var typeSymbol: PullTypeSymbol = <PullTypeSymbol>this.getSymbolForAST(expressionAST);

            if (typeSymbol && typeSymbol.isResolved()) {
                return typeSymbol.getType();
            }

            // walk the members of the object literal,
            // create fields for each based on the value assigned in
            var objectLitAST = <UnaryExpression>expressionAST;
            typeSymbol = new PullTypeSymbol("", DeclKind.Interface);
            var memberDecls = <ASTList>objectLitAST.operand;

            var contextualType: PullTypeSymbol = null;
            
            if (isTypedAssignment) {
                contextualType = context.getContextualType();

                this.resolveDeclaredSymbol(contextualType);
            }

            if (memberDecls) {
                var binex:BinaryExpression;
                var id:AST;
                var text: string;
                var idText: string;
                var memberSymbol: PullSymbol;
                var memberExprType: PullSymbol;
                var assigningSymbol: PullSymbol = null;
                var acceptedContextualType = false;

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

                    if (contextualType) {
                        assigningSymbol = contextualType.getMemberByName(text);

                        if (assigningSymbol) {

                            this.resolveDeclaredSymbol(assigningSymbol);

                            context.pushContextualType(assigningSymbol.getType(), context.inProvisionalResolution());

                            acceptedContextualType = true;
                        }
                    }

                    memberExprType = this.resolveStatementOrExpression(binex.operand2, assigningSymbol != null, enclosingDecl, context);

                    if (acceptedContextualType) {
                        context.popContextualType();
                        acceptedContextualType = false;
                    }
                    
                    memberSymbol.setType(memberExprType.getType());

                    typeSymbol.addMember(memberSymbol, SymbolLinkKind.PublicProperty);
                }
            }

            typeSymbol.setResolved();

            this.setSymbolForAST(expressionAST, typeSymbol);

            return typeSymbol;
        }

        public resolveArrayLiteralExpression(expressionAST: AST, isTypedAssignment, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {
            var arrayLit = <UnaryExpression>expressionAST;

            var elements = <ASTList>arrayLit.operand;
            var elementType = this.semanticInfoChain.anyTypeSymbol;
            var elementTypes: PullTypeSymbol[] = [];
            var targetElementType: PullTypeSymbol = null;
            var comparisonInfo = new TypeComparisonInfo();
            comparisonInfo.onlyCaptureFirstError = true;

            // if the target type is an array type, extract the element type
            if (isTypedAssignment) {
                var contextualType = context.getContextualType();

                this.resolveDeclaredSymbol(contextualType);

                if (contextualType.isArray()) {
                    contextualType = contextualType.getElementType();
                }

                if (contextualType.hasBrand() && (<PullClassSymbol>contextualType).getInstanceType()) {
                    contextualType = (<PullClassSymbol>contextualType).getInstanceType();
                }

                context.pushContextualType(contextualType, context.inProvisionalResolution());
            }

            if (elements) {

                for (var i = 0; i < elements.members.length; i++) {
                    elementTypes[elementTypes.length] = this.resolveStatementOrExpression(elements.members[i], isTypedAssignment, enclosingDecl, context).getType();                    
                }

                if (isTypedAssignment) {
                    context.popContextualType();
                }

                if (elementTypes.length) {
                    elementType = elementTypes[0];
                }

                var collection: IPullTypeCollection = {
                    getLength: () => { return elements.members.length; },
                    setTypeAtIndex: (index: number, type: PullTypeSymbol) => { elementTypes[index] = type; },
                    getTypeAtIndex: (index: number) => { return elementTypes[index]; }
                }

                elementType = this.findBestCommonType(elementType, targetElementType, collection, false, comparisonInfo);

                // if the array type is the undefined type, we should widen it to any
                // if it's of the null type, only widen it if it's not in a nested array element, so as not to 
                // short-circuit any checks for the best common type
                if (elementType == this.semanticInfoChain.undefinedTypeSymbol || elementType == this.semanticInfoChain.nullTypeSymbol) {
                    elementType = this.semanticInfoChain.anyTypeSymbol;
                }
            }
            if (!elementType) {
                this.log("RESOLUTION ERROR: Incompatible types in array literal expression");

                elementType = this.semanticInfoChain.anyTypeSymbol;
            }
            else if (targetElementType) {
                // for the case of zero-length 'any' arrays, we still want to set the contextual type, if
                // need be
                if (this.sourceIsAssignableToTarget(elementType, targetElementType)) {
                    elementType = targetElementType;
                }
            }

            var arraySymbol = elementType.getArrayType();
         
            // ...But in case we haven't...
            if (!arraySymbol) {                    

                if (!this.cachedArrayInterfaceType) {
                    this.cachedArrayInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("Array", this.getPathToDecl(enclosingDecl), DeclKind.Interface);
                }

                arraySymbol = specializeToArrayType(this.cachedArrayInterfaceType, this.semanticInfoChain.elementTypeSymbol, elementType, this);

                if (!arraySymbol) {
                    arraySymbol = this.semanticInfoChain.anyTypeSymbol;
                }
            }
            
            return arraySymbol;
        }

        public resolveIndexExpression(expressionAST: AST, isTypedAssignment: bool, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {

            var indexType = <PullTypeSymbol>this.resolveStatementOrExpression((<BinaryExpression>expressionAST).operand1, isTypedAssignment, enclosingDecl, context).getType();
            var elementType = indexType.getElementType();
            
            if (elementType) {
                return elementType;
            }
            
            return this.semanticInfoChain.anyTypeSymbol;
        }

        public resolveBitwiseOperator(expressionAST: AST, isTypedAssignment: bool, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {

            var binex = <BinaryExpression>expressionAST;

            var leftType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand1, isTypedAssignment, enclosingDecl, context);
            var rightType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand2, isTypedAssignment, enclosingDecl, context);

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

        public resolveArithmeticExpression(expressionAST: AST, isTypedAssignment: bool, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {
            var binex = <BinaryExpression>expressionAST;

            var leftType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand1, isTypedAssignment, enclosingDecl, context);
            var rightType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand2, isTypedAssignment, enclosingDecl, context);
            
            // PULLREVIEW: Eh?  I've preserved the logic from the current implementation, but it could use cleaning up
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

        public resolveLogicalOrExpression(expressionAST: AST, isTypedAssignment: bool, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {
            var binex = <BinaryExpression>expressionAST;

            var leftType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand1, isTypedAssignment, enclosingDecl, context);
            var rightType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand2, isTypedAssignment, enclosingDecl, context);
            
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

        public resolveLogicalAndExpression(expressionAST: AST, isTypedAssignment: bool, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {
            var binex = <BinaryExpression>expressionAST;

            var leftType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand1, isTypedAssignment, enclosingDecl, context);
            var rightType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand2, isTypedAssignment, enclosingDecl, context);
            
            return rightType;
        }

        public resolveCallExpression(expressionAST: AST, isTypedAssignment: bool, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {
            var callEx = <CallExpression>expressionAST;

            // resolve the target
            var targetSymbol = this.resolveStatementOrExpression(callEx.target, isTypedAssignment, enclosingDecl, context).getType();

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
                // PULLREVIEW: The return type may be the result of a call, which would
                // have already returned the instance type.  Since the instance type of an
                // instance type is null, we'd get an NRE here, hence the check for the 
                // instance type.  I think we need a better, more consistent way of managing
                // instance versus constructor types here
                if (returnType.hasBrand() && (<PullClassSymbol>returnType).getInstanceType()) {
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

        public resolveNewExpression(expressionAST: AST, isTypedAssignment: bool, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {
            var callEx = <CallExpression>expressionAST;

            // resolve the target
            var targetSymbol = this.resolveStatementOrExpression(callEx.target, isTypedAssignment, enclosingDecl, context);

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

        public resolveTypeAssertionExpression(expressionAST: AST, isTypedAssignment: bool, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {
            var assertionExpression = <UnaryExpression>expressionAST;
            var typeReference = this.resolveTypeReference(<TypeReference>assertionExpression.castTerm, enclosingDecl);

            if (typeReference.hasBrand()) {
                typeReference = (<PullClassSymbol>typeReference).getInstanceType();
            }
            
            // PULLTODO: We don't technically need to resolve the operand, since the type of the
            // expression is the type of the cast term.  Still, it makes life a bit easier for the LS
            if (context.resolveAggressively && !assertionExpression.operand.isParenthesized) {
                context.pushContextualType(typeReference, context.inProvisionalResolution());
                    this.resolveStatementOrExpression(assertionExpression.operand, true, enclosingDecl, context);
                context.popContextualType();
            }

            return typeReference;
        }

        public resolveAssignmentStatement(statementAST: AST, isTypedAssignment: bool, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {
            var binex = <BinaryExpression>statementAST;

            var leftType = this.resolveStatementOrExpression(binex.operand1, isTypedAssignment, enclosingDecl, context).getType();

            context.pushContextualType(leftType, context.inProvisionalResolution());
                this.resolveStatementOrExpression(binex.operand2, isTypedAssignment, enclosingDecl, context);
            context.popContextualType();

            return leftType;
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

        // type relationships

        public mergeOrdered(a: PullTypeSymbol, b: PullTypeSymbol, acceptVoid: bool, comparisonInfo?: TypeComparisonInfo): PullTypeSymbol {
            if ((a == this.semanticInfoChain.anyTypeSymbol) || (b == this.semanticInfoChain.anyTypeSymbol)) {
                return this.semanticInfoChain.anyTypeSymbol;
            }
            else if (a == b) {
                return a;
            }
            else if ((b == this.semanticInfoChain.nullTypeSymbol) && a != this.semanticInfoChain.nullTypeSymbol) {
                return a;
            }
            else if ((a == this.semanticInfoChain.nullTypeSymbol) && (b != this.semanticInfoChain.nullTypeSymbol)) {
                return b;
            }
            else if (acceptVoid && (b == this.semanticInfoChain.voidTypeSymbol) && a != this.semanticInfoChain.voidTypeSymbol) {
                return a;
            }
            else if (acceptVoid && (a == this.semanticInfoChain.voidTypeSymbol) && (b != this.semanticInfoChain.voidTypeSymbol)) {
                return b;
            }
            else if ((b == this.semanticInfoChain.undefinedTypeSymbol) && a != this.semanticInfoChain.voidTypeSymbol) {
                return a;
            }
            else if ((a == this.semanticInfoChain.undefinedTypeSymbol) && (b != this.semanticInfoChain.undefinedTypeSymbol)) {
                return b;
            }
            else if (a.isArray() && b.isArray()) {
                if (a.getElementType() == b.getElementType()) {
                    return a;
                }
                else {
                    var mergedET = this.mergeOrdered(a.getElementType(), b.getElementType(), acceptVoid, comparisonInfo);
                    var mergedArrayType = mergedET.getArrayType();

                    if (!mergedArrayType) {
                        mergedArrayType = specializeToArrayType(this.cachedArrayInterfaceType, this.semanticInfoChain.elementTypeSymbol, mergedET, this);
                    }

                    return mergedArrayType;
                }
            }
            else if (this.sourceIsSubtypeOfTarget(a, b, comparisonInfo)) {
                return b;
            }
            else if (this.sourceIsSubtypeOfTarget(b, a, comparisonInfo)) {
                return a;
            }
            else {
                return this.semanticInfoChain.anyTypeSymbol;
            }
        }

        public widenType(type: PullTypeSymbol): PullTypeSymbol {
            if (type == this.semanticInfoChain.undefinedTypeSymbol ||
                type == this.semanticInfoChain.nullTypeSymbol) {

                return this.semanticInfoChain.anyTypeSymbol;
            }

            return type;
        }

        public isNullOrUndefinedType(type: PullTypeSymbol) {
            return  type == this.semanticInfoChain.nullTypeSymbol ||
                    type == this.semanticInfoChain.undefinedTypeSymbol;
        }

        public findBestCommonType(initialType: PullTypeSymbol, targetType: PullTypeSymbol, collection: IPullTypeCollection, acceptVoid:bool, comparisonInfo?: TypeComparisonInfo) {
            var i = 0;
            var len = collection.getLength();
            var nlastChecked = 0;
            var bestCommonType = initialType;

            if (targetType) {
                bestCommonType = bestCommonType ? this.mergeOrdered(bestCommonType, targetType, acceptVoid) : targetType;
            }

            // it's important that we set the convergence type here, and not in the loop,
            // since the first element considered may be the contextual type
            var convergenceType: PullTypeSymbol = bestCommonType;

            while (nlastChecked < len) {

                for (i = 0; i < len; i++) {

                    // no use in comparing a type against itself
                    if (i == nlastChecked) {
                        continue;
                    }

                    if (convergenceType && (bestCommonType = this.mergeOrdered(convergenceType, collection.getTypeAtIndex(i), acceptVoid, comparisonInfo))) {
                        convergenceType = bestCommonType;
                    }

                    if (bestCommonType == this.semanticInfoChain.anyTypeSymbol || bestCommonType == null) {
                        break;
                    }
                    else if (targetType) { // set the element type to the target type
                        collection.setTypeAtIndex(i, targetType);
                    }
                }

                // use the type if we've agreed upon it
                if (convergenceType && bestCommonType) {
                    break;
                }

                nlastChecked++;
                if (nlastChecked < len) {
                    convergenceType = collection.getTypeAtIndex(nlastChecked);
                }
            }

            return acceptVoid ? bestCommonType : (bestCommonType == this.semanticInfoChain.voidTypeSymbol ? null : bestCommonType);
        }

        // Type Identity

        public typesAreIdentical(t1: PullTypeSymbol, t2: PullTypeSymbol) {

            // This clause will cover both primitive types (since the type objects are shared),
            // as well as shared brands
            if (t1 == t2) {
                return true;
            }

            if (!t1 || !t2) {
                return false;
            }

            if (t1.hasBrand()) {
                return false;
            }

            var comboId = (t2.getSymbolID() << 16) | t1.getSymbolID();

            if (this.identicalCache[comboId]) {
                return true;
            }

            // If one is an enum, and they're not the same type, they're not identical
            if ((t1.getKind() & DeclKind.Enum) || (t2.getKind() & DeclKind.Enum)) {
                return false;
            }

            if (t1.isArray() || t2.isArray()) {
                if (!(t1.isArray() && t2.isArray())) {
                    return false;
                }
                this.identicalCache[comboId] = false;
                var ret = this.typesAreIdentical(t1.getElementType(), t2.getElementType());
                if (ret) {
                    this.subtypeCache[comboId] = true;
                }
                else {
                    this.subtypeCache[comboId] = undefined;
                }

                return ret;
            }

            if (t1.isPrimitive() != t2.isPrimitive()) {
                return false;
            }

            this.identicalCache[comboId] = false;

            // properties are identical in name, optionality, and type
            // REVIEW: TypeChanges - The compiler does not currently check against the members of parent types!
            // REVIEW: TypeChanges - What about ambientMembers?
            if (t1.hasMembers() && t2.hasMembers()) {
                var t1Members = t1.getMembers();
                var t2Members = t2.getMembers();

                if (t1Members.length != t2Members.length) {
                    this.identicalCache[comboId] = undefined;
                    return false;
                }

                var t1MemberSymbol: PullSymbol = null;
                var t2MemberSymbol: PullSymbol = null;

                var t1MemberType: PullTypeSymbol = null;
                var t2MemberType: PullTypeSymbol = null;

                for (var iMember = 0; iMember < t1Members.length; iMember++) {

                    t1MemberSymbol = t1Members[iMember];
                    t2MemberSymbol = t2.getMemberByName(t1MemberSymbol.getName());

                    if (t1MemberSymbol.getIsOptional() != t2MemberSymbol.getIsOptional()) {
                        this.identicalCache[comboId] = undefined;
                        return false;
                    }

                    t1MemberType = t1MemberSymbol.getType();
                    t2MemberType = t2MemberSymbol.getType();

                    // catch the mutually recursive or cached cases
                    if (t1MemberType && t2MemberType && (this.identicalCache[(t2MemberType.getSymbolID() << 16) | t1MemberType.getSymbolID()] != undefined)) {
                        continue;
                    }

                    if (!this.typesAreIdentical(t1MemberType, t2MemberType)) {
                        this.identicalCache[comboId] = undefined;
                        return false;
                    }
                }
            }
            else if (t1.hasMembers() || t2.hasMembers()) {
                this.identicalCache[comboId] = undefined;
                return false;
            }

            var t1CallSigs = t1.getCallSignatures();
            var t2CallSigs = t2.getCallSignatures();

            var t1ConstructSigs = t1.getConstructSignatures();
            var t2ConstructSigs = t2.getConstructSignatures();

            var t1IndexSigs = t1.getIndexSignatures();
            var t2IndexSigs = t2.getIndexSignatures();

            if (!this.signatureGroupsAreIdentical(t1CallSigs, t2CallSigs)) {
                this.identicalCache[comboId] = undefined;
                return false;
            }

            if (!this.signatureGroupsAreIdentical(t1ConstructSigs, t2ConstructSigs)) {
                this.identicalCache[comboId] = undefined;
                return false;
            }

            if (!this.signatureGroupsAreIdentical(t1IndexSigs, t2IndexSigs)) {
                this.identicalCache[comboId] = undefined;
                return false;
            }

            this.identicalCache[comboId] = true;
            return true;
        }

        public signatureGroupsAreIdentical(sg1: PullSignatureSymbol[], sg2: PullSignatureSymbol[]) {

            // covers the null case
            if (sg1 == sg2) {
                return true;
            }

            // covers the mixed-null case
            if (!sg1 || !sg2) {
                return false;
            }

            if (sg1.length != sg2.length) {
                return false;
            }

            var sig1: PullSignatureSymbol = null;
            var sig2: PullSignatureSymbol = null;
            var sigsMatch = false;

            // The signatures in the signature group may not be ordered...
            // REVIEW: Should definition signatures be required to be identical as well?
            for (var iSig1 = 0; iSig1 < sg1.length; iSig1++) {
                sig1 = sg1[iSig1];

                for (var iSig2 = 0; iSig2 < sg2.length; iSig2++) {
                    sig2 = sg2[iSig2];

                    if (this.signaturesAreIdentical(sig1, sig2)) {
                        sigsMatch = true;
                        break;
                    }
                }

                if (sigsMatch) {
                    sigsMatch = false;
                    continue;
                }

                // no match found for a specific signature
                return false;
            }

            return true;
        }

        public signaturesAreIdentical(s1: PullSignatureSymbol, s2: PullSignatureSymbol) {

            if (s1.hasVariableParamList() != s2.hasVariableParamList()) {
                return false;
            }

            if (s1.getNonOptionalParameterCount() != s2.getNonOptionalParameterCount()) {
                return false;
            }

            var s1Params = s1.getParameters();
            var s2Params = s2.getParameters();

            if (s1Params.length != s2Params.length) {
                return false;
            }

            if (!this.typesAreIdentical(s1.getReturnType(), s2.getReturnType())) {
                return false;
            }

            for (var iParam = 0; iParam < s1Params.length; iParam++) {
                if (!this.typesAreIdentical(s1Params[iParam].getType(), s2Params[iParam].getType())) {
                    return false;
                }
            }

            return true;
        }

        // Assignment Compatibility and Subtyping

        public sourceIsSubtypeOfTarget(source: PullTypeSymbol, target: PullTypeSymbol, comparisonInfo?: TypeComparisonInfo) { return this.sourceIsRelatableToTarget(source, target, false, this.subtypeCache, comparisonInfo); }
        public signatureGroupIsSubtypeOfTarget(sg1: PullSignatureSymbol[], sg2: PullSignatureSymbol[], comparisonInfo?: TypeComparisonInfo) { return this.signatureGroupIsRelatableToTarget(sg1, sg2, false, this.subtypeCache, comparisonInfo); }
        public signatureIsSubtypeOfTarget(s1: PullSignatureSymbol, s2: PullSignatureSymbol, comparisonInfo?: TypeComparisonInfo) { return this.signatureIsRelatableToTarget(s1, s2, false, this.subtypeCache, comparisonInfo); }

        public sourceIsAssignableToTarget(source: PullTypeSymbol, target: PullTypeSymbol, comparisonInfo?: TypeComparisonInfo) { return this.sourceIsRelatableToTarget(source, target, true, this.assignableCache, comparisonInfo); }
        public signatureGroupIsAssignableToTarget(sg1: PullSignatureSymbol[], sg2: PullSignatureSymbol[], comparisonInfo?: TypeComparisonInfo) { return this.signatureGroupIsRelatableToTarget(sg1, sg2, true, this.assignableCache, comparisonInfo); }
        public signatureIsAssignableToTarget(s1: PullSignatureSymbol, s2: PullSignatureSymbol, comparisonInfo?: TypeComparisonInfo) { return this.signatureIsRelatableToTarget(s1, s2, true, this.assignableCache, comparisonInfo); }

        public sourceIsRelatableToTarget(source: PullTypeSymbol, target: PullTypeSymbol, assignableTo: bool, comparisonCache: any, comparisonInfo: TypeComparisonInfo) {

            // REVIEW: Does this check even matter?
            //if (this.typesAreIdentical(source, target)) {
            //    return true;
            //}
            if (source == target) {
                return true;
            }

            // An error has already been reported in this case
            if (!(source && target)) {
                return true;
            }

            var comboId = (source.getSymbolID() << 16) | target.getSymbolID();

            // In the case of a 'false', we want to short-circuit a recursive typecheck
            if (comparisonCache[comboId] != undefined) {
                return true;
            }

            // this is one difference between subtyping and assignment compatibility
            if (assignableTo) {
                if (source == this.semanticInfoChain.anyTypeSymbol || target == this.semanticInfoChain.anyTypeSymbol) {
                    return true;
                }
            }
            else {
                // This is one difference between assignment compatibility and subtyping
                if (target == this.semanticInfoChain.anyTypeSymbol) {
                    return true;
                }
            }

            if (source == this.semanticInfoChain.undefinedTypeSymbol) {
                return true;
            }

            if ((source == this.semanticInfoChain.nullTypeSymbol) && (target != this.semanticInfoChain.undefinedTypeSymbol && target != this.semanticInfoChain.voidTypeSymbol)) {
                return true;
            }

            // REVIEW: enum types aren't explicitly covered in the spec
            if (target == this.semanticInfoChain.numberTypeSymbol && (source.getKind() & DeclKind.Enum)) {
                return true;
            }
            if (source == this.semanticInfoChain.numberTypeSymbol && (target.getKind() & DeclKind.Enum)) {
                return true;
            }
            if ((source.getKind() & DeclKind.Enum) || (target.getKind() & DeclKind.Enum)) {
                return false;
            }

            if (source.isArray() || target.isArray()) {
                if (!(source.isArray() && target.isArray())) {
                    return false;
                }
                comparisonCache[comboId] = false;
                var ret = this.sourceIsRelatableToTarget(source.getElementType(), target.getElementType(), assignableTo, comparisonCache, comparisonInfo);
                if (ret) {
                    comparisonCache[comboId] = true;
                }
                else {
                    comparisonCache[comboId] = undefined;
                }

                return ret;
            }

            // this check ensures that we only operate on object types from this point forward,
            // since the checks involving primitives occurred above
            if (source.isPrimitive() && target.isPrimitive()) {

                // we already know that they're not the same, and that neither is 'any'
                return false;
            }
            else if (source.isPrimitive() != target.isPrimitive()) {

                if (!target.isPrimitive()) {
                    if (source == this.semanticInfoChain.numberTypeSymbol && this.cachedNumberInterfaceType) {
                        source = this.cachedNumberInterfaceType;
                    }
                    else if (source == this.semanticInfoChain.stringTypeSymbol && this.cachedStringInterfaceType) {
                        source = this.cachedStringInterfaceType;
                    }
                    else if (source == this.semanticInfoChain.boolTypeSymbol && this.cachedBooleanInterfaceType) {
                        source = this.cachedBooleanInterfaceType;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }

            comparisonCache[comboId] = false;

            if (source.hasBase(target)) {
                comparisonCache[comboId] = true;
                return true;
            }

            if (this.cachedObjectInterfaceType && target == this.cachedObjectInterfaceType) {
                return true;
            }

            if (this.cachedFunctionInterfaceType && (source.getCallSignatures().length || source.getConstructSignatures().length) && target == this.cachedFunctionInterfaceType) {
                return true;
            }

            // REVIEW: We should perhaps do this, though it wouldn't be quite right without generics support
            //if (this.typeFlow.arrayInterfaceType && (source.index) && target == this.typeFlow.arrayInterfaceType) {
            //    return true;
            //}

            // At this point, if the target is a class, but not the source or a parent of the source, bail
            if (target.hasBrand()) {
                comparisonCache[comboId] = undefined;
                return false;
            }

            if (target.hasMembers() && source.hasMembers()) {
                var mProps = target.getMembers();
                var mProp: PullSymbol = null;
                var nProp: PullSymbol = null;
                var mPropType: PullTypeSymbol = null;
                var nPropType: PullTypeSymbol = null;

                for (var iMProp = 0; iMProp < mProps.length; iMProp++) {

                    mProp = mProps[iMProp];
                    nProp = source.getMemberByName(mProp.getName());

                    // PULLTODO:
                    // methods do not have the "arguments" field
                    //if (mProp.getName() == "arguments" &&
                    //    this.cachedIArgumentsInterfaceType &&
                    //    (this.typeFlow.iargumentsInterfaceType.symbol.flags & SymbolFlags.CompilerGenerated) &&
                    //    mProp.kind() == SymbolKind.Variable &&
                    //    (<VariableSymbol>mProp).variable.typeLink.type == this.typeFlow.iargumentsInterfaceType) {
                    //    continue;
                    //}

                    if (!mProp.isResolved()) {
                        this.resolveDeclaredSymbol(mProp);
                    }

                    mPropType = mProp.getType();

                    if (!nProp) {
                        // If it's not present on the type in question, look for the property on 'Object'
                        if (this.cachedObjectInterfaceType) {
                            nProp = this.cachedObjectInterfaceType.getMemberByName(mProp.getName());
                        }

                        if (!nProp) {
                            // Now, the property was not found on Object, but the type in question is a function, look
                            // for it on function
                            if (this.cachedFunctionInterfaceType && (mPropType.getCallSignatures().length || mPropType.getConstructSignatures().length)) {
                                nProp = this.cachedFunctionInterfaceType.getMemberByName(mProp.getName());
                            }

                            // finally, check to see if the property is optional
                            if (!nProp) {
                                if (!(mProp.getIsOptional())) {
                                    comparisonCache[comboId] = undefined;
                                    if (comparisonInfo) { // only surface the first error
                                        comparisonInfo.flags |= TypeRelationshipFlags.RequiredPropertyIsMissing;
                                        comparisonInfo.addMessageToFront("Type '" + source.getName() + "' is missing property '" + mProp.getName() + "' from type '" + target.getName() + "'");
                                    }
                                    return false;
                                }
                                else {
                                    continue;
                                }
                            }
                        }
                    }

                    if (!nProp.isResolved()) {
                        this.resolveDeclaredSymbol(nProp);
                    }


                    nPropType = nProp.getType();

                    // catch the mutually recursive or cached cases
                    if (mPropType && nPropType && (comparisonCache[(nPropType.getSymbolID() << 16) | mPropType.getSymbolID()] != undefined)) {
                        continue;
                    }

                    if (!this.sourceIsRelatableToTarget(nPropType, mPropType, assignableTo, comparisonCache, comparisonInfo)) {
                        comparisonCache[comboId] = undefined;
                        if (comparisonInfo) { // only surface the first error
                            comparisonInfo.flags |= TypeRelationshipFlags.IncompatiblePropertyTypes;
                            comparisonInfo.addMessageToFront("Types of property '" + mProp.getName() + "' of types '" + source.getName() + "' and '" + target.getName() + "' are incompatible");
                        }
                        return false;
                    }
                }
            }

            var sourceCallSigs = source.getCallSignatures();
            var targetCallSigs = target.getCallSignatures();

            var sourceConstructSigs = source.getConstructSignatures();
            var targetConstructSigs = target.getConstructSignatures();

            var sourceIndexSigs = source.getIndexSignatures();
            var targetIndexSigs = target.getIndexSignatures();

            // check signature groups
            if (sourceCallSigs.length || targetCallSigs.length) {
                if (!this.signatureGroupIsRelatableToTarget(sourceCallSigs, targetCallSigs, assignableTo, comparisonCache, comparisonInfo)) {
                    if (comparisonInfo) {
                        if (sourceCallSigs.length && targetCallSigs.length) {
                            comparisonInfo.addMessageToFront("Call signatures of types '" + source.getName() + "' and '" + target.getName() + "' are incompatible");
                        }
                        else {
                            var hasSig = targetCallSigs.length ? target.getName() : source.getName();
                            var lacksSig = !targetCallSigs.length ? target.getName() : source.getName();
                            comparisonInfo.setMessage("Type '" + hasSig + "' requires a call signature, but Type '" + lacksSig + "' lacks one");
                        }
                        comparisonInfo.flags |= TypeRelationshipFlags.IncompatibleSignatures;
                    }
                    comparisonCache[comboId] = undefined;
                    return false;
                }
            }

            if (sourceConstructSigs.length || targetConstructSigs.length) {
                if (!this.signatureGroupIsRelatableToTarget(sourceConstructSigs, targetConstructSigs, assignableTo, comparisonCache, comparisonInfo)) {
                    if (comparisonInfo) {
                        if (sourceConstructSigs.length && targetConstructSigs.length) {
                            comparisonInfo.addMessageToFront("Construct signatures of types '" + source.getName() + "' and '" + target.getName() + "' are incompatible");
                        }
                        else {
                            var hasSig = targetConstructSigs.length ? target.getName() : source.getName();
                            var lacksSig = !targetConstructSigs.length ? target.getName() : source.getName();
                            comparisonInfo.setMessage("Type '" + hasSig + "' requires a construct signature, but Type '" + lacksSig + "' lacks one");
                        }
                        comparisonInfo.flags |= TypeRelationshipFlags.IncompatibleSignatures;
                    }
                    comparisonCache[comboId] = undefined;
                    return false;
                }
            }

            if (targetIndexSigs.length) {
                var targetIndex = !targetIndexSigs.length && this.cachedObjectInterfaceType ? this.cachedObjectInterfaceType.getIndexSignatures() : targetIndexSigs;
                var sourceIndex = !sourceIndexSigs.length && this.cachedObjectInterfaceType ? this.cachedObjectInterfaceType.getIndexSignatures() : sourceIndexSigs;

                if (!this.signatureGroupIsRelatableToTarget(sourceIndex, targetIndex, assignableTo, comparisonCache, comparisonInfo)) {
                    if (comparisonInfo) {
                        comparisonInfo.addMessageToFront("Index signatures of types '" + source.getName() + "' and '" + target.getName() + "' are incompatible");
                        comparisonInfo.flags |= TypeRelationshipFlags.IncompatibleSignatures;
                    }
                    comparisonCache[comboId] = undefined;
                    return false;
                }
            }

            comparisonCache[comboId] = true;
            return true;
        }

        // REVIEW: TypeChanges: Return an error context object so the user can get better diagnostic info
        public signatureGroupIsRelatableToTarget(sourceSG: PullSignatureSymbol[], targetSG: PullSignatureSymbol[], assignableTo: bool, comparisonCache: any, comparisonInfo?: TypeComparisonInfo) {
            if (sourceSG == targetSG) {
                return true;
            }

            if (!(sourceSG && targetSG)) {
                return false;
            }

            var mSig: PullSignatureSymbol = null;
            var nSig: PullSignatureSymbol = null;
            var foundMatch = false;

            for (var iMSig = 0; iMSig < targetSG.length; iMSig++) {
                mSig = targetSG[iMSig];

                for (var iNSig = 0; iNSig < sourceSG.length; iNSig++) {
                    nSig = sourceSG[iNSig];
                    if (this.signatureIsRelatableToTarget(nSig, mSig, assignableTo, comparisonCache, comparisonInfo)) {
                        foundMatch = true;
                        break;
                    }
                }

                if (foundMatch) {
                    foundMatch = false;
                    continue;
                }
                return false;
            }

            return true;
        }

        public signatureIsRelatableToTarget(sourceSig: PullSignatureSymbol, targetSig: PullSignatureSymbol, assignableTo: bool, comparisonCache: any, comparisonInfo?: TypeComparisonInfo) {

            var sourceParameters = sourceSig.getParameters();
            var targetParameters = targetSig.getParameters();

            if (!sourceParameters.length || !targetParameters.length) {
                return false;
            }

            var targetVarArgCount = targetSig.hasVariableParamList() ? targetSig.getNonOptionalParameterCount() - 1 : targetSig.getNonOptionalParameterCount();
            var sourceVarArgCount = sourceSig.hasVariableParamList() ? sourceSig.getNonOptionalParameterCount() - 1 : sourceSig.getNonOptionalParameterCount();

            if (sourceVarArgCount > targetVarArgCount && !targetSig.hasVariableParamList()) {
                if (comparisonInfo) {
                    comparisonInfo.flags |= TypeRelationshipFlags.SourceSignatureHasTooManyParameters;
                    comparisonInfo.addMessageToFront("Call signature expects " + targetVarArgCount + " or fewer parameters");
                }
                return false;
            }

            var sourceReturnType = sourceSig.getReturnType();
            var targetReturnType = targetSig.getReturnType();

            if (targetReturnType != this.semanticInfoChain.voidTypeSymbol) {
                if (!this.sourceIsRelatableToTarget(sourceReturnType, targetReturnType, assignableTo, comparisonCache, comparisonInfo)) {
                    if (comparisonInfo) {
                        comparisonInfo.flags |= TypeRelationshipFlags.IncompatibleReturnTypes;
                        // No need to print this one here - it's printed as part of the signature error in sourceIsRelatableToTarget
                        //comparisonInfo.addMessageToFront("Incompatible return types: '" + sourceReturnType.getTypeName() + "' and '" + targetReturnType.getTypeName() + "'");
                    }
                    return false;
                }
            }

            var len = (sourceVarArgCount < targetVarArgCount && sourceSig.hasVariableParamList()) ? targetVarArgCount : sourceVarArgCount;
            var sourceParamType: PullTypeSymbol = null;
            var targetParamType: PullTypeSymbol = null;
            var sourceParamName = "";
            var targetParamName = "";

            for (var iSource = 0, iTarget = 0; iSource < len; iSource++, iTarget++) {

                if (!sourceSig.hasVariableParamList || iSource < sourceVarArgCount) {
                    sourceParamType = sourceParameters[iSource].getType();
                    sourceParamName = sourceParameters[iSource].getName();
                }
                else if (iSource == sourceVarArgCount) {
                    sourceParamType = sourceParameters[iSource].getType();
                    if (sourceParamType.isArray()) {
                        sourceParamType = sourceParamType.getElementType();
                    }
                    sourceParamName = sourceParameters[iSource].getName();
                }

                if (iTarget < targetParameters.length && iTarget < targetVarArgCount) {
                    targetParamType = targetParameters[iTarget].getType(); 
                    targetParamName = targetParameters[iTarget].getName();
                }
                else if (targetSig.hasVariableParamList && iTarget == targetVarArgCount) {
                    targetParamType = targetParameters[iTarget].getType(); 
                    if (targetParamType.isArray()) {
                        targetParamType = targetParamType.getElementType();
                    }
                    targetParamName = targetParameters[iTarget].getName();
                }

                if (!(this.sourceIsRelatableToTarget(sourceParamType, targetParamType, assignableTo, comparisonCache, comparisonInfo) ||
                        this.sourceIsRelatableToTarget(targetParamType, sourceParamType, assignableTo, comparisonCache, comparisonInfo))) {

                    if (comparisonInfo) {
                        comparisonInfo.flags |= TypeRelationshipFlags.IncompatibleParameterTypes;
                    }
                    return false;
                }
            }
            return true;
        }
    }
}