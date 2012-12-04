// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='typescript.ts' />


module TypeScript {

    class PullTypeResolver {

        // a map of symbol id's to the corresponding symbol's enclosing symbol
        private enclosingSymbolCache = <any>{};

        constructor (private semanticInfoChain: SemanticInfoChain, private unitPath: string) { }

        public getUnitPath() { return this.unitPath; }

        public setUnitPath() { return this.unitPath; }

        private getDeclForAST(ast: AST, unitPath?: string) {
            return this.semanticInfoChain.getDeclForAST(ast, unitPath ? unitPath : this.unitPath);
        }

        // returns a list of decls leading up to decl, inclusive
        public getPathToDecl(decl: PullDecl): PullDecl[] {
            var searchDecls = this.semanticInfoChain.getUnit(decl.getScriptName()).getTopLevelDecls();
            var decls: PullDecl[] = [];
            var spanToFind = decl.getSpan();
            var candidateSpan: ASTSpan = null;

            while (true) {
                // Of the top-level decls, find the one to search off of
                for (var i = 0; i < searchDecls.length; i++) {
                    candidateSpan = searchDecls[i].getSpan();

                    if (spanToFind.minChar >= spanToFind.minChar && spanToFind.limChar <= spanToFind.limChar) {
                        decls[decls.length] = searchDecls[i];
                        searchDecls = searchDecls[i].getChildDecls();
                        break;
                    }
                }

                if (decls[decls.length] == decl) {
                    break;
                }
            }

            return decls;
        }

        public getEnclosingDecl(decl: PullDecl): PullDecl {
            var declPath = this.getPathToDecl(decl);

            if (declPath.length > 1) {
                return declPath[declPath.length - 2];
            }

            return null;
        }

        public getEnclosingSymbol(symbol: PullSymbol): PullSymbol {
            
            var enclosingSymbol: PullSymbol = this.enclosingSymbolCache[symbol.getSymbolID().toString()];

            if (!enclosingSymbol) {
                var links = symbol.findOutgoingLinks(link => link.kind == SymbolLinkKind.ContainedBy);

                if (links.length) {
                    enclosingSymbol = links[0].end;
                    this.enclosingSymbolCache[symbol.getSymbolID().toString()] = enclosingSymbol;
                }
            }

            return enclosingSymbol;
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
                contextSymbolPath[contextSymbolPath.length] = contextDeclPath[i].getDeclName();
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

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Declaration Resolution
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

        //
        // Resolve a module declaration
        //
        // The module and its members are pre-bound, so no further resolution is necessary
        //
        public resolveModuleDeclaration(ast: AST) {
            var decl: PullDecl = this.getDeclForAST(ast);
            var declSymbol = decl.getSymbol();

            return declSymbol;
        }

        //
        // Resolve a class declaration
        //
        // A class's implements and extends lists are not pre-bound, so they must be bound here
        // Once bound, we can add the parent type's members to the class
        //
        public resolveClassDeclaration(classDeclAST: NamedType) {
            var classDecl: PullDecl = this.getDeclForAST(classDeclAST);
            var enclosingDecl = this.getEnclosingDecl(classDecl);
            var classDeclSymbol = classDecl.getSymbol();
            
            if (classDeclAST.extendsList) {
                for (var i = 0; i < classDeclAST.extendsList.members.length; i++) {
                    this.resolveTypeReference(new TypeReference(classDeclAST.extendsList.members[i], 0), enclosingDecl);
                }
            }

            if (classDeclAST.implementsList) {
                for (var i = 0; i < classDeclAST.implementsList.members.length; i++) {
                    this.resolveTypeReference(new TypeReference(classDeclAST.implementsList.members[i], 0), enclosingDecl);
                }
            }

            return classDeclSymbol;
        }

        public resolveInterfaceDeclaration(interfaceDeclAST: NamedType) {
            var interfaceDecl: PullDecl = this.getDeclForAST(interfaceDeclAST);
            var enclosingDecl = this.getEnclosingDecl(interfaceDecl);
            var interfaceDeclSymbol = interfaceDecl.getSymbol();
            
            if (interfaceDeclAST.extendsList) {
                for (var i = 0; i < interfaceDeclAST.extendsList.members.length; i++) {
                    this.resolveTypeReference(new TypeReference(interfaceDeclAST.extendsList.members[i], 0), enclosingDecl);
                }
            }

            if (interfaceDeclAST.implementsList) {
                for (var i = 0; i < interfaceDeclAST.implementsList.members.length; i++) {
                    this.resolveTypeReference(new TypeReference(interfaceDeclAST.implementsList.members[i], 0), enclosingDecl);
                }
            }

            return interfaceDeclSymbol;
        }

        public resolveFunctionTypeSignature(funcDecl: FuncDecl, enclosingDecl : PullDecl): PullSymbol {

            var funcName = funcDecl.name ? funcDecl.name.text : funcDecl.hint;

            var isConstructor = hasFlag(funcDecl.fncFlags,FncFlags.ConstructMember);
            var isIndex = hasFlag(funcDecl.fncFlags,FncFlags.IndexerMember);
            var sigDeclKind = isConstructor ? DeclKind.ConstructSignature :
                            isIndex ? DeclKind.IndexSignature : DeclKind.CallSignature;
            
            var funcDeclSymbol = new PullSymbol(funcName, DeclKind.Function);
            var signature = new PullSymbol(null, sigDeclKind);

            funcDeclSymbol.addOutgoingLink(signature, SymbolLinkKind.CallSignature);

            // resolve the return type annotation
            if (funcDecl.returnTypeAnnotation) {
                var returnTypeRef = <TypeReference>funcDecl.returnTypeAnnotation;
                var returnTypeSymbol = this.resolveTypeReference(returnTypeRef, enclosingDecl);

                signature.addOutgoingLink(returnTypeSymbol, SymbolLinkKind.ReturnType);
            }
            else {
                signature.addOutgoingLink(this.semanticInfoChain.anyTypeSymbol, SymbolLinkKind.ReturnType);
            }

            // link parameters and resolve their annotations
            if (funcDecl.args) {
                for (var i = 0; i < funcDecl.args.members.length; i++) {
                    this.resolveFunctionTypeSignatureParameters(<ArgDecl>funcDecl.args.members[i], signature, enclosingDecl);
                }
            }

            return funcDeclSymbol;
        }

        public resolveFunctionTypeSignatureParameters(argDecl: ArgDecl, signatureSymbol: PullSymbol, enclosingDecl: PullDecl) {
            var paramSymbol = new PullSymbol(argDecl.id.actualText, DeclKind.Argument);

            signatureSymbol.addOutgoingLink(paramSymbol, SymbolLinkKind.Parameter);

            if (argDecl.typeExpr) {
                var typeRef = this.resolveTypeReference(<TypeReference>argDecl.typeExpr, enclosingDecl);
                paramSymbol.addOutgoingLink(typeRef, SymbolLinkKind.TypedAs);
            }
            else {
                paramSymbol.addOutgoingLink(this.semanticInfoChain.anyTypeSymbol, SymbolLinkKind.TypedAs);
            }
        }

        public resolveInterfaceTypeReference(interfaceDeclAST: NamedType, enclosingDecl: PullDecl): PullSymbol {
            var interfaceSymbol = new PullSymbol("", DeclKind.Interface);
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
                        interfaceSymbol.addOutgoingLink(memberSymbol, SymbolLinkKind.PublicProperty);
                        memberSymbol.addOutgoingLink(interfaceSymbol, SymbolLinkKind.ContainedBy);
                    }
                    else if (typeMembers.members[i].nodeType == NodeType.FuncDecl) {
                        memberSymbol = this.resolveFunctionTypeSignature(<FuncDecl>typeMembers.members[i], enclosingDecl);
                        interfaceSymbol.addOutgoingLink(memberSymbol, SymbolLinkKind.PublicProperty);
                        memberSymbol.addOutgoingLink(interfaceSymbol, SymbolLinkKind.ContainedBy);
                    }

                }
            }

            return interfaceSymbol;
        }

        // PULLTODO: Watch for infinite recursion when resloving mutually recursive types
        public resolveTypeReference(typeRef: TypeReference, enclosingDecl: PullDecl): PullSymbol {
            // the type reference can be
            // a name
            // a function
            // an interface
            // a dotted name
            // an array of any of the above

            if (!typeRef) {
                return;
            }

            var typeDeclSymbol: PullSymbol = null;

            // a name
            if (typeRef.term.nodeType == NodeType.Name) {
                var typeName = <Identifier>typeRef.term;
            
                typeDeclSymbol = this.findSymbolForPath([typeName.actualText], enclosingDecl, DeclKind.SomeType);

                if (!typeDeclSymbol) {
                    // PULLTODOERROR
                    CompilerDiagnostics.Alert("Could not find type '" + typeName.actualText + "'");
                    return null;
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
                typeDeclSymbol = this.findSymbolForPath(dottedNamePath, enclosingDecl, DeclKind.SomeType);

                if (!typeDeclSymbol) {
                    CompilerDiagnostics.Alert("Could not find dotted type '" + lastTypeName + "'");
                    return null;
                }
            }

            if (!typeDeclSymbol) {
                CompilerDiagnostics.Alert("Couldn't bind to the type symbol before creating the array, for some reason");
                return null;
            }

            // an array of any of the above
            // PULLTODO: Arity > 1
            // PULLTODO: Specialize Array type for members
            if (typeRef.arrayCount) {
                var arraySymbol: PullSymbol = null;
                var arrayLinks = typeDeclSymbol.findIncomingLinks((psl: PullSymbolLink) => psl.kind == SymbolLinkKind.ArrayOf);

                if (arrayLinks.length) {
                    if (arrayLinks.length > 1) {
                        CompilerDiagnostics.Alert("For some reason, there's more than one array link for type '" + typeDeclSymbol.getName() + "'");
                    }
                    arraySymbol = arrayLinks[0].start;
                }
                else {
                    // first, look to see if there's already an array symbol for this type
                    arraySymbol = new PullSymbol(typeDeclSymbol.getName(), typeDeclSymbol.getKind() | DeclKind.Array);
                    arraySymbol.addOutgoingLink(typeDeclSymbol, SymbolLinkKind.ArrayOf);
                }
            
                typeDeclSymbol = arraySymbol;
            }

            return typeDeclSymbol;
        }

        public resolveVariableDeclaration(varDecl: VarDecl, context: PullSymbolBindingContext): PullSymbol {        
      
            var decl: PullDecl = context.semanticInfo.getDeclForAST(varDecl);
            var declSymbol = decl.getSymbol();

            // Does this have a type expression? If so, that's the type
            if (varDecl.typeExpr) {
            }

            // Does it have an initializer? If so, typecheck and use that
            else if (varDecl.init) {
            }

            // Otherwise, it's of type 'any'
            else {

            }
        
            return null;
        }

        public resolveFunctionDeclaration(funcDeclAST: FuncDecl): PullSymbol {
      
            var funcDecl: PullDecl = this.getDeclForAST(funcDeclAST);

            var funcSymbol = funcDecl.getSymbol();

            // resolve parameter type annotations
            // If they have no type annotations, type them to "any"
            if (funcDeclAST.args) {
                for (var i = 0; i < funcDeclAST.args.members.length; i++) {
                    //resolveVariableDeclaration(funcDecl.args.members[i], null, context);
                }
            }

            // resolve the return type annotation
            if (funcDeclAST.returnTypeAnnotation) {
                var returnTypeRef = <TypeReference>funcDeclAST.returnTypeAnnotation;
                //this.resolveTypeReference(returnTypeRef, funcSymbol, SymbolLinkKind.ReturnType);
            }

            // if there's no return-type annotation, we need to typecheck the return statements in the
            // function's body so that we can figure out the return type
            else {

                // gather return statements

                // combine return expression types for best common type

            }
        
            return null;
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

        public resolveFunctionExpression(funcDeclAST: FuncDecl): PullSymbol {
            return null;
        }

        public resolveReturnExpression(returnStatement: ReturnStatement, enclosingFuncDecl: FuncDecl): PullSymbol {
            return null;
        }
        
        // PULLTODORESOLUTION: Identifiers
        // PULLTODORESOLUTION: Dotted identifiers
        // PULLTODORESOLUTION: Object literals
        // PULLTODORESOLUTION: Type Assertions
        // PULLTODORESOLUTION: Unary Expressions
        // PULLTODORESOLUTION: Binary expressions
        // PULLTODORESOLUTION: Call expressions
        // PULLTODORESOLUTION: Conditional expressions
        // PULLTODORESOLUTION: Literals
        // PULLTODORESOLUTION: Throw
        
    }














}