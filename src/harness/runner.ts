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

function runTests(tests: RunnerBase[]) {    if (reverse) {        tests = tests.reverse();    }    for (var i = iterations; i > 0; i--) {        for (var j = 0; j < tests.length; j++) {            tests[j].initializeTests();        }    }}var runners: RunnerBase[] = [];global.runners = runners;var reverse: boolean = false;var iterations: number = 1;
var opts = new TypeScript.OptionsParser(Harness.Environment, "testCompiler");
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

