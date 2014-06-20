///<reference path='external\mocha.d.ts'/>
///<reference path='external\chai.d.ts'/>
///<reference path='..\compiler\io.ts'/>
///<reference path='..\compiler\typescript.ts'/>
///<reference path='..\services\typescriptServices.ts' />

// this will work in the browser via browserify
var _chai: typeof chai = require('chai');
var assert: typeof _chai.assert = _chai.assert;
declare var __dirname: any; // Node-specific
var serverRoot = "http://localhost:8888/";

module Utils {
    export function switchToForwardSlashes(path: string) {
        return path.replace(/\\/g, "/").replace(/\/\//g, '/');
    }

    export var userSpecifiedroot = "";
    var global = <any>Function("return this").call(null);

    export function filePath(fullPath: string) {
        fullPath = switchToForwardSlashes(fullPath);
        var components = fullPath.split("/");
        var path: string[] = components.slice(0, components.length - 1);
        return path.join("/") + "/";
    }

    export function evalFile(fileContents: string, filename: string, nodeContext?: any) {
        var environment = Harness.getExecutionEnvironment();
        switch (environment) {
            case Harness.ExecutionEnvironment.CScript:
            case Harness.ExecutionEnvironment.Browser:
                eval(fileContents);
                break;
            case Harness.ExecutionEnvironment.Node:
                var vm = require('vm');
                if (nodeContext) {
                    vm.runInNewContext(fileContents, nodeContext, filename);
                } else {
                    vm.runInThisContext(fileContents, filename);
                }
                break;
            default:
                throw new Error('Unknown context');
        }
    }

    /** Splits the given string on \r\n or on only \n if that fails */
    export function splitContentByNewlines(content: string) {
        // Split up the input file by line
        // Note: IE JS engine incorrectly handles consecutive delimiters here when using RegExp split, so
        // we have to string-based splitting instead and try to figure out the delimiting chars
        var lines = content.split('\r\n');
        if (lines.length === 1) {
            lines = content.split('\n');
        }
        return lines;
    }

    /** Reads a file under /tests */
    export function readFile(path: string) {
        if (path.indexOf('tests') < 0) {
            path = "tests/" + path;
        }

        var content = TypeScript.Environment.readFile(Harness.userSpecifiedroot + path, /*codepage:*/ null);
        if (content === null) {
            throw new Error("failed to read file at: '" + Harness.userSpecifiedroot + path + "'");
        }

        return content;
    }

    export function memoize<T extends Function>(f: T): T {
        var cache: { [idx: string]: any } = {};

        return <any>(() => {
            var key = Array.prototype.join.call(arguments);
            var cachedResult = cache[key];
            if (cachedResult) {
                return cachedResult;
            } else {
                return cache[key] = f.apply(this, arguments);
            }
        })
    }
}

module Network {
    function waitForXHR(xhr: XMLHttpRequest) {
        while (xhr.readyState !== 4) { }
        return { status: xhr.status, responseText: xhr.responseText };
    }

    /// Ask the server to use node's path.resolve to resolve the given path
    export function getResolvedPathFromServer(path: string) {
        var xhr = new XMLHttpRequest();
        try {
            xhr.open("GET", path + "?resolve", false);
            xhr.send();
        }
        catch (e) {
            return { status: 404, responseText: null };
        }

        return waitForXHR(xhr);
    }

    export interface XHRResponse {
        status: number;
        responseText: string;
    }

    /// Ask the server for the contents of the file at the given URL via a simple GET request
    export function getFileFromServerSync(url: string): XHRResponse {
        var xhr = new XMLHttpRequest();
        try {
            xhr.open("GET", url, false);
            xhr.send();
        }
        catch (e) {
            return { status: 404, responseText: null };
        }

        return waitForXHR(xhr);
    }

    /// Submit a POST request to the server to do the given action (ex WRITE, DELETE) on the provided URL
    export function writeToServerSync(url: string, action: string, contents?: string): XHRResponse {
        var xhr = new XMLHttpRequest();
        try {
            var action = '?action=' + action;
            xhr.open('POST', url + action, false);
            xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
            xhr.send(contents);
        }
        catch (e) {
            return { status: 500, responseText: null };
        }

        return waitForXHR(xhr);
    }

    export function getEnvironment(): TypeScript.IEnvironment {
        var url = url || serverRoot;

        return {
            newLine: '\r\n',

            currentDirectory: (): string => '',

            supportsCodePage: () => false,

            readFile: function (file: string, codepage: number): TypeScript.FileInformation {
                var response = getFileFromServerSync(url + file);
                if (response.status === 200) {
                    return new TypeScript.FileInformation(response.responseText, null);
                } else {
                    return null;
                }
            },

            writeFile: function (path: string, contents: string, writeByteOrderMark: boolean) {
                writeToServerSync(url + path, 'WRITE', contents);
            },

            fileExists: function (path: string): boolean {
                var response = getFileFromServerSync(url + path);
                return response.status === 200;
            },

            deleteFile: function (path: string) {
                writeToServerSync(url + path, 'DELETE', null);
            },

            directoryExists: function (path: string): boolean {
                return false;
            },

            listFiles: Utils.memoize(function dir(path: string, spec?: any, options?: any) {
                var response = getFileFromServerSync(url + path);
                if (response.status === 200) {
                    var results = response.responseText.split(',');
                    return results;
                }
                else {
                    return [''];
                }
            }),

            directoryName: Utils.memoize((path: string): string => {
                // TODO: forward this to the server or not necessary?
                var dirPath = path;
                // root of the server
                if (dirPath.match(/localhost:\d+$/) || dirPath.match(/localhost:\d+\/$/)) {
                    dirPath = null;
                    // path + filename
                } else if (dirPath.indexOf('.') === -1) {
                    dirPath = dirPath.substring(0, dirPath.lastIndexOf('/'));
                    // path
                } else {
                    // strip any trailing slash
                    if (dirPath.match(/.*\/$/)) {
                        dirPath = dirPath.substring(0, dirPath.length - 2);
                    }
                    var dirPath = dirPath.substring(0, dirPath.lastIndexOf('/'));
                }

                return dirPath;
            }),
            createDirectory: function (path: string) {
                return 'NYI';
            },
            absolutePath: Utils.memoize((path: string) => {
                var resp = getResolvedPathFromServer(url + path);
                if (resp.status === 200) {
                    return resp.responseText;
                } else {
                    throw new Error('Server failed to resolve path: ' + path);
                }
            }),

            arguments: [],

            standardOut: {
                Write: function (str: string) { console.log(str); },
                WriteLine: function (str: string) { console.log(str + '\n'); },
                Close: function () { }
            },

            standardError: {
                Write: function (str: string) { console.log(str); },
                WriteLine: function (str: string) { console.log(str + '\n'); },
                Close: function () { }
            },

            executingFilePath: function () {
                return 'NYI';
            },

            watchFile: function (filename: string, callback: (x: string) => void): TypeScript.IFileWatcher {
                return null;
            },

            quit: function (exitCode?: number) {
                return;
            }
        };
    }
}

module Harness {
    // Setup some globals based on the current environment
    export enum ExecutionEnvironment {
        Node,
        Browser,
        CScript
    }

    export function getExecutionEnvironment() {
        if (typeof WScript !== "undefined" && typeof ActiveXObject === "function") {
            return ExecutionEnvironment.CScript;
        } else if (process && (<any>process).execPath && (<any>process).execPath.indexOf("node") !== -1) {
            return ExecutionEnvironment.Node;
        } else {
            return ExecutionEnvironment.Browser;
        }
    }

    export var currentExecutionEnvironment = getExecutionEnvironment();
    var typescriptServiceFileName = "typescriptServices.js";
    var typescriptServiceFile: string;
    export var libFolder: string;
    export var Environment: TypeScript.IEnvironment;
    switch (currentExecutionEnvironment) {
        case ExecutionEnvironment.CScript:
            Environment = TypeScript.Environment;
            libFolder = TypeScript.filePath(global['WScript'].ScriptFullName);
            typescriptServiceFileName = "built/local/typescriptServices.js";
            typescriptServiceFile = Environment.readFile(typescriptServiceFileName, /*codepage:*/ null).contents;
            break;
        case ExecutionEnvironment.Node:
            Environment = TypeScript.Environment;
            libFolder = (__dirname + '/');
            typescriptServiceFileName = "built/local/typescriptServices.js";
            typescriptServiceFile = Environment.readFile(typescriptServiceFileName, /*codepage:*/ null).contents;
            break;
        case ExecutionEnvironment.Browser:
            libFolder = "bin/";
            Environment = Network.getEnvironment();
            var typescriptServiceFileName = serverRoot + "built/local/typescriptServices.js";
            var response = Network.getFileFromServerSync(typescriptServiceFileName);
            if (response.status !== 200) {
                throw new Error("Request for typescriptServiceFile " + typescriptServiceFile + " failed");
            }
            typescriptServiceFile = response.responseText;
            break;
        default:
            throw new Error('Unknown context');
    }

    Utils.evalFile(typescriptServiceFile, 'typescriptServices.js');

    export interface SourceMapEmitterCallback {
        (emittedFile: string, emittedLine: number, emittedColumn: number, sourceFile: string, sourceLine: number, sourceColumn: number, sourceName: string): void;
    }

    // Settings 
    export var userSpecifiedroot = "";
    var global = <any>Function("return this").call(null);

    export function getFileName(fullPath: string) {
        return fullPath.replace(/^.*[\\\/]/, '');
    }

    /** Functionality for compiling TypeScript code */
    export module Compiler {
        /** Aggregate various writes into a single array of lines. Useful for passing to the
         *  TypeScript compiler to fill with source code or errors.
         */
        export class WriterAggregator implements ITextWriter {
            public lines: string[] = [];
            public currentLine = <string>undefined;

            public Write(str: string) {
                // out of memory usage concerns avoid using + or += if we're going to do any manipulation of this string later
                this.currentLine = [(this.currentLine || ''), str].join('');
            }

            public WriteLine(str: string) {
                // out of memory usage concerns avoid using + or += if we're going to do any manipulation of this string later
                this.lines.push([(this.currentLine || ''), str].join(''));
                this.currentLine = undefined;
            }

            public Close() {
                if (this.currentLine !== undefined) { this.lines.push(this.currentLine); }
                this.currentLine = undefined;
            }

            public reset() {
                this.lines = [];
                this.currentLine = undefined;
            }
        }

        export interface IEmitterIOHost {
            writeFile(path: string, contents: string, writeByteOrderMark: boolean): void;
            resolvePath(path: string): string;
        }

        /** Mimics having multiple files, later concatenated to a single file. */
        export class EmitterIOHost implements IEmitterIOHost {
            private fileCollection: TypeScript.IIndexable<any> = {};

            /** create file gets the whole path to create, so this works as expected with the --out parameter */
            public writeFile(s: string, contents: string, writeByteOrderMark: boolean): void {
                var writer: ITextWriter;
                if (this.fileCollection[s]) {
                    writer = <ITextWriter>this.fileCollection[s];
                }
                else {
                    writer = new Harness.Compiler.WriterAggregator();
                    this.fileCollection[s] = writer;
                }

                writer.Write(contents);
                writer.Close();
            }

            public resolvePath(s: string) { return s; }

            public reset() { this.fileCollection = {}; }

            public toArray(): { fileName: string; file: WriterAggregator; }[] {
                var result: { fileName: string; file: WriterAggregator; }[] = [];
                for (var p in this.fileCollection) {
                    if (this.fileCollection.hasOwnProperty(p)) {
                        var current = <Harness.Compiler.WriterAggregator>this.fileCollection[p];
                        if (current.lines.length > 0) {
                            if (p.indexOf('.d.ts') !== -1) { current.lines.unshift(['////[', getFileName(p), ']'].join('')); }
                            result.push({ fileName: p, file: this.fileCollection[p] });
                        }
                    }
                }
                return result;
            }
        }

        export var libText = Environment.readFile(libFolder + "lib.d.ts", /*codepage:*/ null).contents;
        export var libTextMinimal = Environment.readFile('bin/lib.core.d.ts', null).contents; //libFolder + "../../tests/minimal.lib.d.ts", /*codepage:*/ null).contents;

        /** This is the harness's own version of the batch compiler that encapsulates state about resolution */
        export class HarnessCompiler implements TypeScript.IReferenceResolverHost {

            private inputFiles: string[] = [];
            private resolvedFiles: TypeScript.IResolvedFile[] = [];
            private compiler: TypeScript.TypeScriptCompiler;
            private fileNameToScriptSnapshot = new TypeScript.StringHashTable<TypeScript.IScriptSnapshot>();
            private sourcemapRecorder = new WriterAggregator();
            private errorList: TypeScript.Diagnostic[] = [];
            private useMinimalDefaultLib: boolean;

            public emitterIOHost = new Harness.Compiler.EmitterIOHost();

            constructor(private ioHost: TypeScript.IEnvironment, options?: { useMinimalDefaultLib: boolean; noImplicitAny: boolean; }) {
                this.compiler = new TypeScript.TypeScriptCompiler();
                this.reset();
                this.useMinimalDefaultLib = options ? options.useMinimalDefaultLib : true;
                var settings = makeDefaultCompilerSettings(options);
                settings.codeGenTarget = TypeScript.LanguageVersion.EcmaScript5;
                this.compiler.setCompilationSettings(
                    TypeScript.ImmutableCompilationSettings.fromCompilationSettings(settings));

                var libCode = this.useMinimalDefaultLib ? Compiler.libTextMinimal : Compiler.libText;
                this.compiler.addFile("lib.d.ts", TypeScript.ScriptSnapshot.fromString(libCode), TypeScript.ByteOrderMark.None, /*version:*/ 0, /*isOpen:*/ false);
            }

            public resolve() {
                var resolvedFiles: TypeScript.IResolvedFile[] = [];

                // This is the branch that we want to use to ensure proper testing of file resolution, though there is an alternative
                if (!this.compiler.compilationSettings().noResolve()) {
                    // Resolve references
                    var resolutionResults = TypeScript.ReferenceResolver.resolve(
                        this.inputFiles,
                        this,
                        this.compiler.compilationSettings().useCaseSensitiveFileResolution()
                        );
                    resolvedFiles = resolutionResults.resolvedFiles;
                    resolutionResults.diagnostics.forEach(diag => this.addError(diag));
                }
                else {
                    for (var i = 0, n = this.inputFiles.length; i < n; i++) {
                        var inputFile = this.inputFiles[i];
                        var referencedFiles: string[] = [];
                        var importedFiles: string[] = [];

                        // If declaration files are going to be emitted, preprocess the file contents and add in referenced files as well
                        if (this.compiler.compilationSettings().generateDeclarationFiles()) {
                            var references = TypeScript.getReferencedFiles(inputFile, this.getScriptSnapshot(inputFile));
                            references.forEach(reference => { referencedFiles.push(reference.path); });
                        }

                        resolvedFiles.push({
                            path: inputFile,
                            referencedFiles: referencedFiles,
                            importedFiles: importedFiles
                        });
                    }
                }

                var libPath = this.useMinimalDefaultLib ? libFolder + "lib.core.d.ts" : libFolder + "lib.d.ts";
                var libraryResolvedFile: TypeScript.IResolvedFile = {
                    path: libPath,
                    referencedFiles: [],
                    importedFiles: []
                };

                // Prepend the library to the resolved list
                resolvedFiles = [libraryResolvedFile].concat(resolvedFiles);

                return resolvedFiles.map(file => {
                    return <TypeScript.IResolvedFile>
                        {
                            path: Utils.switchToForwardSlashes(file.path),
                            referencedFiles: file.referencedFiles,
                            importedFiles: file.importedFiles
                        }
                });
            }

            /* Compile the current set of input files (if resolve = false) or trigger resolution and compile the resulting set of files */
            public compile(options?: { noResolve: boolean }) {
                // TODO: unsure I actually need resolve = false for unit tests
                var addScriptSnapshot = (path: string, referencedFiles?: string[]) => {
                    if (!isLibraryFile(path)) {
                        var scriptSnapshot = this.getScriptSnapshot(path);
                        this.compiler.addFile(path, scriptSnapshot, /*BOM*/ null, /*version:*/ 0, /*isOpen:*/ false, referencedFiles);
                    }
                }

                if (options && options.noResolve) {
                    for (var i = 0, n = this.inputFiles.length; i < n; i++) {
                        var inputFile = this.inputFiles[i];
                        addScriptSnapshot(inputFile, []);
                    }
                }
                else {
                    this.resolvedFiles = this.resolve();
                    for (var i = 0, n = this.resolvedFiles.length; i < n; i++) {
                        var resolvedFile = this.resolvedFiles[i];
                        addScriptSnapshot(resolvedFile.path, resolvedFile.referencedFiles);
                    }
                }
            }

            /* Compiles the provided files with file resolution enabled and the given compiler settings 
             * inputFiles is the set of files equivalent to what you would pass to your command line tsc invocation
             * otherFiles is a set of file information for other files that the input files need, but which do not actually exist on the file system
             * due to how we write multi-file tests in a single source file.
            */
            public compileFiles(
                inputFiles: { unitName: string; content: string }[],
                otherFiles: { unitName: string; content?: string }[],
                onComplete: (result: CompilerResult) => void,
                settingsCallback?: (settings: TypeScript.ImmutableCompilationSettings) => void,
                options?: { noResolve: boolean }) {

                var restoreSavedCompilerSettings = this.saveCompilerSettings();
                this.reset();

                this.addInputFiles(inputFiles);
                otherFiles.forEach(file => this.registerFile(file.unitName, file.content));

                if (settingsCallback) {
                    settingsCallback(this.compiler.compilationSettings());
                }

                try {
                    this.compile(options);

                    this.reportCompilationErrors();
                    var result = new CompilerResult(this.emitterIOHost.toArray(), this.errorList.slice(0), this.sourcemapRecorder.lines);

                    onComplete(result);
                } finally {
                    if (settingsCallback) {
                        restoreSavedCompilerSettings();
                    }
                }
            }

            /** Compiles a given piece of code with the provided unitName, skipping reference resolution. The compilation results are available to the provided callback in a CompilerResult object */
            public compileString(code: string, unitName: string, callback: (res: Compiler.CompilerResult) => void) {
                this.reset();

                var justName = getFileName(unitName);
                if (justName.indexOf('.ts') === -1) {
                    justName += '.ts';
                }

                this.registerFile(justName, code);
                this.inputFiles.push(justName);
                var fileNames = this.getAllFilesInCompiler();
                var updatedExistingFile = false;
                for (var i = 0; i < fileNames.length; i++) {
                    if (fileNames[i] === justName) {
                        this.updateUnit(code, justName);
                        updatedExistingFile = true;
                    }
                }

                if (!updatedExistingFile) {
                    this.compiler.addFile(justName, TypeScript.ScriptSnapshot.fromString(code), TypeScript.ByteOrderMark.None, /*version:*/ 0, /*isOpen:*/ true, []);
                }

                this.compile({ noResolve: true });

                this.reportCompilationErrors();

                callback(new CompilerResult(this.emitterIOHost.toArray(), this.errorList.slice(0), this.sourcemapRecorder.lines));
            }

            public reset() {
                this.emitterIOHost.reset();
                this.errorList = [];

                var fileNames = this.compiler.fileNames();
                for (var i = 0, n = fileNames.length; i < n; i++) {
                    var fileName = fileNames[i];
                    if (!isLibraryFile(fileName)) {
                        this.compiler.removeFile(fileNames[i]);
                    }
                }

                this.inputFiles = [];
                this.resolvedFiles = [];
                this.fileNameToScriptSnapshot = new TypeScript.StringHashTable<TypeScript.IScriptSnapshot>();
            }

            public getAllFilesInCompiler() {
                // returns what's actually in the compiler, not the contents of this.fileNameToSriptSnapshot because the latter
                // really means what's 'on the filesystem' not in compiler
                return this.compiler.fileNames().filter(file => !isLibraryFile(file));
            }

            public getDocumentFromCompiler(documentName: string) {
                return this.compiler.getDocument(documentName);
            }

            public getContentForFile(fileName: string) {
                var snapshot: TypeScript.IScriptSnapshot = this.fileNameToScriptSnapshot.lookup(fileName)

                TypeScript.Debug.assert(!!snapshot, 'Unable to get snapshot for the file "' + fileName + '"', () => {
                    var verboseInfo = [
                        '\r\nScriptSnapshots available:',
                        this.fileNameToScriptSnapshot.getAllKeys().join(', '),
                        '\r\nInput Files:',
                        this.inputFiles.join(', '),
                        '\r\nResolved Files:',
                        this.resolvedFiles.join(', ')
                    ].join(' ');
                    return verboseInfo;
                });

                return snapshot.getText(0, snapshot.getLength());
            }

            /** Tell the compiler that a file with the given name and contents exist for resolution purposes.
              * A multi-file test could have many sub parts which we want to resolve correctly but which are not
              * input files. Now subfile1, which references subfile0, can be the only input file, and when resolution
              * asks if subfile0 exists we can confirm that it does even though it is not on the file system itself.
              */
            public registerFile(unitName: string, content: string) {
                this.fileNameToScriptSnapshot.add(this.fixFilename(Utils.switchToForwardSlashes(unitName)), TypeScript.ScriptSnapshot.fromString(content));
            }

            /** The primary way to add test content. Functionally equivalent to adding files to the command line for a tsc invocation. */
            public addInputFile(file: { unitName: string; content: string }) {
                var normalizedName = this.fixFilename(Utils.switchToForwardSlashes(file.unitName));
                this.inputFiles.push(normalizedName);
                this.fileNameToScriptSnapshot.add(normalizedName, TypeScript.ScriptSnapshot.fromString(file.content));
            }

            /** The primary way to add test content. Functionally equivalent to adding files to the command line for a tsc invocation. */
            public addInputFiles(files: { unitName: string; content: string }[]) {
                files.forEach(file => this.addInputFile(file));
            }

            /** Updates an existing unit in the compiler with new code. */
            public updateUnit(code: string, unitName: string) {
                this.compiler.updateFile(unitName, TypeScript.ScriptSnapshot.fromString(code), /*version:*/ 0, /*isOpen:*/ true, null);
            }

            public emitAll(ioHost?: IEmitterIOHost) {
                var host = typeof ioHost === "undefined" ? this.emitterIOHost : ioHost;

                this.sourcemapRecorder.reset();
                var prevSourceFile = "";
                var sourceMapEmitterCallback = (emittedFile: string, emittedLine: number, emittedColumn: number, sourceFile: string, sourceLine: number, sourceColumn: number, sourceName: string): void => {
                    if (prevSourceFile != sourceFile) {
                        this.sourcemapRecorder.WriteLine("");
                        this.sourcemapRecorder.WriteLine("EmittedFile: (" + emittedFile + ") sourceFile: (" + sourceFile + ")");
                        this.sourcemapRecorder.WriteLine("-------------------------------------------------------------------");
                        prevSourceFile = sourceFile;
                    }
                    this.sourcemapRecorder.Write("Emitted (" + emittedLine + ", " + emittedColumn + ") source (" + sourceLine + ", " + sourceColumn + ")");
                    if (sourceName) {
                        this.sourcemapRecorder.Write(" name (" + sourceName + ")");
                    }
                    this.sourcemapRecorder.WriteLine("");
                };

                var output = this.compiler.emitAll(path => host.resolvePath(path));
                output.outputFiles.forEach(o => {
                    host.writeFile(o.name, o.text, o.writeByteOrderMark);

                    o.sourceMapEntries.forEach(s => sourceMapEmitterCallback(s.emittedFile, s.emittedLine, s.emittedColumn, s.sourceFile, s.sourceLine, s.sourceColumn, s.sourceName));
                });
            }

            public emitAllDeclarations(ioHost: IEmitterIOHost) {
                var output = this.compiler.emitAllDeclarations((path: string) => ioHost.resolvePath(path));
                output.outputFiles.forEach(o => ioHost.writeFile(o.name, o.text, o.writeByteOrderMark));
            }

            /** If the compiler already contains the contents of interest, this will re-emit for AMD without re-adding or recompiling the current compiler units */
            private emitCurrentCompilerContentsAsAMD() {
                var oldSettings = this.compiler.compilationSettings();

                var settings = this.compiler.compilationSettings().toCompilationSettings();
                settings.moduleGenTarget = TypeScript.ModuleGenTarget.Asynchronous;
                this.compiler.setCompilationSettings(TypeScript.ImmutableCompilationSettings.fromCompilationSettings(settings));

                this.emitterIOHost.reset();
                this.errorList = [];
                this.emitAll(this.emitterIOHost);
                this.emitAllDeclarations(this.emitterIOHost);
                var result = new CompilerResult(this.emitterIOHost.toArray(), this.errorList, this.sourcemapRecorder.lines);

                this.compiler.setCompilationSettings(oldSettings);
                return result;
            }

            /** Reports all compilation errors except resolution specific errors */
            public reportCompilationErrors() {
                var units: string[] = [];

                var files = this.getAllFilesInCompiler();
                files.forEach(file => {
                    if (file !== 'lib.d.ts') {
                        units.push(file);
                    }
                });

                var anySyntaxErrors = false;
                units.forEach(u => {
                    this.compiler.getSyntacticDiagnostics(u).forEach(d => {
                        this.addError(d);
                        anySyntaxErrors = true;
                    });
                    this.compiler.getSemanticDiagnostics(u).forEach(d => this.addError(d));
                });

                if (!anySyntaxErrors) {
                    this.compiler.getCompilerOptionsDiagnostics(this.ioHost.absolutePath).forEach(d => this.addError(d));

                    // Emit (note: reportDiagnostics is what causes the emit to happen)
                    this.emitAll(this.emitterIOHost);

                    // Emit declarations
                    this.emitAllDeclarations(this.emitterIOHost);
                }
                return this.errorList;
            }


            /** Modify the given compiler's settings as specified in the test case settings.
             *  The caller of this function is responsible for saving the existing settings if they want to restore them to the original settings later.
             */
            public setCompilerSettings(tcSettings: Harness.TestCaseParser.CompilerSetting[]) {
                var settings: TypeScript.CompilationSettings = this.compiler.compilationSettings().toCompilationSettings();

                tcSettings.forEach((item) => {
                    var idx = this.supportedFlags.filter((x) => x.flag === item.flag.toLowerCase());
                    if (idx && idx.length != 1) {
                        throw new Error('Unsupported flag \'' + item.flag + '\'');
                    }

                    idx[0].setFlag(settings, item.value);
                });

                this.compiler.setCompilationSettings(TypeScript.ImmutableCompilationSettings.fromCompilationSettings(settings));
            }

            /** The compiler flags which tests are allowed to change and functions that can change them appropriately.
             *  Every flag here needs to also be present in the fileMetadataNames array in the TestCaseParser class in harness.ts. They must be all lowercase in both places.
             */
            private supportedFlags: { flag: string; setFlag: (x: TypeScript.CompilationSettings, value: string) => void; }[] = [
                { flag: 'comments', setFlag: (x: TypeScript.CompilationSettings, value: string) => { x.removeComments = value.toLowerCase() === 'true' ? false : true; } },
                { flag: 'declaration', setFlag: (x: TypeScript.CompilationSettings, value: string) => { x.generateDeclarationFiles = value.toLowerCase() === 'true' ? true : false; } },
                {
                    flag: 'module', setFlag: (x: TypeScript.CompilationSettings, value: string) => {
                        switch (value.toLowerCase()) {
                            // this needs to be set on the global variable
                            default:
                            case 'commonjs':
                                x.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
                                break;
                            case 'amd':
                                x.moduleGenTarget = TypeScript.ModuleGenTarget.Asynchronous;
                                break;
                            case 'unspecified':
                                x.moduleGenTarget = TypeScript.ModuleGenTarget.Unspecified;
                                break;
                        }
                    }
                },
                { flag: 'nolib', setFlag: (x: TypeScript.CompilationSettings, value: string) => { x.noLib = value.toLowerCase() === 'true' ? false : true; } },
                { flag: 'sourcemap', setFlag: (x: TypeScript.CompilationSettings, value: string) => { x.mapSourceFiles = value.toLowerCase() === 'true' ? true : false; } },
                { flag: 'target', setFlag: (x: TypeScript.CompilationSettings, value: string) => { x.codeGenTarget = value.toLowerCase() === 'es3' ? TypeScript.LanguageVersion.EcmaScript3 : TypeScript.LanguageVersion.EcmaScript5; } },
                { flag: 'out', setFlag: (x: TypeScript.CompilationSettings, value: string) => { x.outFileOption = value; } },
                { flag: 'outDir', setFlag: (x: TypeScript.CompilationSettings, value: string) => { x.outDirOption = value; } },
                { flag: 'filename', setFlag: (x: TypeScript.CompilationSettings, value: string) => { /* used for multifile tests, doesn't change any compiler settings */; } },
                { flag: 'noimplicitany', setFlag: (x: TypeScript.CompilationSettings, value: string) => { x.noImplicitAny = value.toLowerCase() === 'true' ? true : false; } },
                { flag: 'noresolve', setFlag: (x: TypeScript.CompilationSettings, value: string) => { x.noResolve = value.toLowerCase() === 'true' ? true : false; } },
            ];

            /** Does a deep copy of the given compiler's settings and emit options and returns
              * a function which will restore the old settings when executed */
            public saveCompilerSettings() {
                var oldCompilerSettings = this.compiler.compilationSettings();

                return () => {
                    this.compiler.setCompilationSettings(oldCompilerSettings);
                };
            }

            private fixFilename(filename: string) {
                // Expecting filename to be rooted at typescript\public\tests
                var idx = filename.indexOf('tests/'); // idx is -1 for tests using compileString and samples
                var fixedPath = filename.substr(idx === -1 ? 0 : idx);
                return fixedPath;
            }

            // IReferenceResolverHost methods
            getScriptSnapshot(filename: string): TypeScript.IScriptSnapshot {
                var fixedPath = this.fixFilename(filename);
                var snapshot = this.fileNameToScriptSnapshot.lookup(fixedPath);
                if (!snapshot) {
                    this.addError(new TypeScript.Diagnostic(null, null, 0, 0, TypeScript.DiagnosticCode.Cannot_read_file_0_1, [filename, '']));
                }

                return snapshot;
            }

            resolveRelativePath(path: string, directory: string): string {
                var unQuotedPath = TypeScript.stripStartAndEndQuotes(path);
                var normalizedPath: string;

                if (TypeScript.isRooted(unQuotedPath) || !directory) {
                    normalizedPath = unQuotedPath;
                } else {
                    normalizedPath = TypeScript.IOUtils.combine(directory, unQuotedPath);
                }

                // get the absolute path
                normalizedPath = this.ioHost.absolutePath(normalizedPath);

                // Switch to forward slashes
                normalizedPath = TypeScript.switchToForwardSlashes(normalizedPath);

                return normalizedPath;
            }

            fileExists(path: string): boolean {
                var fixedPath = this.resolveRelativePath(path, ''); // when would I ever want to pass 'this.getParentDirectory(path)' for arg 2? Just ends up combining incorrectly later
                var idx = path.indexOf('tests/');
                var fixedPath = fixedPath.substr(idx === -1 ? 0 : idx);
                var result = this.fileNameToScriptSnapshot.lookup(fixedPath);
                if (!result) {
                    // if the file didn't exist in the 'virtual' file system (ie fileNameToScriptSnapshot)
                    // see if it is a real file, and if so, make sure to register it with the virtual 
                    // file system for later lookup with other resolution calls
                    if (this.ioHost.fileExists(path)) {
                        var contents = this.ioHost.readFile(path, null).contents;
                        result = TypeScript.ScriptSnapshot.fromString(contents);
                        this.fileNameToScriptSnapshot.add(fixedPath, result);
                    }
                }
                return (result !== null && result !== undefined);
            }

            directoryExists(path: string): boolean {
                return this.ioHost.directoryExists(path);
            }

            getParentDirectory(path: string): string {
                return this.ioHost.directoryName(path);
            }

            addError(diagnostic: TypeScript.Diagnostic) {
                this.errorList.push(diagnostic);
            }
        }

        export function makeDefaultCompilerSettings(options?: { useMinimalDefaultLib: boolean; noImplicitAny: boolean; }) {
            var useMinimalDefaultLib = options ? options.useMinimalDefaultLib : true;
            var noImplicitAny = options ? options.noImplicitAny : false;
            var settings = new TypeScript.CompilationSettings();
            settings.codeGenTarget = TypeScript.LanguageVersion.EcmaScript5;
            settings.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
            settings.noLib = useMinimalDefaultLib;
            settings.noResolve = false;
            settings.noImplicitAny = noImplicitAny;
            return settings;
        }

        /** Recreate the appropriate compiler instance to its default settings */
        function recreate(options?: { useMinimalDefaultLib: boolean; noImplicitAny: boolean; }) {
            var useMinimalDefaultLibValue = options ? options.useMinimalDefaultLib : true;
            var noImplicitAnyValue = options ? options.noImplicitAny : false;
            var optionsWithDefaults = { useMinimalDefaultLib: useMinimalDefaultLibValue, noImplicitAny: noImplicitAnyValue };
            harnessCompiler = new HarnessCompiler(Environment, optionsWithDefaults);
            return harnessCompiler;
        }

        /** The harness' compiler instance used when tests are actually run. Reseting or changing settings of this compiler instance must be done within a testcase (i.e., describe/it) */
        var harnessCompiler = new HarnessCompiler(Environment);

        /** Returns the singleton harness compiler instance for generating and running tests.
            If required a fresh compiler instance will be created, otherwise the existing singleton will be re-used.
        */
        export function getCompiler(opts?: { useExistingInstance: boolean; optionsForFreshInstance?: { useMinimalDefaultLib: boolean; noImplicitAny: boolean; } }) {
            if (!opts || opts.useExistingInstance === true) return harnessCompiler
            else {
                harnessCompiler = recreate(opts.optionsForFreshInstance);
                return harnessCompiler;
            }
        }

        // This does not need to exist strictly speaking, but many tests will need to be updated if it's removed
        export function compileString(code: string, unitName: string, callback: (result: CompilerResult) => void) {
            harnessCompiler.compileString(code, unitName, callback);
        }

        export interface GeneratedFile {
            fileName: string;
            code: string;
        }
        /** Contains the code and errors of a compilation and some helper methods to check its status. */
        export class CompilerResult {
            public files: GeneratedFile[] = [];
            public errors: TypeScript.Diagnostic[] = [];
            public declFilesCode: GeneratedFile[] = [];
            public sourceMaps: GeneratedFile[] = [];
            public sourceMapRecord: string;

            /** @param fileResults an array of strings for the fileName and an ITextWriter with its code */
            constructor(fileResults: { fileName: string; file: WriterAggregator; }[], errors: TypeScript.Diagnostic[], sourceMapRecordLines: string[]) {
                var lines: string[] = [];

                var endsWith = (str: string, end: string) => str.substr(str.length - end.length) === end;

                fileResults.forEach(emittedFile => {
                    var fileObj = { fileName: emittedFile.fileName, code: emittedFile.file.lines.join('\r\n') };
                    if (endsWith(emittedFile.fileName, '.d.ts')) {
                        // .d.ts file, add to declFiles emit
                        this.declFilesCode.push(fileObj);
                    } else if (endsWith(emittedFile.fileName, '.js')) {
                        // .js file, add to files
                        this.files.push(fileObj);
                    } else if (endsWith(emittedFile.fileName, '.js.map')) {
                        this.sourceMaps.push(fileObj);
                    } else {
                        throw new Error('Unrecognized file extension for file ' + emittedFile.fileName);
                    }
                });

                this.errors = errors;
                this.sourceMapRecord = sourceMapRecordLines.join('\r\n');
            }

            public isErrorAt(line: number, column: number, message: string) {
                for (var i = 0; i < this.errors.length; i++) {
                    if ((this.errors[i].line() + 1) === line && (this.errors[i].character() + 1) === column && this.errors[i].message() === message)
                        return true;
                }

                return false;
            }
        }
    }

    export module TestCaseParser {
        /** all the necesarry information to set the right compiler settings */
        export interface CompilerSetting {
            flag: string;
            value: string;
        }

        /** All the necessary information to turn a multi file test into useful units for later compilation */
        export interface TestUnitData {
            content: string;
            name: string;
            fileOptions: any;
            originalFilePath: string;
            references: string[];
        }

        // Regex for parsing options in the format "@Alpha: Value of any sort"
        var optionRegex = /^[\/]{2}\s*@(\w+)\s*:\s*(\S*)/gm;  // multiple matches on multiple lines

        // List of allowed metadata names
        var fileMetadataNames = ["filename", "comments", "declaration", "module", "nolib", "sourcemap", "target", "out", "outDir", "noimplicitany", "noresolve"];

        function extractCompilerSettings(content: string): CompilerSetting[] {

            var opts: CompilerSetting[] = [];

            var match: RegExpExecArray;
            while ((match = optionRegex.exec(content)) != null) {
                opts.push({ flag: match[1], value: match[2] });
            }

            return opts;
        }

        /** Given a test file containing // @Filename directives, return an array of named units of code to be added to an existing compiler instance */
        export function makeUnitsFromTest(code: string, fileName: string): { settings: CompilerSetting[]; testUnitData: TestUnitData[]; } {

            var settings = extractCompilerSettings(code);

            // List of all the subfiles we've parsed out
            var files: TestUnitData[] = [];

            var lines = Utils.splitContentByNewlines(code);

            // Stuff related to the subfile we're parsing
            var currentFileContent: string = null;
            var currentFileOptions: TypeScript.IIndexable<any> = {};
            var currentFileName: any = null;
            var refs: string[] = [];

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                var testMetaData = optionRegex.exec(line);
                if (testMetaData) {
                    // Comment line, check for global/file @options and record them
                    optionRegex.lastIndex = 0;
                    var fileNameIndex = fileMetadataNames.indexOf(testMetaData[1].toLowerCase());
                    if (fileNameIndex === -1) {
                        throw new Error('Unrecognized metadata name "' + testMetaData[1] + '". Available file metadata names are: ' + fileMetadataNames.join(', '));
                    } else if (fileNameIndex === 0) {
                        currentFileOptions[testMetaData[1]] = testMetaData[2];
                    } else {
                        continue;
                    }

                    // New metadata statement after having collected some code to go with the previous metadata
                    if (currentFileName) {
                        // Store result file
                        var newTestFile =
                            {
                                content: currentFileContent,
                                name: currentFileName,
                                fileOptions: currentFileOptions,
                                originalFilePath: fileName,
                                references: refs
                            };
                        files.push(newTestFile);

                        // Reset local data
                        currentFileContent = null;
                        currentFileOptions = {};
                        currentFileName = testMetaData[2];
                        refs = [];
                    } else {
                        // First metadata marker in the file
                        currentFileName = testMetaData[2];
                    }
                } else {
                    // Subfile content line
                    // Append to the current subfile content, inserting a newline needed
                    if (currentFileContent === null) {
                        currentFileContent = '';
                    } else {
                        // End-of-line
                        currentFileContent = currentFileContent + '\n';
                    }
                    currentFileContent = currentFileContent + line;
                }
            }

            // normalize the fileName for the single file case
            currentFileName = files.length > 0 ? currentFileName : getFileName(fileName);

            // EOF, push whatever remains
            var newTestFile2 = {
                content: currentFileContent || '',
                name: currentFileName,
                fileOptions: currentFileOptions,
                originalFilePath: fileName,
                references: refs
            };
            files.push(newTestFile2);

            return { settings: settings, testUnitData: files };
        }
    }

    export class ScriptInfo {
        public version: number = 1;
        public editRanges: { length: number; textChangeRange: TypeScript.TextChangeRange; }[] = [];
        public lineMap: TypeScript.LineMap = null;

        constructor(public fileName: string, public content: string, public isOpen = true, public byteOrderMark: TypeScript.ByteOrderMark = TypeScript.ByteOrderMark.None) {
            this.setContent(content);
        }

        private setContent(content: string): void {
            this.content = content;
            this.lineMap = TypeScript.LineMap1.fromString(content);
        }

        public updateContent(content: string): void {
            this.editRanges = [];
            this.setContent(content);
            this.version++;
        }

        public editContent(minChar: number, limChar: number, newText: string): void {
            // Apply edits
            var prefix = this.content.substring(0, minChar);
            var middle = newText;
            var suffix = this.content.substring(limChar);
            this.setContent(prefix + middle + suffix);

            // Store edit range + new length of script
            this.editRanges.push({
                length: this.content.length,
                textChangeRange: new TypeScript.TextChangeRange(
                    TypeScript.TextSpan.fromBounds(minChar, limChar), newText.length)
            });

            // Update version #
            this.version++;
        }

        public getTextChangeRangeBetweenVersions(startVersion: number, endVersion: number): TypeScript.TextChangeRange {
            if (startVersion === endVersion) {
                // No edits!
                return TypeScript.TextChangeRange.unchanged;
            }

            var initialEditRangeIndex = this.editRanges.length - (this.version - startVersion);
            var lastEditRangeIndex = this.editRanges.length - (this.version - endVersion);

            var entries = this.editRanges.slice(initialEditRangeIndex, lastEditRangeIndex);
            return TypeScript.TextChangeRange.collapseChangesAcrossMultipleVersions(entries.map(e => e.textChangeRange));
        }
    }

    class ScriptSnapshotShim implements TypeScript.Services.IScriptSnapshotShim {
        private lineMap: TypeScript.LineMap = null;
        private textSnapshot: string;
        private version: number;

        constructor(private scriptInfo: ScriptInfo) {
            this.textSnapshot = scriptInfo.content;
            this.version = scriptInfo.version;
        }

        public getText(start: number, end: number): string {
            return this.textSnapshot.substring(start, end);
        }

        public getLength(): number {
            return this.textSnapshot.length;
        }

        public getLineStartPositions(): string {
            if (this.lineMap === null) {
                this.lineMap = TypeScript.LineMap1.fromString(this.textSnapshot);
            }

            return JSON.stringify(this.lineMap.lineStarts());
        }

        public getTextChangeRangeSinceVersion(scriptVersion: number): string {
            var range = this.scriptInfo.getTextChangeRangeBetweenVersions(scriptVersion, this.version);
            if (range === null) {
                return null;
            }

            return JSON.stringify({ span: { start: range.span().start(), length: range.span().length() }, newLength: range.newLength() });
        }
    }

    export class TypeScriptLS implements TypeScript.Services.ILanguageServiceShimHost {
        IO = TypeScript.Environment ? TypeScript.Environment : Network.getEnvironment();
        private ls: TypeScript.Services.ILanguageServiceShim = null;

        private fileNameToScript = new TypeScript.StringHashTable<ScriptInfo>();

        constructor(private cancellationToken: TypeScript.ICancellationToken = TypeScript.CancellationToken.None) {
        }

        public addDefaultLibrary() {
            this.addScript("lib.d.ts", Harness.Compiler.libText);
        }

        public getHostIdentifier(): string {
            return "TypeScriptLS";
        }

        public addFile(fileName: string) {
            var code = Utils.readFile(fileName).contents;
            this.addScript(fileName, code);
        }

        private getScriptInfo(fileName: string): ScriptInfo {
            return this.fileNameToScript.lookup(fileName);
        }

        public addScript(fileName: string, content: string) {
            var script = new ScriptInfo(fileName, content);
            this.fileNameToScript.add(fileName, script);
        }

        public updateScript(fileName: string, content: string) {
            var script = this.getScriptInfo(fileName);
            if (script !== null) {
                script.updateContent(content);
                return;
            }

            this.addScript(fileName, content);
        }

        public editScript(fileName: string, minChar: number, limChar: number, newText: string) {
            var script = this.getScriptInfo(fileName);
            if (script !== null) {
                script.editContent(minChar, limChar, newText);
                return;
            }

            throw new Error("No script with name '" + fileName + "'");
        }

        //////////////////////////////////////////////////////////////////////
        // ILogger implementation
        //
        public information(): boolean { return false; }
        public debug(): boolean { return true; }
        public warning(): boolean { return true; }
        public error(): boolean { return true; }
        public fatal(): boolean { return true; }

        public log(s: string): void {
            // For debugging...
            //TypeScript.Environment.standardOut.WriteLine("TypeScriptLS:" + s);
        }

        //////////////////////////////////////////////////////////////////////
        // ILanguageServiceShimHost implementation
        //

        public getCompilationSettings(): string/*json for Tools.CompilationSettings*/ {
            return ""; // i.e. default settings
        }

        public getCancellationToken(): TypeScript.ICancellationToken {
            return this.cancellationToken;
        }

        public getScriptFileNames(): string {
            return JSON.stringify(this.fileNameToScript.getAllKeys());
        }

        public getScriptSnapshot(fileName: string): TypeScript.Services.IScriptSnapshotShim {
            return new ScriptSnapshotShim(this.getScriptInfo(fileName));
        }

        public getScriptVersion(fileName: string): number {
            return this.getScriptInfo(fileName).version;
        }

        public getScriptIsOpen(fileName: string): boolean {
            return this.getScriptInfo(fileName).isOpen;
        }

        public getScriptByteOrderMark(fileName: string): TypeScript.ByteOrderMark {
            return this.getScriptInfo(fileName).byteOrderMark;
        }

        public getDiagnosticsObject(): TypeScript.Services.ILanguageServicesDiagnostics {
            return new LanguageServicesDiagnostics("");
        }

        public getLocalizedDiagnosticMessages(): string {
            return "";
        }

        public fileExists(s: string) {
            return this.IO.fileExists(s);
        }

        public directoryExists(s: string) {
            return this.IO.directoryExists(s);
        }

        public resolveRelativePath(path: string, directory: string): string {
            if (TypeScript.isRooted(path) || !directory) {
                return this.IO.absolutePath(path);
            }
            else {
                return this.IO.absolutePath(TypeScript.IOUtils.combine(directory, path));
            }
        }

        public getParentDirectory(path: string): string {
            return this.IO.directoryName(path);
        }

        /** Return a new instance of the language service shim, up-to-date wrt to typecheck.
         *  To access the non-shim (i.e. actual) language service, use the "ls.languageService" property.
         */
        public getLanguageService(): TypeScript.Services.ILanguageServiceShim {
            var ls = new TypeScript.Services.TypeScriptServicesFactory().createLanguageServiceShim(this);
            this.ls = ls;
            return ls;
        }

        /** Parse file given its source text */
        public parseSourceText(fileName: string, sourceText: TypeScript.IScriptSnapshot): TypeScript.SourceUnitSyntax {
            var compilationSettings = new TypeScript.CompilationSettings();
            compilationSettings.codeGenTarget = TypeScript.LanguageVersion.EcmaScript5;

            var settings = TypeScript.ImmutableCompilationSettings.fromCompilationSettings(compilationSettings);
            var parseOptions = settings.codeGenTarget();
            return TypeScript.Parser.parse(fileName, TypeScript.SimpleText.fromScriptSnapshot(sourceText), parseOptions, TypeScript.isDTSFile(fileName)).sourceUnit();
        }

        /** Parse a file on disk given its fileName */
        public parseFile(fileName: string) {
            var sourceText = TypeScript.ScriptSnapshot.fromString(this.IO.readFile(fileName, /*codepage:*/ null).contents)
            return this.parseSourceText(fileName, sourceText);
        }

        /**
         * @param line 1 based index
         * @param col 1 based index
        */
        public lineColToPosition(fileName: string, line: number, col: number): number {
            var script: ScriptInfo = this.fileNameToScript.lookup(fileName);
            assert.isNotNull(script);
            assert.isTrue(line >= 1);
            assert.isTrue(col >= 1);

            return script.lineMap.getPosition(line - 1, col - 1);
        }

        /**
         * @param line 0 based index
         * @param col 0 based index
        */
        public positionToZeroBasedLineCol(fileName: string, position: number): TypeScript.ILineAndCharacter {
            var script: ScriptInfo = this.fileNameToScript.lookup(fileName);
            assert.isNotNull(script);

            var result = script.lineMap.getLineAndCharacterFromPosition(position);

            assert.isTrue(result.line() >= 0);
            assert.isTrue(result.character() >= 0);
            return { line: result.line(), character: result.character() };
        }

        /** Verify that applying edits to sourceFileName result in the content of the file baselineFileName */
        public checkEdits(sourceFileName: string, baselineFileName: string, edits: TypeScript.Services.TextEdit[]) {
            var script = Utils.readFile(sourceFileName);
            var formattedScript = this.applyEdits(script.contents, edits);
            var baseline = Utils.readFile(baselineFileName).contents;

            function noDiff(text1: string, text2: string) {
                text1 = text1.replace(/^\s+|\s+$/g, "").replace(/\r\n?/g, "\n");
                text2 = text2.replace(/^\s+|\s+$/g, "").replace(/\r\n?/g, "\n");

                if (text1 !== text2) {
                    var errorString = "";
                    var text1Lines = text1.split(/\n/);
                    var text2Lines = text2.split(/\n/);
                    for (var i = 0; i < text1Lines.length; i++) {
                        if (text1Lines[i] !== text2Lines[i]) {
                            errorString += "Difference at line " + (i + 1) + ":\n";
                            errorString += "                  Left File: " + text1Lines[i] + "\n";
                            errorString += "                 Right File: " + text2Lines[i] + "\n\n";
                        }
                    }
                    throw (new Error(errorString));
                }
            }
            assert.isTrue(noDiff(formattedScript, baseline));
            assert.equal(formattedScript, baseline);
        }


        /** Apply an array of text edits to a string, and return the resulting string. */
        public applyEdits(content: string, edits: TypeScript.Services.TextEdit[]): string {
            var result = content;
            edits = this.normalizeEdits(edits);

            for (var i = edits.length - 1; i >= 0; i--) {
                var edit = edits[i];
                var prefix = result.substring(0, edit.minChar);
                var middle = edit.text;
                var suffix = result.substring(edit.limChar);
                result = prefix + middle + suffix;
            }
            return result;
        }

        /** Normalize an array of edits by removing overlapping entries and sorting entries on the minChar position. */
        private normalizeEdits(edits: TypeScript.Services.TextEdit[]): TypeScript.Services.TextEdit[] {
            var result: TypeScript.Services.TextEdit[] = [];

            function mapEdits(edits: TypeScript.Services.TextEdit[]): { edit: TypeScript.Services.TextEdit; index: number; }[] {
                var result: { edit: TypeScript.Services.TextEdit; index: number; }[] = [];
                for (var i = 0; i < edits.length; i++) {
                    result.push({ edit: edits[i], index: i });
                }
                return result;
            }

            var temp = mapEdits(edits).sort(function (a, b) {
                var result = a.edit.minChar - b.edit.minChar;
                if (result === 0)
                    result = a.index - b.index;
                return result;
            });

            var current = 0;
            var next = 1;
            while (current < temp.length) {
                var currentEdit = temp[current].edit;

                // Last edit
                if (next >= temp.length) {
                    result.push(currentEdit);
                    current++;
                    continue;
                }
                var nextEdit = temp[next].edit;

                var gap = nextEdit.minChar - currentEdit.limChar;

                // non-overlapping edits
                if (gap >= 0) {
                    result.push(currentEdit);
                    current = next;
                    next++;
                    continue;
                }

                // overlapping edits: for now, we only support ignoring an next edit 
                // entirely contained in the current edit.
                if (currentEdit.limChar >= nextEdit.limChar) {
                    next++;
                    continue;
                }
                else {
                    throw new Error("Trying to apply overlapping edits");
                }
            }

            return result;
        }
    }

    export class LanguageServicesDiagnostics implements TypeScript.Services.ILanguageServicesDiagnostics {

        constructor(private destination: string) { }

        public log(content: string): void {
            //Imitates the LanguageServicesDiagnostics object when not in Visual Studio
        }

    }

    /** Runs TypeScript or Javascript code. */
    export module Runner {
        export function runCollateral(path: string, callback: (error: Error, result: any) => void) {
            path = Utils.switchToForwardSlashes(path);
            runString(Utils.readFile(path).contents, path.match(/[^\/]*$/)[0], callback);
        }

        export function runJSString(code: string, callback: (error: Error, result: any) => void) {
            // List of names that get overriden by various test code we eval
            var dangerNames: any = ['Array'];

            var globalBackup: any = {};
            var n: string = null;
            for (n in dangerNames) {
                globalBackup[dangerNames[n]] = global[dangerNames[n]];
            }

            try {
                var res = eval(code);

                for (n in dangerNames) {
                    global[dangerNames[n]] = globalBackup[dangerNames[n]];
                }

                callback(null, res);
            } catch (e) {
                for (n in dangerNames) {
                    global[dangerNames[n]] = globalBackup[dangerNames[n]];
                }

                callback(e, null);
            }
        }

        export function runString(code: string, unitName: string, callback: (error: Error, result: any) => void) {
            var harnessCompiler = Harness.Compiler.getCompiler();
            harnessCompiler.compileString(code, unitName, function (res) {
                runJSString(res.files[0].code, callback);
            });
        }
    }

    /** Support class for baseline files */
    export module Baseline {
        // Need to check for browser first or else we may find the eval'd TypeScript.Environment from TypeScriptServices.js
        if (currentExecutionEnvironment === ExecutionEnvironment.Browser) {
            var Environment = Network.getEnvironment();
        }
        else {
            var Environment = TypeScript.Environment;
        }

        var firstRun = true;

        export interface BaselineOptions {
            LineEndingSensitive?: boolean;
        }

        function localPath(fileName: string) {
            return Harness.userSpecifiedroot + 'tests/baselines/local/' + fileName;
        }

        function referencePath(fileName: string) {
            return Harness.userSpecifiedroot + 'tests/baselines/reference/' + fileName;
        }

        var fileCache: { [idx: string]: boolean } = {}
        function generateActual(actualFilename: string, generateContent: () => string): string {
            var parentDir = Environment.directoryName(actualFilename); // .../tests/baselines/local
            var parentParentDir = Environment.directoryName(Environment.directoryName(actualFilename)) // .../tests/baselines
            if (!fileCache[parentDir] && !fileCache[parentParentDir]) {
                // Create folders if needed
                Environment.createDirectory(parentParentDir);
                Environment.createDirectory(parentDir);

                // Delete the actual file in case it fails
                if (Environment.fileExists(actualFilename)) {
                    Environment.deleteFile(actualFilename);
                }

                fileCache[parentDir] = true;
                fileCache[parentParentDir] = true;
            }

            var actual = generateContent();

            if (actual === undefined) {
                throw new Error('The generated content was "undefined". Return "null" if no baselining is required."');
            }

            // Store the content in the 'local' folder so we
            // can accept it later (manually)
            if (actual !== null) {
                Environment.writeFile(actualFilename, actual, /*writeByteOrderMark:*/ false);
            }

            return actual;
        }

        function compareToBaseline(actual: string, relativeFilename: string, opts: BaselineOptions) {
            // actual is now either undefined (the generator had an error), null (no file requested),
            // or some real output of the function
            if (actual === undefined) {
                // Nothing to do
                return;
            }

            var refFilename = referencePath(relativeFilename);

            if (actual === null) {
                actual = '<no content>';
            }

            var expected = '<no content>';
            if (Environment.fileExists(refFilename)) {
                expected = Environment.readFile(refFilename, /*codepage:*/ null).contents;
            }

            var lineEndingSensitive = opts && opts.LineEndingSensitive;

            if (!lineEndingSensitive) {
                expected = expected.replace(/\r\n?/g, '\n')
                actual = actual.replace(/\r\n?/g, '\n')
            }

            return { expected: expected, actual: actual };
        }

        function writeComparison(expected: string, actual: string, relativeFilename: string, actualFilename: string, descriptionForDescribe: string) {
            if (expected != actual) {
                // Overwrite & issue error
                var errMsg = 'The baseline file ' + relativeFilename + ' has changed. Diffs the baselines and ';
                errMsg += 'either fix the regression (if unintended) or run jake baseline-accept (if intended).'

                throw new Error(errMsg);
            }
        }

        export function runBaseline(
            descriptionForDescribe: string,
            relativeFilename: string,
            generateContent: () => string,
            runImmediately = false,
            opts?: BaselineOptions) {

            var actual = <string>undefined;
            var actualFilename = localPath(relativeFilename);

            if (runImmediately) {
                actual = generateActual(actualFilename, generateContent);
                var comparison = compareToBaseline(actual, relativeFilename, opts);
                writeComparison(comparison.expected, comparison.actual, relativeFilename, actualFilename, descriptionForDescribe);
            } else {
                actual = generateActual(actualFilename, generateContent);

                var comparison = compareToBaseline(actual, relativeFilename, opts);
                writeComparison(comparison.expected, comparison.actual, relativeFilename, actualFilename, descriptionForDescribe);
            }
        }
    }

    export function isLibraryFile(filePath: string): boolean {
        return filePath.indexOf('lib.d.ts') >= 0 || filePath.indexOf('lib.core.d.ts') >= 0;
    }

    if (Error) (<any>Error).stackTraceLimit = 100;
}
