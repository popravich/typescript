declare var require: any, process: any;
var fs: any = require('fs');
var path: any = require('path');

function instrumentForRecording(fn: string, tscPath: string) {
    instrument(tscPath, 'TypeScript.IO = wrapIO(TypeScript.IO); TypeScript.IO.startRecord("' + fn + '");', 'TypeScript.IO.endRecord();');
}

function instrumentForReplay(logFilename: string, tscPath: string) {
    instrument(tscPath, 'TypeScript.IO = wrapIO(TypeScript.IO); TypeScript.IO.startReplay("' + logFilename + '");');
}

function instrument(tscPath: string, prepareCode: string, cleanupCode: string = '') {
    var bak = tscPath + '.bak';
    fs.exists(bak, (backupExists: boolean) => {
        var filename = tscPath;
        if (backupExists) {
            filename = bak;
        }

        fs.readFile(filename, 'utf-8', (err: any, tscContent: string) => {
            if (err) throw err;

            fs.writeFile(bak, tscContent, (err: any) => {
                if (err) throw err;

                fs.readFile(path.resolve(tscPath + '/../loggedIO.js'), 'utf-8', (err: any, loggerContent: string) => {
                    if (err) throw err;

                    var magic1 = 'var batch = new TypeScript.BatchCompiler(TypeScript.IO);';
                    var magic2 = 'batch.batchCompile();';
                    var index1 = tscContent.indexOf(magic1);
                    var index2 = tscContent.indexOf(magic2);
                    var newContent = tscContent.substr(0, index1) + prepareCode + magic1 + magic2 + cleanupCode + tscContent.substr(index2 + magic2.length) + '\r\n' + loggerContent;
                    fs.writeFile(tscPath, newContent);
                });
            });
        });
    });
}

var isJson = (arg: string) => arg.indexOf(".json") > 0;

var record = process.argv.indexOf('record');
var tscPath = process.argv[process.argv.length - 1];
if (record >= 0) {
    console.log('Instrumenting ' + tscPath + ' for recording');
    instrumentForRecording(process.argv[record + 1], tscPath);
} else if(process.argv.some(isJson)) {
    var filename = process.argv.filter(isJson)[0];
    instrumentForReplay(filename, tscPath);
}


