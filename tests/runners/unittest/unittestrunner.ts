///<reference path="../../../src/harness/harness.ts" />
///<reference path="../runnerbase.ts" />

enum UnittestTestType {
    Compiler,
    LanguageService,
    Services,
    Harness,
    Samples
}

class UnitTestRunner extends RunnerBase {
    constructor(public testType?: UnittestTestType) {
        super();
    }

    public initializeTests() {
        switch (this.testType) {
            case UnittestTestType.Compiler:
                this.tests = this.enumerateFiles('tests/cases/unittests/compiler');
                break;
            case UnittestTestType.LanguageService:
                this.tests = this.enumerateFiles('tests/cases/unittests/ls');
                break;
            //case UnittestTestType.Services:
            //    this.tests = this.enumerateFiles('tests/cases/unittests/services');
            //    break;
            case UnittestTestType.Harness:
                this.tests = this.enumerateFiles('tests/cases/unittests/harness');
                break;
            case UnittestTestType.Samples:
                this.tests = this.enumerateFiles('tests/cases/unittests/samples');
                break;
            default:
                if (this.tests.length === 0) {
                    throw new Error('Unsupported test cases: ' + this.testType);
                }
                break;
        }

        var outfile = new Harness.Compiler.WriterAggregator()
        var outerr = new Harness.Compiler.WriterAggregator();
        var harnessCompiler = Harness.Compiler.getCompiler(Harness.Compiler.CompilerInstance.DesignTime);

        var toBeAdded = this.tests.map(test => {
            return { unitName: test, content: Harness.IO.readFile(test, /*codepage:*/ null).contents }
        });
        harnessCompiler.addInputFiles(toBeAdded);
        harnessCompiler.compile({ noResolve: true });
        
        var stdout = new Harness.Compiler.EmitterIOHost();
        var emitDiagnostics = harnessCompiler.emitAll(stdout);
        var results = stdout.toArray();
        var lines: string[] = [];
        results.forEach(v => lines = lines.concat(v.file.lines));
        var code = lines.join("\n")

        describe("Setup compiler for compiler unittests", () => {
            harnessCompiler = Harness.Compiler.recreate(Harness.Compiler.CompilerInstance.RunTime, { useMinimalDefaultLib: this.testType !== UnittestTestType.Samples, noImplicitAny: false });
        });

        var nodeContext: any = undefined;
        if (Harness.currentExecutionEnvironment == Harness.ExecutionEnvironment.Node) {
            nodeContext = {
                require: require,
                TypeScript: TypeScript,
                process: process,
                describe: describe,
                it: it,
                assert: assert,
                Harness: Harness,
                IO: Harness.IO,
                Exec: Exec,
                Services: TypeScript.Services,
                FourSlash: FourSlash
            };
        }
        Utils.evalFile(code, "generated_test_code.js", nodeContext);

        // make sure the next unittestrunner doesn't include the previous one's stuff
        harnessCompiler = Harness.Compiler.recreate(Harness.Compiler.CompilerInstance.DesignTime);
    }
}