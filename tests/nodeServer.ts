/// <reference path='..\samples\node\node.d.ts'/>

import http = require("http");
import url = require("url");
import path = require("path");
import fs = require("fs");
import querystring = require("querystring");
import child_process = require("child_process");

if (process.argv[2] == '--help') {
    console.log('Runs a node server on port 8888 by default, looking for tests folder in the current directory\n');
    console.log('Syntax: node nodeServer.js [port] [typescriptEnlistmentDirectory] [--verbose] [--browser]\n');
    console.log('Examples: \n\tnode nodeServer.js 8888 .');
    console.log('\tnode nodeServer.js 3000 D:/src/typescript/public --verbose IE');
    return;
}

function switchToForwardSlashes(path: string) {
    return path.replace(/\\/g, "/").replace(/\/\//g, '/');
}

var defaultPort = 8888;
var port = process.argv[2] || defaultPort;
var defaultRootDir = '../'; // ...\typescript\public
var rootDir = process.argv[3] || defaultRootDir;
rootDir = switchToForwardSlashes(rootDir);
var verbose = false;
if (process.argv[4] == '--verbose') {
    verbose = true;
} else if (process.argv[4] && process.argv[4] !== '--verbose') {
    console.log('Invalid command line arguments. Got ' + process.argv[4] + ' but expected --verbose or nothing.');
    return;
}
var browser: string;
if (process.argv[5]) {
    browser = process.argv[5];
    if (browser !== 'chrome' && browser !== 'IE') {
        console.log('Invalid command line arguments. Got ' + browser + ' but expected chrome, IE or nothing.');
        return;
    }
}

function log(msg: string) {
    if (verbose) {
        console.log(msg);
    }    
}

// fs.rmdirSync won't just delete directories with files in it
function deleteFolderRecursive (path:string) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

// Things normally done by 'jake runTests' before mocha would start
// This means simply refreshing the test browser page after the server is running isn't going to work
try {
    var localBaselinesPath = rootDir + '/tests/baselines/local';
    var localRwcBaselinesPath = rootDir + '/tests/baselines/rwc/local';
    if(fs.existsSync(localBaselinesPath)) {
        deleteFolderRecursive(localBaselinesPath);
        fs.mkdirSync(localBaselinesPath);
    }
    
    if(fs.existsSync(localRwcBaselinesPath)) {
        deleteFolderRecursive(localRwcBaselinesPath);
    }
} catch (e) {
    console.log('Failed initial setup of baselines directories.');
    console.log(e.toString());
}

///// Request processing code

// Copied from the compiler sources
function dir(path, spec?, options?) {
    options = options || <{ recursive?: boolean; }>{};

    function filesInFolder(folder: string): string[]{
        var folder = switchToForwardSlashes(folder);
        var paths: string[] = [];

        try {
            var files = fs.readdirSync(folder);
            for (var i = 0; i < files.length; i++) {
                var stat = fs.statSync(folder + "/" + files[i]);
                if (options.recursive && stat.isDirectory()) {
                    paths = paths.concat(filesInFolder(folder + "/" + files[i]));
                } else if (stat.isFile() && (!spec || files[i].match(spec))) {                    
                    var relativePath = folder.substring(folder.indexOf('/typescript/public') + 19); 
                    paths.push(relativePath + "/" + files[i]);
                }
            }
        } catch (err) {
            // Skip folders that are inaccessible
        }
        return paths;
    }

    return filesInFolder(path);
}

/// Send a generic 500 failure XHR
function sendFailure(response: http.ServerResponse, contents: string, logMessage?: string) {
    log("sendFailure " + (typeof logMessage === 'undefined' ? '' : logMessage));
    response.writeHead(500, { "Content-Type": "text/plain", 'Access-Control-Allow-Origin': '*' });
    response.write(contents + "\n");
    response.end();
}

/// Send a generic 200 success XHR
function sendSuccess(response: http.ServerResponse, contents: string, logMessage?: string) {
    //log("SUCCESS" + (typeof logMessage === 'undefined' ? '' : logMessage));
    response.writeHead(200, {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*'
    });
    response.write(contents, "binary");
    response.end();
}

/// Reads the data from a post request and passes it to the given callback
function processPost(request, response, callback: (data: string) => any) {
    var queryData = "";
    if (typeof callback !== 'function') return null;

    if (request.method == 'POST') {
        request.on('data', function (data) {
            queryData += data;
            if (queryData.length > 1e8) {
                queryData = "";
                response.writeHead(413, { 'Content-Type': 'text/plain' }).end();
                console.log("ERROR: destroying connection");
                request.connection.destroy();
            }
        });

        request.on('end', function () {
            response.post = querystring.parse(queryData);
            callback(queryData);
        });

    } else {
        response.writeHead(405, { 'Content-Type': 'text/plain' });
        response.end();
    }
}

http.createServer(function (request, response) {
    var uri = url.parse(request.url).pathname
    var filename = path.join(process.cwd(), uri);
    log('-----------HANDLING NEW REQEUST--------------');
    log(request.method + ' ' + request.url);
    //log(request.headers);
    // http://www.html5rocks.com/static/images/cors_server_flowchart.png
    if (request.method === 'OPTIONS') {
        response.writeHead(200, {
            'Access-Control-Allow-Methods': 'GET, POST',
            // don't think this is the 'right' list per se but it makes things work
            'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Access-Control-Allow-Origin, Access-Control-Allow-Headers',
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/html',
        });
        response.end();
        return;
    }
    if (request.method === 'GET') {
        // a read only operation
        if (request.url.indexOf('?') === -1) {
            fs.exists(filename, function (exists) {
                if (!exists) {
                    response.writeHead(404, { "Content-Type": "text/plain", 'Access-Control-Allow-Origin': '*' });
                    response.write("404 Not Found\n");
                    response.end();
                    return;
                }

                if (fs.statSync(filename).isDirectory()) {
                    var filesInFolder = dir(filename, ".ts", { recursive: true });
                    response.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
                    response.write(filesInFolder.join(','), "binary");
                    response.end();
                    return;
                }
                else {
                    fs.readFile(filename, "binary", function (err, file) {
                        if (err) {
                            sendFailure(response, err + '\n');
                            return;
                        }
                        sendSuccess(response, file);
                    });
                }
            });
        } else {
            var resolveRequest = request.url.match(/(.*)\?resolve/);
            if (resolveRequest) {
                var filePath = resolveRequest[1];
                response.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
                var resolvedPath = path.resolve(filePath, '');
                resolvedPath = resolvedPath.substring(resolvedPath.indexOf('tests'));
                resolvedPath = switchToForwardSlashes(resolvedPath);
                response.write(resolvedPath, "binary");
                response.end();
                return;
            }
        }
    }
    if (request.method === 'POST') {
        log('POST from ' + request.url);
        processPost(request, response, (data) => {
            var isWriteRequest = request.url.match('(.*)\?action=(.*)');
            if (isWriteRequest) {
                var writePath = isWriteRequest[1].substring(1, isWriteRequest[1].length - 1);
                var action = isWriteRequest[2].replace('?', '');
                var contents = data;
                function isFile(x) { return x.substring(x.lastIndexOf('/')).indexOf('.') !== -1; }
                log('POST ' + writePath + ' contents is ' + (contents ? 'not null' : 'null'));
                var actionType = action.trim().toUpperCase();
                if (actionType === 'WRITE') {
                    if (isFile(writePath)) {
                        try {
                            // write file
                            fs.writeFileSync(writePath, contents);
                            sendSuccess(response, '', 'wrote file: ' + writePath);
                            return;
                        }
                        catch (e) {
                            sendFailure(response, '', 'ERROR: failed to write file: ' + writePath);
                            console.log(e.toString());
                            return;
                        }
                    } else {
                        try {
                            // mkdir
                            fs.mkdirSync(writePath);
                            sendSuccess(response, '', 'wrote directory: ' + writePath);
                            return;
                        }
                        catch (e) {
                            sendFailure(response, '', 'ERROR: failed to write directory: ' + writePath);
                            console.log(e.toString());
                            return;
                        }
                    }
                } else if (actionType === 'DELETE') {
                    if (isFile(writePath)) {
                        try {
                            // delete file
                            fs.unlinkSync(writePath);
                            sendSuccess(response, '', 'deleted file: ' + writePath);
                            return;
                        } catch (e) {
                            sendFailure(response, '', 'ERROR: failed to delete file: ' + writePath);
                            console.log(e.toString());
                            return;
                        }

                    } else {
                        try {
                            // rmdir
                            fs.rmdirSync(writePath);
                            sendSuccess(response, '', 'deleted directory: ' + writePath);
                            return;
                        } catch (e) {
                            sendFailure(response, '', 'ERROR: failed to delete directory: ' + writePath);
                            console.log(e.toString());
                            return;
                        }
                    }
                } else if (actionType === 'APPEND') {
                    if (isFile(writePath)) {
                        try {
                            console.log('Appending to : ' + writePath);
                            fs.appendFileSync(writePath, contents);
                            sendSuccess(response, '', 'appended to file: ' + writePath);
                            return;
                        } catch (e) {
                            sendFailure(response, '', 'ERROR: failed to append to file: ' + writePath);
                            console.log(e.toString());
                            return;
                        }
                    } else {
                        sendFailure(response, '', 'ERROR: failed to append directory: ' + writePath);
                        return;
                    }
                } else {
                    sendFailure(response, '', 'ERROR: Unknown action type: ' + action);
                    return;
                }
            } else {
                sendFailure(response, '', "ERROR: Unexpected URL format: " + request.url);
                return;
            }
        });
    }
}).listen(port);

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");

var browserPath: string;
if ((browser && browser === 'chrome')) {
    var defaultChromePath = "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe";
    if (fs.existsSync(defaultChromePath)) {
        browserPath = defaultChromePath;
    } else {
        browserPath = browser;
    }
} else if (browser === 'IE' || !browser) {
    var defaultIEPath = 'C:/Program Files/Internet Explorer/iexplore.exe';
    if (fs.existsSync(defaultIEPath)) {
        browserPath = defaultIEPath;
    } else {
        browserPath = browser;
    }
}

log('Using browser: ' + browserPath);

child_process.spawn(browserPath, [process.cwd() + '/webTestResults.html'], (err, stdout, stderr) => {
    console.log("ERR: " + err.message);
    console.log("STDOUT: " + stdout.toString());
    console.log("STDERR: " + stderr.toString());
});