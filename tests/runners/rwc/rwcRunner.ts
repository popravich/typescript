/// <reference path='..\..\..\src\harness\harness.ts'/>
/// <reference path='..\..\..\src\harness\exec.ts'/>
/// <reference path='..\..\..\src\compiler\optionsParser.ts'/>
/// <reference path='..\runnerbase.ts' />
/// <reference path='..\compiler\syntacticCleaner.ts' />
/// <reference path='loggedIO.ts' />

module RWC {
    class RWCEmitter implements Harness.Compiler.IEmitterIOHost {
        public outputs: { [filename: string]: string; } = {};

        constructor() { }

        writeFile(path: string, contents: string, writeByteOrderMark: boolean) {
            if (path in this.outputs) throw new Error('Emitter attempted to write to "' + path + '" twice');
            this.outputs[path] = contents;
        }

        directoryExists(s: string) {
            return false;
        }
        fileExists(s: string) {
            return true;
        }
        resolvePath(s: string) {
            return s;
        }
    }

    class RWCReferenceResolver implements TypeScript.IReferenceResolverHost {
        getScriptSnapshot(fileName: string): TypeScript.IScriptSnapshot {
            return TypeScript.ScriptSnapshot.fromString(TypeScript.IO.readFile(fileName, null).contents);
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
            normalizedPath = this.resolvePath(normalizedPath);

            // Switch to forward slashes
            normalizedPath = switchToForwardSlashes(normalizedPath);

            return normalizedPath;
        }

        resolvePath(path: string): string {
            return TypeScript.IO.resolvePath(path);
        }

        fileExists(path: string): boolean {
            return TypeScript.IO.fileExists(path);
        }
        directoryExists(path: string): boolean {
            return TypeScript.IO.directoryExists(path);
        }
        getParentDirectory(path: string): string {
            return TypeScript.IO.dirName(path);
        }
    }

    function createOptionsParser(io: typeof TypeScript.IO): { parser: TypeScript.OptionsParser; settings: TypeScript.CompilationSettings } {

        var optsParser = new TypeScript.OptionsParser(io, 'RWC');
        var options = new TypeScript.CompilationSettings();

        optsParser.option('out', {
            set(f) { options.outFileOption = f; }
        });
        optsParser.option('outDir', {
            set(f) { options.outDirOption = f; }
        });
        optsParser.flag('sourcemap', {
            set() { options.mapSourceFiles = true; }
        });
        optsParser.option('mapRoot', {
            set(f) { options.mapRoot = f; }
        });
        optsParser.option('sourceRoot', {
            set(f) { options.sourceRoot = f; }
        });
        optsParser.flag('declaration', {
            set() { options.generateDeclarationFiles = true; }
        }, 'd');
        optsParser.flag('propagateEnumConstants', {
            set() { options.propagateEnumConstants = true; }
        });
        optsParser.flag('removeComments', {
            set() { options.removeComments = true; }
        });
        optsParser.flag('noResolve', {
            set() { options.noResolve = true; }
        });
        optsParser.flag('nolib', {
            set() { options.noLib = true; }
        });
        optsParser.flag('noImplicitAny', {
            set() { options.noImplicitAny = true; }
        });
        optsParser.option('target', {
            set(t) {
                switch (t.toLocaleLowerCase()) {
                    case 'es3':
                        options.codeGenTarget = TypeScript.LanguageVersion.EcmaScript3;
                        break;
                    case 'es5':
                        options.codeGenTarget = TypeScript.LanguageVersion.EcmaScript5;
                        break;
                    default:
                        throw new Error('Unknown codegen target ' + t);
                }
            }
        });
        optsParser.option('module', {
            set(m) {
                switch (m.toLocaleLowerCase()) {
                    case 'amd':
                        options.moduleGenTarget = TypeScript.ModuleGenTarget.Asynchronous;
                        break;
                    case 'commonjs':
                        options.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
                        break;
                    default:
                        throw new Error('Unknown module target ' + m);
                }
            }
        });

        return { parser: optsParser, settings: options };
    }

    function runWithIOLog(ioLog: IOLog, fn: () => void) {
        var wrappedIO: PlaybackIO;
        if ((<PlaybackIO>TypeScript.IO).endRecord === undefined) {
            var wrappedIO = wrapIO(TypeScript.IO);
            TypeScript.IO = wrappedIO;
        } else {
            wrappedIO = <PlaybackIO>TypeScript.IO;
        }

        wrappedIO.startReplayFromData(ioLog);
        try {
            fn();
        } finally {
            wrappedIO.endReplay();
        }
    }

    function collateOutputs(emitterIOHost: RWCEmitter, fnTest: (s: string) => {}, clean?: (s: string) => string) {
        // Collect, test, and sort the filenames
        var files: string[] = [];
        for (var fn in emitterIOHost.outputs) {
            if (emitterIOHost.outputs.hasOwnProperty(fn) && fnTest(fn)) {
                files.push(fn);
            }
        }
        function cleanName(fn: string) {
            var lastSlash = TypeScript.switchToForwardSlashes(fn).lastIndexOf('/');
            return fn.substr(lastSlash + 1);
        }
        files.sort((a, b) => cleanName(a).localeCompare(cleanName(b)));

        // Emit them
        var result = '';
        files.forEach(fn => {
            // Some extra spacing if this isn't the first file
            if (result.length) result = result + '\r\n\r\n';

            // Filename header + content
            result = result + '/*====== ' + fn + ' ======*/\r\n';
            if (clean) {
                result = result + clean(emitterIOHost.outputs[fn]);
            } else {
                result = result + emitterIOHost.outputs[fn];
            }
        });
        return result;
    }

    export function runRWCTest(jsonPath: string) {
        var harnessCompiler = Harness.Compiler.getCompiler(Harness.Compiler.CompilerInstance.RunTime);
        var optsParser: { parser: TypeScript.OptionsParser; settings: TypeScript.CompilationSettings };

        var ioLog: IOLog = JSON.parse(TypeScript.IO.readFile(jsonPath, null).contents);
        var errors = '';

        it('has parsable options', () => {
            runWithIOLog(ioLog, () => {
                optsParser = createOptionsParser(TypeScript.IO);
                optsParser.parser.parse(ioLog.arguments);
            });
        });

        var emitterIOHost = new RWCEmitter();
        it('can compile', () => {
            runWithIOLog(ioLog, () => {
                harnessCompiler.reset();
                var resolver = new TypeScript.ReferenceResolver(optsParser.parser.unnamed, new RWCReferenceResolver(), false);
                var resolutionResult = resolver.resolveInputFiles();
                // Uniqueify all the filenames
                var inputList: string[] = optsParser.parser.unnamed;
                var addFilenameIfNotPresent = (fn: string) => {
                    if (inputList.indexOf(fn) === -1) inputList.push(fn);
                };
                resolutionResult.resolvedFiles.forEach(file => {
                    file.importedFiles.forEach(addFilenameIfNotPresent);
                    file.referencedFiles.forEach(addFilenameIfNotPresent);
                });

                harnessCompiler.reset();
                harnessCompiler.setCompilerSettingsFromSettings(optsParser.settings);

                var errors = '';
                inputList.forEach((item: string) => {
                    var resolvedPath = TypeScript.switchToForwardSlashes(TypeScript.IO.resolvePath(item));
                    var content = TypeScript.IO.readFile(resolvedPath, null).contents;
                    harnessCompiler.addInputFile({ unitName: resolvedPath, content: content });
                });

                harnessCompiler.compile();
                var compilationErrors = harnessCompiler.reportCompilationErrors();

                // Emit the results
                harnessCompiler.emitAll(emitterIOHost);
                harnessCompiler.emitAllDeclarations(emitterIOHost);

                // Create an error baseline
                compilationErrors.forEach(err => {
                    errors += TypeScript.TypeScriptCompiler.getFullDiagnosticText(err, path => TypeScript.switchToForwardSlashes(path));
                });
            });
        });

        // Baselines
        var baselineOpts: Harness.Baseline.BaselineOptions = { Subfolder: 'rwc' };

        var baseName = /(.*)\/(.*).json/.exec(jsonPath)[2];

        // Emitted JS
        Harness.Baseline.runBaseline('has the expected emitted code', baseName + '.output.js', () => {
            return collateOutputs(emitterIOHost, fn => fn.substr(fn.length - '.js'.length) === '.js', s => SyntacticCleaner.clean(s));
        }, false, baselineOpts);

        // Declaration files
        Harness.Baseline.runBaseline('has the expected declaration file content', baseName + '.d.ts', () => {
            var result = collateOutputs(emitterIOHost, fn => fn.substr(fn.length - '.d.ts'.length) === '.d.ts');
            return result.length > 0 ? result : null;
        }, false, baselineOpts);

        // Source maps
        Harness.Baseline.runBaseline('has the expected source maps', baseName + '.map', () => {
            var result = collateOutputs(emitterIOHost, fn => fn.substr(fn.length - '.map'.length) === '.map');
            return result.length > 0 ? result : null;
        }, false, baselineOpts);

        // Errors
        Harness.Baseline.runBaseline('has the expected errors', baseName + '.errors.txt', () => {
            return errors.length > 0 ? errors : null;
        }, false, baselineOpts);

        // TODO: Type baselines (need to refactor out from compilerRunner)
    }

}

class RWCRunner extends RunnerBase {
    private runnerPath = "tests/runners/rwc";
    private sourcePath = "tests/cases/rwc/";

    private harnessCompiler: Harness.Compiler.HarnessCompiler;

    /** Setup the runner's tests so that they are ready to be executed by the harness
     *  The first test should be a describe/it block that sets up the harness's compiler instance appropriately
     */
    public initializeTests(): void {
        // Recreate the compiler with the default lib
        Harness.Compiler.recreate(Harness.Compiler.CompilerInstance.RunTime, { useMinimalDefaultLib: false, noImplicitAny: false });
        this.harnessCompiler = Harness.Compiler.getCompiler(Harness.Compiler.CompilerInstance.RunTime);

        // Read in and evaluate the test list
        var testList = TypeScript.IO.dir(this.sourcePath, /.+\.json$/);
        for (var i = 0; i < testList.length; i++) {
            this.runTest(testList[i]);
        }
    }

    private runTest(jsonFilename: string) {
        describe("Testing a RWC project: " + jsonFilename, () => {
            RWC.runRWCTest(jsonFilename);
        });
    }
}
