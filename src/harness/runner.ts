//
// Copyright (c) Microsoft Corporation.  All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

///<reference path='..\compiler\optionsParser.ts' />
///<reference path='..\compiler\io.ts'/>
///<reference path='..\compiler\typescript.ts'/>
///<reference path='harness.ts'/>
///<reference path='exec.ts'/>
///<reference path='..\..\tests\runners\runnerfactory.ts' />
///<reference path='..\..\tests\runners\compiler\compilerRunner.ts' />
///<reference path='..\..\tests\runners\fourslash\fourslashRunner.ts' />
///<reference path='..\..\tests\runners\projects\projectsRunner.ts' />
///<reference path='..\..\tests\runners\unittest\unittestrunner.ts' />

declare var _inheritsFrom: any; // reference base inheritsFrom in child contexts.

function runTests(tests: RunnerBase[]) {    if (reverse) {        tests = tests.reverse();    }    for (var i = iterations; i > 0; i--) {        for (var j = 0; j < tests.length; j++) {            tests[j].initializeTests();        }    }}var runners: RunnerBase[] = [];global.runners = runners;var reverse: boolean = false;var iterations: number = 1;
var opts = new TypeScript.OptionsParser(Harness.IO, "testCompiler");
opts.flag('compiler', {
    set: function () {
        runners.push(new CompilerBaselineRunner(CompilerTestType.Conformance));
        runners.push(new CompilerBaselineRunner(CompilerTestType.Regressions));
        runners.push(new UnitTestRunner(UnittestTestType.Compiler));
        runners.push(new ProjectRunner());
    }
});

opts.flag('conformance', {
    set: function () {
        runners.push(new CompilerBaselineRunner(CompilerTestType.Conformance));
    }
});

opts.flag('project', {
    set: function () {
        runners.push(new ProjectRunner());
    }
});

opts.flag('fourslash', {
    set: function () {
        runners.push(new FourslashRunner());
    }
});

opts.flag('fourslash-generated', {
    set: function () {
        runners.push(new GeneratedFourslashRunner());
    }
});

opts.flag('unittests', {
    set: function () {
        runners.push(new UnitTestRunner(UnittestTestType.Compiler));
        runners.push(new UnitTestRunner(UnittestTestType.Samples));
    }
});

opts.flag('samples', {
    set: function () {
        runners.push(new UnitTestRunner(UnittestTestType.Samples));
    }
});

opts.flag('rwc', {
    set: function () {
        runners.push(new RWCRunner());
    }
});

opts.flag('ls', {
    set: function () {
        runners.push(new UnitTestRunner(UnittestTestType.LanguageService));
    }
});

opts.flag('services', {
    set: function () {
        runners.push(new UnitTestRunner(UnittestTestType.Services));
    }
});

opts.flag('harness', {
    set: function () {
        runners.push(new UnitTestRunner(UnittestTestType.Harness));
    }
});

//opts.option('dump', {
//    set: function (file) { Harness.registerLogger(new JSONLogger(file)); }
//});

opts.option('root', {
    usage: {
        locCode: 'Sets the root for the tests")',
        args: null
    },
    experimental: true,
    set: function (str) {
        Harness.userSpecifiedroot = str;
    }
});

opts.flag('reverse', {
    experimental: true,
    set: function () {
        reverse = true;
    }
});

opts.option('iterations', {
    experimental: true,
    set: function (str) {
        var val = parseInt(str);
        iterations = val < 1 ? 1 : val;
    }
});

// For running only compiler baselines with specific options like emit, decl files, etc
opts.flag('compiler-baselines', {
    set: function (str) {
        var conformanceRunner = new CompilerBaselineRunner(CompilerTestType.Conformance);
        conformanceRunner.options = str;
        runners.push(conformanceRunner);

        var regressionRunner = new CompilerBaselineRunner(CompilerTestType.Regressions);
        regressionRunner.options = str;
        runners.push(regressionRunner);
    }
});

// users can define tests to run in mytest.config that will override cmd line args, otherwise use cmd line args (test.config), otherwise no options
var mytestconfig = 'mytest.config';
var testconfig = 'test.config';
var testConfigFile =
    Harness.IO.fileExists(mytestconfig) ? Harness.IO.readFile(mytestconfig, null).contents :
    (Harness.IO.fileExists(testconfig) ? Harness.IO.readFile(testconfig, null).contents : '')

if (testConfigFile !== '') {
    // TODO: not sure why this is crashing mocha
    //var testConfig = JSON.parse(testConfigRaw);
    var testConfig = testConfigFile.match(/test:\s\['(.*)'\]/)
    opts.parse(testConfig ? [testConfig[1]] : [])
}

if (runners.length === 0) {
    if (opts.unnamed.length === 0 || opts.unnamed[0].indexOf('run.js') !== -1) {
        // compiler
        runners.push(new CompilerBaselineRunner(CompilerTestType.Conformance));
        runners.push(new CompilerBaselineRunner(CompilerTestType.Regressions));
        runners.push(new UnitTestRunner(UnittestTestType.Compiler));
        runners.push(new UnitTestRunner(UnittestTestType.LanguageService));

        //// TODO: project tests don't work in the browser yet
        if (Harness.currentExecutionEnvironment !== Harness.ExecutionEnvironment.Browser) {
            runners.push(new ProjectRunner());
        }

        // language services
        runners.push(new FourslashRunner());
        runners.push(new GeneratedFourslashRunner());

        // samples
        runners.push(new UnitTestRunner(UnittestTestType.Samples));
    } else {
        var runnerFactory = new RunnerFactory();
        var tests = opts.unnamed[0].split(' ');
        for (var i = 0; i < tests.length; i++) {
            runnerFactory.addTest(tests[i]);
        }
        runners = runnerFactory.getRunners();
    }
}

runTests(runners);

