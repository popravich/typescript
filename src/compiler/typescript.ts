// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='diagnostics.ts' />
///<reference path='flags.ts' />
///<reference path='nodeTypes.ts' />
///<reference path='hashTable.ts' />
///<reference path='ast.ts' />
///<reference path='astWalker.ts' />
///<reference path='astWalkerCallback.ts' />
///<reference path='astPath.ts' />
///<reference path='astLogger.ts' />
///<reference path='binder.ts' />
///<reference path='base64.ts' />
///<reference path='sourceMapping.ts' />
///<reference path='emitter.ts' />
///<reference path='errorReporter.ts' />
///<reference path='parser.ts' />
///<reference path='printContext.ts' />
///<reference path='scanner.ts' />
///<reference path='scopeAssignment.ts' />
///<reference path='scopeWalk.ts' />
///<reference path='signatures.ts' />
///<reference path='symbols.ts' />
///<reference path='symbolScope.ts' />
///<reference path='tokens.ts' />
///<reference path='typeChecker.ts' />
///<reference path='typeCollection.ts' />
///<reference path='typeFlow.ts' />
///<reference path='types.ts' />
///<reference path='pathUtils.ts' />
///<reference path='referenceResolution.ts' />
///<reference path='precompile.ts' />
///<reference path='incrementalParser.ts' />
///<reference path='declarationEmitter.ts' />
///<reference path='dataMap.ts' />
///<reference path='pullDecls.ts' />
///<reference path='pullSymbols.ts' />
///<reference path='pullSymbolBindingContext.ts' />
///<reference path='pullTypeResolution.ts' />
///<reference path='pullTypeChecker.ts' />
///<reference path='pullDeclDiffer.ts' />
///<reference path='pullSemanticInfo.ts' />
///<reference path='pullDeclCollection.ts' />
///<reference path='pullBinder.ts' />
///<reference path='pullSymbolGraph.ts' />

module TypeScript {

    export var nASTs = 0;
    export var nSymbols = 0;
    export var nTypes = 0;
    export var nFieldSymbols = 0;
    export var nParameterSymbols = 0;
    export var nTypeSymbols = 0;
    export var nInferenceSymbols = 0;
    export var nVariableSymbols = 0;
    export var nSignatures = 0;
    export var nSignatureGroups = 0;
    export var nScopes = 0;
    export var nAggregateScopes = 0;
    export var nSymbolSearches = 0;
    export var nSymbolFinds = 0;
    export var nSymbolAmbientFinds = 0;
    export var nSymbolEnters = 0;
    export var nSymbolLocalFinds = 0;
    export var nTypeGets = 0;
    export var nTypeSets = 0;

    export enum UpdateUnitKind {
        Unknown,
        NoEdits,
        EditsInsideSingleScope,
    }

    export class ScriptEditRange {

        constructor (public minChar: number,
                     public limChar: number,
                     public delta: number) { }

        static unknown(): ScriptEditRange {
            return new ScriptEditRange(-1, -1, -1);
        }

        public isUnknown() {
            return this.minChar === -1 && this.limChar === -1 && this.delta === -1;
        }

        public containsPosition(pos: number) {
            return (this.minChar <= pos && pos < this.limChar)
                || (this.minChar <= pos && pos < this.limChar + this.delta);
        }

        public toString(): string {
            return "editRange(minChar=" + this.minChar + ", limChar=" + this.limChar + ", delta=" + this.delta + ")";
        }
    }

    export class UpdateUnitResult {

        constructor (public kind: UpdateUnitKind, public unitIndex: number, public script1: Script, public script2: Script) { }

        public scope1: AST = null;
        public scope2: AST = null;
        public editRange: ScriptEditRange = null;
        public parseErrors: ErrorEntry[] = [];

        static noEdits(unitIndex: number) {
            return new UpdateUnitResult(UpdateUnitKind.NoEdits, unitIndex, null, null);
        }

        static unknownEdits(script1: Script, script2: Script, parseErrors: ErrorEntry[]) {
            var result = new UpdateUnitResult(UpdateUnitKind.Unknown, script1.locationInfo.unitIndex, script1, script2);
            result.parseErrors = parseErrors;
            return result;
        }

        static singleScopeEdits(script1: Script, script2: Script, scope1: AST, scope2: AST, editRange: ScriptEditRange, parseErrors: ErrorEntry[]) {
            var result = new UpdateUnitResult(UpdateUnitKind.EditsInsideSingleScope, script1.locationInfo.unitIndex, script1, script2);
            result.scope1 = scope1;
            result.scope2 = scope2;
            result.editRange = editRange;
            result.parseErrors = parseErrors;
            return result;
        }
    }

    export class ErrorEntry {
        constructor (public unitIndex: number,
                    public minChar: number,
                    public limChar: number,
                    public message: string) { }
    }

    export var defaultSettings = new CompilationSettings();

    export class TypeScriptCompiler {
        public parser = new Parser();
        public typeChecker: TypeChecker;
        public typeFlow: TypeFlow = null;
        public scripts = new ASTList();
        public units: LocationInfo[] = new LocationInfo[];
        public errorReporter: ErrorReporter;
        public pullTypeChecker: PullTypeChecker = null;
        public semanticInfoChain: SemanticInfoChain = null;

        public persistentTypeState: PersistentGlobalTypeState;


        public emitSettings: { minWhitespace: bool; propagateConstants: bool; emitComments: bool; path: string; createFile: (path: string) =>ITextWriter; outputMany: bool; };

        constructor (public errorOutput: ITextWriter, public logger: ILogger = new NullLogger(), public settings: CompilationSettings = defaultSettings) {
            this.errorReporter = new ErrorReporter(this.errorOutput);
            this.persistentTypeState = new PersistentGlobalTypeState(this.errorReporter);
            this.errorReporter.parser = this.parser;
            this.initTypeChecker(this.errorOutput);

            this.parser.style_requireSemi = this.settings.styleSettings.requireSemi;
            this.parser.style_funcInLoop = this.settings.styleSettings.funcInLoop;
            this.parser.inferPropertiesFromThisAssignment = this.settings.inferPropertiesFromThisAssignment;
            this.emitSettings = { minWhitespace: this.settings.minWhitespace, propagateConstants: this.settings.propagateConstants, emitComments: this.settings.emitComments, path: this.settings.outputFileName, createFile: null, outputMany: this.settings.outputMany };

            codeGenTarget = settings.codeGenTarget;
        }

        public timeFunction(funcDescription: string, func: () =>any): any {
            return TypeScript.timeFunction(this.logger, funcDescription, func);
        }

        public initTypeChecker(errorOutput: ITextWriter) {
            // The initial "refresh" initializes the persistent type state
            this.persistentTypeState.refreshPersistentState();
            this.typeChecker = new TypeChecker(this.persistentTypeState);
            this.typeChecker.errorReporter = this.errorReporter;

            // REVIEW: These properties should be moved out of the typeCheck object
            // ideally, CF should be a separate pass, independent of control flow
            this.typeChecker.checkControlFlow = this.settings.controlFlow;
            this.typeChecker.checkControlFlowUseDef = this.settings.controlFlowUseDef;
            this.typeChecker.printControlFlowGraph = this.settings.printControlFlow;

            this.typeChecker.errorsOnWith = this.settings.errorOnWith;
            this.typeChecker.styleSettings = this.settings.styleSettings;
            this.typeChecker.canCallDefinitionSignature = this.settings.canCallDefinitionSignature;

            this.errorReporter.checker = this.typeChecker;
            this.setErrorOutput(this.errorOutput);
        }

        public setErrorOutput(outerr) {
            this.errorOutput = outerr;
            this.errorReporter.setErrOut(outerr);
            this.parser.outfile = outerr;
        }

        public emitCommentsToOutput() {
            this.emitSettings = { minWhitespace: this.settings.minWhitespace, propagateConstants: this.settings.propagateConstants, emitComments: this.settings.emitComments, path: this.settings.outputFileName, createFile: null, outputMany: this.settings.outputMany };
        }

        public setErrorCallback(fn: (minChar: number, charLen: number, message: string,
            unitIndex: number) =>void ) {
            this.parser.errorCallback = fn;
        }

        public updateUnit(prog: string, filename: string, setRecovery: bool) {
            return this.updateSourceUnit(new StringSourceText(prog), filename, setRecovery);
        }

        public updateSourceUnit(sourceText: ISourceText, filename: string, setRecovery: bool): bool {
            return this.timeFunction("updateSourceUnit(" + filename + ")", () => {
                var updateResult = this.partialUpdateUnit(sourceText, filename, setRecovery);
                return this.applyUpdateResult(updateResult);
            });
        }

        // Apply changes to compiler state.
        // Return "false" if the change is empty and nothing was updated.
        public applyUpdateResult(updateResult: UpdateUnitResult): bool {
            switch (updateResult.kind) {
                case UpdateUnitKind.NoEdits:
                    return false;

                case UpdateUnitKind.Unknown:
                    this.scripts.members[updateResult.unitIndex] = updateResult.script2;
                    this.units[updateResult.unitIndex] = updateResult.script2.locationInfo;
                    for (var i = 0, len = updateResult.parseErrors.length; i < len; i++) {
                        var e = updateResult.parseErrors[i];
                        if (this.parser.errorCallback) {
                            this.parser.errorCallback(e.minChar, e.limChar - e.minChar, e.message, e.unitIndex);
                        }
                    }
                    return true;

                case UpdateUnitKind.EditsInsideSingleScope:
                    new IncrementalParser(this.logger).mergeTrees(updateResult);
                    return true;
            }
        }

        public partialUpdateUnit(sourceText: ISourceText, filename: string, setRecovery: bool): UpdateUnitResult {
            return this.timeFunction("partialUpdateUnit(" + filename + ")", () => {
                for (var i = 0, len = this.units.length; i < len; i++) {
                    if (this.units[i].filename == filename) {
                        if ((<Script>this.scripts.members[i]).isResident) {
                            return UpdateUnitResult.noEdits(i);
                        }

                        if (setRecovery) {
                            this.parser.setErrorRecovery(null, 0, 0);
                        }

                        var updateResult: UpdateUnitResult;

                        // Capture parsing errors so that they are part of "updateResult"
                        var parseErrors: ErrorEntry[] = [];
                        var errorCapture = (minChar: number, charLen: number, message: string, unitIndex: number): void => {
                            parseErrors.push(new ErrorEntry(unitIndex, minChar, minChar + charLen, message));
                        };
                        var svErrorCallback = this.parser.errorCallback;
                        if (svErrorCallback)
                            this.parser.errorCallback = errorCapture;

                        var oldScript = <Script>this.scripts.members[i];
                        var newScript = this.parser.parse(sourceText, filename, i);

                        if (svErrorCallback)
                            this.parser.errorCallback = svErrorCallback;

                        updateResult = UpdateUnitResult.unknownEdits(oldScript, newScript, parseErrors);

                        return updateResult;
                    }
                }
                throw new Error("Unknown file \"" + filename + "\"");
            });
        }

        public pullUpdateUnit(sourceText: ISourceText, filename: string, setRecovery: bool): bool {
            return this.timeFunction("partialUpdateUnit(" + filename + ")", () => {
                for (var i = 0, len = this.units.length; i < len; i++) {
                    if (this.units[i].filename == filename) {

                        if (setRecovery) {
                            this.parser.setErrorRecovery(null, 0, 0);
                        }

                        var updateResult: UpdateUnitResult;

                        // Capture parsing errors so that they are part of "updateResult"
                        var parseErrors: ErrorEntry[] = [];
                        var errorCapture = (minChar: number, charLen: number, message: string, unitIndex: number): void => {
                            parseErrors.push(new ErrorEntry(unitIndex, minChar, minChar + charLen, message));
                        };
                        var svErrorCallback = this.parser.errorCallback;
                        if (svErrorCallback)
                            this.parser.errorCallback = errorCapture;

                        var oldScript = <Script>this.scripts.members[i];
                        var newScript = this.parser.parse(sourceText, filename, i);

                        if (svErrorCallback)
                            this.parser.errorCallback = svErrorCallback;

                        return this.pullUpdateScript(oldScript, newScript);
                    }
                }
                throw new Error("Unknown file \"" + filename + "\"");
            });
        }

        public addUnit(prog: string, filename: string, keepResident? = false, referencedFiles?: IFileReference[] = []): Script {
            return this.addSourceUnit(new StringSourceText(prog), filename, keepResident, referencedFiles);
        }

        public addSourceUnit(sourceText: ISourceText, filename: string, keepResident:bool, referencedFiles?: IFileReference[] = []): Script {
            return this.timeFunction("addSourceUnit(" + filename + ", " + keepResident + ")", () => {
                var script: Script = this.parser.parse(sourceText, filename, this.units.length, AllowedElements.Global);
                script.referencedFiles = referencedFiles;
                script.isResident = keepResident;
                var index = this.units.length;
                this.units[index] = script.locationInfo;
                
                if (!this.settings.usePull) {
                    this.persistentTypeState.setCollectionMode(keepResident ? TypeCheckCollectionMode.Resident : TypeCheckCollectionMode.Transient);
                    var preTime = new Date().getTime();
                    this.typeChecker.collectTypes(script);
                    var postTime = new Date().getTime();
                    this.totalCollectionTime = this.totalCollectionTime + (postTime - preTime);
                }
                
                this.scripts.append(script);
                return script
            });
        }

        public parseUnit(prog: string, filename: string) {
            return this.parseSourceUnit(new StringSourceText(prog), filename);
        }

        public totalCollectionTime = 0;

        public parseSourceUnit(sourceText: ISourceText, filename: string) {
            this.parser.setErrorRecovery(this.errorOutput, -1, -1);
            var script: Script = this.parser.parse(sourceText, filename, 0);

            var index = this.units.length;
            this.units[index] = script.locationInfo;
            this.typeChecker.collectTypes(script);
            this.scripts.append(script);
        }

        public typeCheck() {
            return this.timeFunction("typeCheck()", () => {
                var globaltcStart = new Date().getTime();
                var binder = new Binder(this.typeChecker);

                this.typeChecker.units = this.units;

                binder.bind(this.typeChecker.globalScope, this.typeChecker.globals);
                binder.bind(this.typeChecker.globalScope, this.typeChecker.ambientGlobals);
                binder.bind(this.typeChecker.globalScope, this.typeChecker.globalTypes);
                binder.bind(this.typeChecker.globalScope, this.typeChecker.ambientGlobalTypes);

                this.typeFlow = new TypeFlow(this.logger, this.typeChecker.globalScope, this.parser, this.typeChecker);

                var globalBindingEnd = new Date().getTime();
                var globalBindingTime = globalBindingEnd - globaltcStart;

                var i = 0;
                var script: Script = null;
                var len = this.scripts.members.length;

                this.persistentTypeState.setCollectionMode(TypeCheckCollectionMode.Resident);

                // first, typecheck resident "lib" scripts, if necessary
                var localtcStart = new Date().getTime();
                for (i = 0; i < len; i++) {
                    script = <Script>this.scripts.members[i];
                    if (!script.isResident || script.hasBeenTypeChecked) { continue; }

                    this.typeFlow.assignScopes(script);
                    this.typeFlow.initLibs();
                }

                for (i = 0; i < len; i++) {
                    script = <Script>this.scripts.members[i];
                    if (!script.isResident || script.hasBeenTypeChecked) { continue; }

                    this.typeFlow.typeCheck(script);
                    script.hasBeenTypeChecked = true;
                }

                // next typecheck scripts that may change
                this.persistentTypeState.setCollectionMode(TypeCheckCollectionMode.Transient);

                len = this.scripts.members.length;

                for (i = 0; i < len; i++) {
                    script = <Script>this.scripts.members[i];
                    if (script.isResident) { continue; }
                    this.typeFlow.assignScopes(script);
                    this.typeFlow.initLibs();
                }

                for (i = 0; i < len; i++) {
                    script = <Script>this.scripts.members[i];
                    if (script.isResident) { continue; }
                    this.typeFlow.typeCheck(script);
                }
                var globaltcEnd = new Date().getTime();

                CompilerDiagnostics.Alert("Total collection time: " + this.totalCollectionTime);
                CompilerDiagnostics.Alert("Total binding time: " + globalBindingTime);
                CompilerDiagnostics.Alert("Total binding and collection time: " + (this.totalCollectionTime + globalBindingTime));
                CompilerDiagnostics.Alert("Total resolution and checking time: " + (globaltcEnd - localtcStart));
                CompilerDiagnostics.Alert("Total typecheck time: " + (globaltcEnd - globaltcStart));
                CompilerDiagnostics.Alert("");

                return null;
            });
        }

        public cleanASTTypesForReTypeCheck(ast: AST) {
            function cleanASTType(ast: AST, parent: AST): AST {
                ast.setType(null);
                if (ast.nodeType == NodeType.VarDecl) {
                    var vardecl = <VarDecl>ast;
                    vardecl.sym = null;
                }
                else if (ast.nodeType == NodeType.ArgDecl) {
                    var argdecl = <ArgDecl>ast;
                    argdecl.sym = null;
                }
                else if (ast.nodeType == NodeType.Name) {
                    var name = <Identifier>ast;
                    name.sym = null;
                }
                else if (ast.nodeType == NodeType.FuncDecl) {
                    var funcdecl = <FuncDecl>ast;
                    funcdecl.signature = null;
                    funcdecl.freeVariables = new Symbol[]
                    funcdecl.symbols = null;
                    funcdecl.accessorSymbol = null;
                    funcdecl.scopeType = null;
                }
                else if (ast.nodeType == NodeType.Module) {
                    var modDecl = <ModuleDecl>ast;
                    modDecl.mod = null;
                }
                else if (ast.nodeType == NodeType.With) {
                    (<WithStatement>ast).withSym = null;
                }
                else if (ast.nodeType == NodeType.Catch) {
                    (<Catch>ast).containedScope = null;
                }
                return ast;
            }
            TypeScript.getAstWalkerFactory().walk(ast, cleanASTType);
        }

        public cleanTypesForReTypeCheck() {
            return this.timeFunction("cleanTypesForReTypeCheck()", () => {
                for (var i = 0, len = this.scripts.members.length; i < len; i++) {
                    var script = this.scripts.members[i];
                    if ((<Script>script).isResident) {
                        continue;
                    }
                    this.cleanASTTypesForReTypeCheck(script);
                    this.typeChecker.collectTypes(script);
                }

                return null;
            });
        }

        // Return "true" if the incremental typecheck was successful
        // Return "false" if incremental typecheck failed, requiring a full typecheck
        public attemptIncrementalTypeCheck(updateResult: TypeScript.UpdateUnitResult): bool {
            return this.timeFunction("attemptIncrementalTypeCheck()", () => {
                // updateResult.kind == editsInsideFunction
                // updateResult.scope1 == old function
                // updateResult.scope2 == new function
                //REVIEW: What about typecheck errors? How do we replace the old ones with the new ones?
                return false;
            });
        }

        public reTypeCheck() {
            return this.timeFunction("reTypeCheck()", () => {
                CompilerDiagnostics.analysisPass++;
                this.initTypeChecker(this.errorOutput);
                this.persistentTypeState.setCollectionMode(TypeCheckCollectionMode.Transient);
                this.cleanTypesForReTypeCheck();
                return this.typeCheck();
            });
        }

        public pullTypeCheck(refresh = false) {
            // create global decls
            // collect decls from files
            // walk scripts, pull-typechecking each
            if (!this.pullTypeChecker || refresh) {
                this.semanticInfoChain = new SemanticInfoChain();
                this.pullTypeChecker = new PullTypeChecker(this.semanticInfoChain);
            }

            var declCollectionContext: DeclCollectionContext = null;
            var pullSymbolCollectionContext: PullSymbolBindingContext = null;
            var semanticInfo: SemanticInfo = null;
            var i = 0;
            var skipFirst = (!this.settings.useDefaultLib ? 0 : 1);
            var findPullFile = this.settings.testPullWithFile != "";
            
            // create decls
            var createDeclsStartTime = new Date().getTime();

            for (; i < this.scripts.members.length; i++) {

                if (this.settings.testPull && i == skipFirst) {
                    continue;
                }

                semanticInfo = new SemanticInfo(this.units[i].filename);

                declCollectionContext = new DeclCollectionContext(semanticInfo);

                declCollectionContext.scriptName = this.units[i].filename;

                // create decls
                getAstWalkerFactory().walk(this.scripts.members[i], preCollectDecls, postCollectDecls, null, declCollectionContext);

                semanticInfo.addTopLevelDecl(declCollectionContext.getParent());

                this.semanticInfoChain.addUnit(semanticInfo);
            }

            var createDeclsEndTime = new Date().getTime();

            // bind declaration symbols
            var bindStartTime = new Date().getTime();

            var topLevelDecls: PullDecl[] = null;

            // start at '1', so as to skip binding for global primitives such as 'any'
            for (i = 1; i < this.semanticInfoChain.units.length; i++) {

                topLevelDecls = this.semanticInfoChain.units[i].getTopLevelDecls();

                pullSymbolCollectionContext = new PullSymbolBindingContext(this.semanticInfoChain, this.semanticInfoChain.units[i].getPath());

                for (var j = 0; j < topLevelDecls.length; j++) {

                    bindDeclSymbol(topLevelDecls[j], pullSymbolCollectionContext);

                }
            }

            var bindEndTime = new Date().getTime();
            var typeCheckStartTime = new Date().getTime();
            // typecheck
            for (i = 0; i < this.scripts.members.length; i++) {

                if (this.settings.testPull && i == skipFirst) {
                    continue;
                }

                this.pullTypeChecker.setUnit(this.units[i].filename);
                this.pullTypeChecker.resolver.resolveBoundDecls(this.semanticInfoChain.units[i > skipFirst ? i : i + 1].getTopLevelDecls()[0]);

                //this.pullTypeChecker.setUnit(this.units[i].filename);
                //getAstWalkerFactory().walk(this.scripts.members[i], prePullTypeCheck, null, null, this.pullTypeChecker);
            }
            var typeCheckEndTime = new Date().getTime();

            CompilerDiagnostics.Alert("Decl creation: " + (createDeclsEndTime - createDeclsStartTime));
            CompilerDiagnostics.Alert("Binding: " + (bindEndTime - bindStartTime));
            CompilerDiagnostics.Alert("    Time in findSymbol: " + time_in_findSymbol);
            CompilerDiagnostics.Alert("Type resolution: " + (typeCheckEndTime - typeCheckStartTime));
            CompilerDiagnostics.Alert("Total: " + (typeCheckEndTime - createDeclsStartTime));
            
            if (this.settings.testPull) {
                //var declDiffer = new PullDeclDiffer();
                
                //semanticInfo = new SemanticInfo(this.units[skipFirst].filename);

                //declCollectionContext = new DeclCollectionContext(semanticInfo);

                //declCollectionContext.scriptName = this.units[skipFirst].filename;

                //// create decls
                //getAstWalkerFactory().walk(this.scripts.members[skipFirst], preCollectDecls, postCollectDecls, null, declCollectionContext);

                // note that we don't decrement skipFirst, because we need to skip the globals that are added
                var oldIndex = skipFirst;

                if (findPullFile) {
                    for (var i = 0; i < this.units.length; i++) {
                        if (this.semanticInfoChain.units[i].getPath().indexOf(this.settings.testPullWithFile) != -1) {
                            oldIndex = i;
                            break;
                        }
                    }
                }

                this.pullUpdateScript(<Script>this.scripts.members[oldIndex], <Script>this.scripts.members[skipFirst]);

                //var oldTopLevelDecl = this.semanticInfoChain.units[oldIndex].getTopLevelDecls()[0];
                //var newTopLevelDecl = declCollectionContext.getParent();
                
                //semanticInfo.addTopLevelDecl(newTopLevelDecl);

                //var diffResults: PullDeclDiff[] = [];
                
                //var diffStartTime = new Date().getTime();
                //declDiffer.diffDecls(oldTopLevelDecl, newTopLevelDecl, diffResults);

                //var diffEndTime = new Date().getTime();
                //CompilerDiagnostics.Alert("Diff time: " + (diffEndTime - diffStartTime));

                //if (diffResults.length) {
                //    // replace the old semantic info
                //    this.semanticInfoChain.updateUnit(this.semanticInfoChain.units[skipFirst], semanticInfo);

                //    // re-bind
                //    var innerBindStartTime = new Date().getTime();

                //    topLevelDecls = semanticInfo.getTopLevelDecls();

                //    pullSymbolCollectionContext = new PullSymbolBindingContext(this.semanticInfoChain, semanticInfo.getPath());

                //    for (var i = 0; i < topLevelDecls.length; i++) {

                //        bindDeclSymbol(topLevelDecls[i], pullSymbolCollectionContext);

                //    }
                //    var innerBindEndTime = new Date().getTime();

                //    CompilerDiagnostics.Alert("Inner bind time: " + (innerBindEndTime - innerBindStartTime));
                    
                //    // propagate changes
                //    var graphUpdater = new PullSymbolGraphUpdater();
                //    var diff: PullDeclDiff;
                    
                //    var traceStartTime = new Date().getTime();
                //    for (var i = 0; i < diffResults.length; i++) {
                //        diff = diffResults[i];

                //        if (diff.kind == PullDeclEdit.DeclRemoved) {
                //            graphUpdater.removeDecl(diff.oldDecl);
                //        }
                //        else if (diff.kind == PullDeclEdit.DeclAdded) {
                //            //graphUpdater.addDecl(diff.newDecl);
                //            graphUpdater.invalidateType(diff.oldDecl.getSymbol());
                //        }
                //        else {
                //            // PULLTODO: Other kinds of edits
                //        }
                //    }
                //    var traceEndTime = new Date().getTime();
                //    CompilerDiagnostics.Alert("Trace time: " + (traceEndTime - traceStartTime));
                //    CompilerDiagnostics.Alert("Number of diffs: " + diffResults.length);
                //}
            }

        }
        
        // returns 'true' if diffs were detected
        public pullUpdateScript(oldScript: Script, newScript: Script): bool {
            var declDiffer = new PullDeclDiffer();
            
            // want to name the new script semantic info the same as the old one
            var newScriptSemanticInfo = new SemanticInfo(oldScript.locationInfo.filename);
            var oldScriptSemanticInfo = this.semanticInfoChain.getUnit(oldScript.locationInfo.filename);

            var declCollectionContext = new DeclCollectionContext(newScriptSemanticInfo);

            declCollectionContext.scriptName = oldScript.locationInfo.filename;

            // create decls
            getAstWalkerFactory().walk(newScript, preCollectDecls, postCollectDecls, null, declCollectionContext);

            // note that we don't decrement skipFirst, because we need to skip the globals that are added
            //var oldIndex = skipFirst;

            //if (findPullFile) {
            //    for (var i = 0; i < this.units.length; i++) {
            //        if (this.semanticInfoChain.units[i].getPath().indexOf(this.settings.testPullWithFile) != -1) {
            //            oldIndex = i;
            //            break;
            //        }
            //    }
            //}

            var oldTopLevelDecl = oldScriptSemanticInfo.getTopLevelDecls()[0];
            var newTopLevelDecl = declCollectionContext.getParent();
                
            newScriptSemanticInfo.addTopLevelDecl(newTopLevelDecl);

            var diffResults: PullDeclDiff[] = [];
                
            var diffStartTime = new Date().getTime();
            declDiffer.diffDecls(oldTopLevelDecl, newTopLevelDecl, diffResults);

            var diffEndTime = new Date().getTime();
            CompilerDiagnostics.Alert("Diff time: " + (diffEndTime - diffStartTime));

            if (diffResults.length) {
                // replace the old semantic info
                this.semanticInfoChain.updateUnit(oldScriptSemanticInfo, newScriptSemanticInfo);

                // re-bind
                var innerBindStartTime = new Date().getTime();

                var topLevelDecls = newScriptSemanticInfo.getTopLevelDecls();

                var pullSymbolCollectionContext = new PullSymbolBindingContext(this.semanticInfoChain, newScriptSemanticInfo.getPath());
                pullSymbolCollectionContext.reBindingAfterChange = true;

                for (var i = 0; i < topLevelDecls.length; i++) {

                    bindDeclSymbol(topLevelDecls[i], pullSymbolCollectionContext);

                }
                var innerBindEndTime = new Date().getTime();

                CompilerDiagnostics.Alert("Inner bind time: " + (innerBindEndTime - innerBindStartTime));
                    
                // propagate changes
                var graphUpdater = new PullSymbolGraphUpdater();
                var diff: PullDeclDiff;
                var addedDiff: PullDeclDiff = null;
                    
                var traceStartTime = new Date().getTime();
                for (var i = 0; i < diffResults.length; i++) {
                    diff = diffResults[i];

                    if (diff.kind == PullDeclEdit.DeclRemoved) {
                        graphUpdater.removeDecl(diff.oldDecl);
                    }
                    else if (diff.kind == PullDeclEdit.DeclAdded) {
                        //graphUpdater.addDecl(diff.newDecl);
                        graphUpdater.invalidateType(diff.oldDecl.getSymbol());
                        addedDiff = diff;
                    }
                    else {
                        // PULLTODO: Other kinds of edits
                    }
                }
                var typeInfo;
                var traceEndTime = new Date().getTime();
                if (addedDiff) {
                    var startupdate = new Date().getTime();
                    typeInfo = this.pullGetTypeInfoAtPosition(/*addedDiff.newDecl.getSpan().minChar*/489, newScript, oldScript.locationInfo.filename);
                    CompilerDiagnostics.Alert("Pull time for AST: " + ((new Date()).getTime() - startupdate));
                }
                
                CompilerDiagnostics.Alert("Trace time: " + (traceEndTime - traceStartTime));
                CompilerDiagnostics.Alert("Number of diffs: " + diffResults.length);
                
                return true;
            }

            return false;
        }

        public pullGetTypeInfoAtPosition(pos: number, script: Script, scriptName?: string): { ast: AST; typeName: string; typeInfo: string; typeSymbol: PullTypeSymbol; } {

            // find the enclosing decl
            var declStack: PullDecl[] = [];
            var resultASTs: AST[] = [];
            if (!scriptName) {
                scriptName = script.locationInfo.filename;
            }
            var semanticInfo = this.semanticInfoChain.getUnit(scriptName);
            var lastDeclAST: AST = null;
            var foundAST: AST = null;
            var symbol: PullSymbol = null;

            var pre = (cur: AST, parent: AST): AST => {
                if (isValidAstNode(cur)) {
                    if (pos >= cur.minChar && pos < cur.limChar) {
                        // TODO: Since AST is sometimes not correct wrt to position, only add "cur" if it's better
                        //       than top of the stack.
                        var previous = resultASTs[resultASTs.length - 1];
                        if (previous == undefined || (cur.minChar >= previous.minChar && cur.limChar <= previous.limChar)) {

                            var decl = semanticInfo.getDeclForAST(cur);

                            if (decl) {
                                declStack[declStack.length] = decl;
                                lastDeclAST = cur;
                            }

                            resultASTs[resultASTs.length] = cur;
                        }
                    }
                }
                return cur;
            }

            getAstWalkerFactory().walk(script, pre);
            
            if (resultASTs.length) {
                foundAST = resultASTs[resultASTs.length - 1];

                this.pullTypeChecker.setUnit(script.locationInfo.filename);

                // are we within a decl?  if so, just grab its symbol
                if (lastDeclAST == foundAST) {
                    symbol = declStack[declStack.length - 1].getSymbol();
                    this.pullTypeChecker.resolver.resolveDeclaredSymbol(symbol);
                }
                else {
                    // otherwise, it's an expression that needs to be resolved, so we must pull...

                    // first, find the enclosing decl
                    var enclosingDecl: PullDecl = null;

                    for (var i = declStack.length - 1; i >= 0; i--) {
                        if (!(declStack[i].getKind() & DeclKind.Variable)) {
                            enclosingDecl = declStack[i];
                        }
                    }

                    // next, obtain the assigning AST, if applicable
                    // (this would be the ast for the last decl on the decl stack)
                    var assigningAST: AST = null;
                    
                    if (declStack.length && (declStack[declStack.length - 1].getKind() & DeclKind.Variable)) {
                        assigningAST = semanticInfo.getASTForDecl(declStack[declStack.length - 1]);
                    }
                    symbol = this.pullTypeChecker.resolver.resolveStatementOrExpression(foundAST, assigningAST, enclosingDecl);
                }
            }

            if (symbol) {
                var type = symbol.getType();
                if (type) {
                    return { ast: foundAST, typeName: type.getName(), typeInfo: type.toString(), typeSymbol: type };
                }
            }

            return { ast: foundAST, typeName: "couldn't find the type...", typeInfo: "couldn't find members...", typeSymbol: null};
        }

        public emitDeclarationFile(createFile: (path: string, useUTF8?: bool) => ITextWriter) {
            if (!this.settings.generateDeclarationFiles) {
                return;
            }

            if (this.errorReporter.hasErrors) {
                // There were errors reported, do not generate declaration file
                return;
            }

            var declarationEmitter: DeclarationEmitter = new DeclarationEmitter(this.typeChecker, this.emitSettings);
            var declareFile: ITextWriter = null;
            for (var i = 0, len = this.scripts.members.length; i < len; i++) {
                var script = <Script>this.scripts.members[i];

                // If its already a declare file or is resident or does not contain body 
                if (script.isDeclareFile || script.isResident || script.bod == null) {
                    continue;
                }

                // Create or reuse file
                if (this.emitSettings.outputMany) {
                    var fname = this.units[i].filename;
                    var declareFileName = getDeclareFilePath(fname);
                    declareFile = createFile(declareFileName, this.outputScriptToUTF8(script));
                    declarationEmitter.setDeclarationFile(declareFile);
                }
                else if (declareFile == null) {
                    var outfname = getDeclareFilePath(this.settings.outputFileName);
                    declareFile = createFile(outfname, this.outputScriptsToUTF8(<Script[]>(this.scripts.members)));
                    declarationEmitter.setDeclarationFile(declareFile);
                }

                declarationEmitter.emitDeclarations(script);
                if (this.emitSettings.outputMany) {
                    declareFile.Close();
                }
            }
            if (!this.emitSettings.outputMany && declareFile) {
                declareFile.Close();
            }
        }

        public emit(createFile: (path: string, useUTF8?: bool) => ITextWriter) {
            var emitter: Emitter = null;
            this.emitSettings.createFile = createFile;

            var outFile: ITextWriter = null;

            for (var i = 0, len = this.scripts.members.length; i < len; i++) {

                var script = <Script>this.scripts.members[i];
                if (!script.emitRequired()) {
                    continue;
                }

                if (this.emitSettings.outputMany) {
                    var fname = this.units[i].filename;
                    var splitFname = fname.split(".");
                    splitFname.pop();
                    var baseName = splitFname.join(".");
                    var outFname = baseName + ".js";
                    this.emitSettings.path = outFname;
                    var useUTF8ForOutputFile = this.outputScriptToUTF8(script);
                    outFile = createFile(outFname, useUTF8ForOutputFile);
                    emitter = new Emitter(this.typeChecker, outFile, this.emitSettings);

                    if (this.settings.mapSourceFiles) {
                        emitter.setSourceMappings(new TypeScript.SourceMapper(fname, outFname, outFile, createFile(outFname + SourceMapper.MapFileExtension)));
                    }
                }
                else {

                    if (emitter == null) {
                        // Create the file
                        var useUTF8ForOutputFile = this.outputScriptsToUTF8(<Script[]>(this.scripts.members));
                        outFile = createFile(this.settings.outputFileName, useUTF8ForOutputFile);

                        emitter = new Emitter(this.typeChecker, outFile, this.emitSettings);
                        if (this.settings.mapSourceFiles) {
                            emitter.setSourceMappings(new TypeScript.SourceMapper(script.locationInfo.filename, this.settings.outputFileName, outFile, createFile(this.settings.outputFileName + SourceMapper.MapFileExtension)));
                        }
                    }
                    else if (this.settings.mapSourceFiles) {
                        emitter.setSourceMappings(new TypeScript.SourceMapper(script.locationInfo.filename, this.settings.outputFileName, outFile, emitter.sourceMapper.sourceMapOut));
                    }
                }

                this.typeChecker.locationInfo = script.locationInfo;
                emitter.emitJavascript(script, TokenID.Comma, false);
                if (this.emitSettings.outputMany) {
                    if (this.settings.mapSourceFiles) {
                        emitter.emitSourceMappings();
                    }
                    outFile.Close();
                }
            }
            if (!this.emitSettings.outputMany) {
                if (this.settings.mapSourceFiles) {
                    emitter.emitSourceMappings();
                }
                outFile.Close();
            }
        }

        public emitToOutfile(outFile: ITextWriter) {
            var emitter: Emitter = null;
            if (this.settings.mapSourceFiles) {
                throw Error("Cannot generate source map");
            }

            if (this.settings.generateDeclarationFiles) {
                throw Error("Cannot generate declaration files");
            }

            for (var i = 0, len = this.scripts.members.length; i < len; i++) {
                if (emitter == null) {
                    emitter = new Emitter(this.typeChecker, outFile, this.emitSettings);
                }
                var script = <Script>this.scripts.members[i];
                this.typeChecker.locationInfo = script.locationInfo;
                emitter.emitJavascript(script, TokenID.Comma, false);
            }
        }

        public emitAST(outputMany: bool, createFile: (path: string, useUTF8?: bool) => ITextWriter) {
            var outFile: ITextWriter = null;
            var context: PrintContext = null;

            for (var i = 0, len = this.scripts.members.length; i < len; i++) {
                var script = <Script>this.scripts.members[i];
                if (outputMany) {
                    var fname = this.units[i].filename;
                    var splitFname = fname.split(".");
                    splitFname.pop();
                    var baseName = splitFname.join(".");
                    var outFname = baseName + ".txt";
                    this.emitSettings.path = outFname;
                    outFile = createFile(outFname, this.outputScriptToUTF8(script));
                    context = new PrintContext(outFile, this.parser);
                }
                else if (context == null) {
                    // Create the file
                    outFile = createFile(this.settings.outputFileName, this.outputScriptsToUTF8(<Script[]>(this.scripts.members)));

                    context = new PrintContext(outFile, this.parser);
                }

                getAstWalkerFactory().walk(script, prePrintAST, postPrintAST, null, context);

                if (outputMany) {
                    outFile.Close();
                }
            }
            if (!outputMany) {
                outFile.Close();
            }
        }

        private outputScriptToUTF8(script: Script): bool {
            return script.containsUnicodeChar || (this.emitSettings.emitComments && script.containsUnicodeCharInComment);
        }

        private outputScriptsToUTF8(scripts: Script[]): bool {
            for (var i = 0, len = scripts.length; i < len; i++) {
                var script = scripts[i];
                if (this.outputScriptToUTF8(script)) {
                    return true;
                }
            }
            return false;
        }

        public gatherDiagnostics() {
            CompilerDiagnostics.Alert("Number of ASTs allocated: " + nASTs);
            CompilerDiagnostics.Alert("Number of types allocated: " + nTypes);
            CompilerDiagnostics.Alert("Number of symbols allocated: " + nSymbols);
            CompilerDiagnostics.Alert("");

            CompilerDiagnostics.Alert("Number of signatures allocated: " + nSignatures);
            CompilerDiagnostics.Alert("Number of signature groups allocated: " + nSignatureGroups);
            CompilerDiagnostics.Alert("");

            CompilerDiagnostics.Alert("Number of field symbols allocated: " + nFieldSymbols);
            CompilerDiagnostics.Alert("Number of type symbols allocated: " + nTypeSymbols);
            CompilerDiagnostics.Alert("Number of variable symbols allocated: " + nVariableSymbols);
            CompilerDiagnostics.Alert("Number of inference symbols allocated: " + nInferenceSymbols);
            CompilerDiagnostics.Alert("");

            // We need to query this info before the number of ASTs with types, since that will up the
            // read count
            var getsetInfo = this.gatherGetSetInfoFromASTs();

            CompilerDiagnostics.Alert("Number of type gets: " + nTypeGets);
            CompilerDiagnostics.Alert("Number of type sets: " + nTypeSets);
            CompilerDiagnostics.Alert("Number of ASTs who were queried for types: " + getsetInfo.gets);
            CompilerDiagnostics.Alert("% of ASTs whose types were retrieved: " + ((getsetInfo.gets / nASTs) * 100));
            CompilerDiagnostics.Alert("");

            var nASTsWithTypes = this.gatherTypeInfoFromASTs();

            CompilerDiagnostics.Alert("Number of ASTs with types: " + nASTsWithTypes);
            CompilerDiagnostics.Alert("% of ASTs with types: " + ((nASTsWithTypes / nASTs) * 100));
            CompilerDiagnostics.Alert("% of ASTs with types whose types were retrieved: " + ((getsetInfo.gets / nASTsWithTypes) * 100));
            CompilerDiagnostics.Alert("");

            CompilerDiagnostics.Alert("Number of scopes allocated: " + nScopes);
            CompilerDiagnostics.Alert("Number of aggregate scopes allocated: " + nScopes);
            CompilerDiagnostics.Alert("Number of symbol searches: " + nSymbolSearches);
            CompilerDiagnostics.Alert("Number of symbol finds: " + nSymbolFinds);
            CompilerDiagnostics.Alert("Number of symbol ambient finds: " + nSymbolAmbientFinds);
            CompilerDiagnostics.Alert("Number of symbol local finds: " + nSymbolLocalFinds);
            CompilerDiagnostics.Alert("Number of symbol enters: " + nSymbolEnters);
            CompilerDiagnostics.Alert("");
        }

        public gatherTypeInfoFromASTs():number {
            var nTypesSet = 0;

            function findSetTypes(ast: AST, parent: AST): AST {
                if (ast.getType()) { nTypesSet++; }
                return ast;
            }

            for (var i = 0, len = this.scripts.members.length; i < len; i++) {
                var script = this.scripts.members[i];
                TypeScript.getAstWalkerFactory().walk(script, findSetTypes);
            }         

            return nTypesSet;
        }

        public gatherGetSetInfoFromASTs(): { gets: number; sets: number; get_and_set: number; } {
            var nTypesSet = 0;
            var nTypesGotten = 0;
            var nTypeWasSetAndGotten = 0;

            function findGetSetTypes(ast: AST, parent: AST): AST {
                if (ast.typeWasGotten) { nTypesGotten++; }
                if (ast.typeWasSet) { nTypesSet++; }
                if (ast.typeWasGotten && ast.typeWasSet) { nTypeWasSetAndGotten++; }
                return ast;
            }

            for (var i = 0, len = this.scripts.members.length; i < len; i++) {
                var script = this.scripts.members[i];
                TypeScript.getAstWalkerFactory().walk(script, findGetSetTypes);
            }         

            return { gets: nTypesGotten, sets: nTypesSet, get_and_set: nTypeWasSetAndGotten };
        }
    }

    export class ScopeEntry {
        constructor (
            public name: string,
            public type: string,
            public sym: Symbol) {
        }
    }

    export class ScopeTraversal {
        constructor (private compiler: TypeScriptCompiler) {
        }

        public getScope(enclosingScopeContext: EnclosingScopeContext): SymbolScope {
            if (enclosingScopeContext.enclosingObjectLit && enclosingScopeContext.isMemberCompletion) {
                return enclosingScopeContext.getObjectLiteralScope();
            }
            else if (enclosingScopeContext.isMemberCompletion) {
                if (enclosingScopeContext.useFullAst) {
                    return this.compiler.typeFlow.findMemberScopeAtFullAst(enclosingScopeContext)
                }
                else {
                    return this.compiler.typeFlow.findMemberScopeAt(enclosingScopeContext)
                }
            }
            else {
                return enclosingScopeContext.getScope();
            }
        }

        public getScopeEntries(enclosingScopeContext: EnclosingScopeContext): ScopeEntry[] {
            var scope = this.getScope(enclosingScopeContext);
            if (scope == null) {
                return [];
            }

            var inScopeNames: IHashTable = new StringHashTable();
            var allSymbolNames: string[] = scope.getAllSymbolNames(enclosingScopeContext.isMemberCompletion);

            // there may be duplicates between the type and value tables, so batch the symbols
            // getTypeNamesForNames will prefer the entry in the value table
            for (var i = 0; i < allSymbolNames.length; i++) {
                var name = allSymbolNames[i];

                // Skip global/internal symbols that won't compile in user code
                if (name == globalId || name == "_Core" || name == "_element") {
                    continue;
                }

                inScopeNames.add(name, "");
            }

            var svModuleDecl = this.compiler.typeChecker.currentModDecl;
            this.compiler.typeChecker.currentModDecl = enclosingScopeContext.deepestModuleDecl;

            var result = this.getTypeNamesForNames(enclosingScopeContext, inScopeNames.getAllKeys(), scope);

            this.compiler.typeChecker.currentModDecl = svModuleDecl;
            return result;
        }

        private getTypeNamesForNames(enclosingScopeContext: EnclosingScopeContext, allNames: string[], scope: SymbolScope): ScopeEntry[] {
            var result: ScopeEntry[] = [];

            var enclosingScope = enclosingScopeContext.getScope();
            for (var i = 0; i < allNames.length; i++) {
                var name = allNames[i];
                // Search for the id in the value space first
                // if we don't find it, search in the type space.
                // We don't want to search twice, because the first
                // search may insert the name in the symbol value table
                // if the scope is aggregate
                var publicsOnly = enclosingScopeContext.publicsOnly && enclosingScopeContext.isMemberCompletion;
                var symbol = scope.find(name, publicsOnly, false/*typespace*/);  // REVIEW: Should search public members only?
                if (symbol == null) {
                    symbol = scope.find(name, publicsOnly, true/*typespace*/);
                }

                var displayThisMember = symbol && symbol.flags & SymbolFlags.Private ? symbol.container == scope.container : true;

                if (symbol) {
                    // Do not add dynamic module names to the list, since they're not legal as identifiers
                    if (displayThisMember && !isQuoted(symbol.name) && !isRelative(symbol.name)) {
                        var typeName = symbol.getType().getScopedTypeName(enclosingScope);
                        result.push(new ScopeEntry(name, typeName, symbol));
                    }
                }
                else {
                    // Special case for "true" and "false"
                    // REVIEW: This may no longer be necessary?
                    if (name == "true" || name == "false") {
                        result.push(new ScopeEntry(name, "bool", this.compiler.typeChecker.booleanType.symbol));
                    }
                }
            }

            return result;
        }
    }
}
