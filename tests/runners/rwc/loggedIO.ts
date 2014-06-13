/// <reference path="..\..\..\src\compiler\typescript.ts" />
/// <reference path="..\..\..\src\compiler\IO.ts" />

interface IOLog {
    arguments: string[];
    executingPath: string;
    filesRead: {
        path: string;
        codepage: number;
        result?: TypeScript.FileInformation;
    }[];
    filesWritten: {
        path: string;
        contents: string;
        bom: boolean;
    }[];
    filesDeleted: string[];
    filesAppended: {
        path: string;
        contents: string;
    }[];
    fileExists: {
        path: string;
        result?: boolean;
    }[];
    filesFound: {
        path: string;
        pattern: string;
        result?: TypeScript.IFindFileResult;
    }[];
    dirs: {
        path: string;
        re: string;
        re_m: boolean;
        re_g: boolean;
        re_i: boolean;
        opts: { recursive?: boolean; };
        result?: string[];
    }[];
    dirExists: {
        path: string;
        result?: boolean;
    }[];
    dirsCreated: string[];
    pathsResolved: {
        path: string;
        result?: string;
    }[];
}

interface PlaybackIO extends TypeScript.IIO {
    startReplayFromFile(logFilename: string): void;
    startReplayFromString(logContents: string): void;
    startReplayFromData(log: IOLog): void;
    endReplay(): void;
    startRecord(logFilename: string): void;
    endRecord(): void;
}

function wrapIO(underlying: TypeScript.IIO): PlaybackIO {
    var recordLog: IOLog = undefined;
    var replayLog: IOLog = undefined;
    var recordLogFilenameBase = '';

    var wrapper: PlaybackIO = <any>{};
    Object.keys(underlying).forEach(prop => {
        (<any>wrapper)[prop] = (<any>underlying)[prop];
    });

    wrapper.startReplayFromFile = logFn => {
        wrapper.startReplayFromString(underlying.readFile(logFn, null).contents);
    };
    wrapper.startReplayFromString = logString => {
        wrapper.startReplayFromData(JSON.parse(logString));
    };
    wrapper.startReplayFromData = log => {
        replayLog = log;
    };

    wrapper.endReplay = () => {
        replayLog = undefined;
    };

    wrapper.startRecord = (filenameBase) => {
        recordLogFilenameBase = filenameBase;
        recordLog = {
            arguments: [],
            filesRead: [],
            filesWritten: [],
            filesDeleted: [],
            filesAppended: [],
            fileExists: [],
            filesFound: [],
            dirs: [],
            dirExists: [],
            dirsCreated: [],
            pathsResolved: [],
            executingPath: ''
        };
    };

    wrapper.endRecord = () => {
        if (recordLog !== undefined) {
            var i = 0;
            var fn = () => recordLogFilenameBase + i + '.json';
            while (underlying.fileExists(fn())) i++;
            underlying.writeFile(fn(), JSON.stringify(recordLog), false);
            recordLog = undefined;
        }
    };

    function recordReplay<T extends Function>(original: T) {
        function createWrapper(record: T, replay: T): T {
            return <any>(() => {
                if (replayLog !== undefined) {
                    return replay.apply(undefined, arguments);
                } else if (recordLog !== undefined) {
                    return record.apply(undefined, arguments);
                } else {
                    return original.apply(underlying, arguments);
                }
            });
        }
        return createWrapper;
    }

    function callAndRecord<T, U>(underlyingResult: T, logArray: U[], logEntry: U): T {
        if (underlyingResult !== undefined) {
            (<any>logEntry).result = underlyingResult;
        }
        logArray.push(logEntry);
        return underlyingResult;
    }

    function findResultByFields<T>(logArray: { result?: T }[], expectedFields: {}, defaultValue?: T): T {
        var predicate = (entry: { result?: T }) => {
            return Object.getOwnPropertyNames(expectedFields).every((name) => (<any>entry)[name] === (<any>expectedFields)[name]);
        };
        var results = logArray.filter(entry => predicate(entry));
        if (results.length === 0) {
            if (defaultValue !== undefined) {
                return defaultValue;
            } else {
                throw new Error('No matching result in log array for ' + JSON.stringify(expectedFields));
            }
        }
        return results[0].result;
    }

    function findResultByPath<T>(logArray: { path: string; result?: T }[], expectedPath: string): T {
        var results = logArray.filter(e => pathsAreEquivalent(e.path, expectedPath));
        if (results.length === 0) {
            throw new Error('No matching result in log array for path' + expectedPath);
        }
        return results[0].result;
    }

    function pathsAreEquivalent(left: string, right: string) {
        function areSame(a: string, b: string) {
            return TypeScript.switchToForwardSlashes(a) === TypeScript.switchToForwardSlashes(b);
        }
        return areSame(left, right) || areSame(wrapper.resolvePath(left), right) || areSame(left, wrapper.resolvePath(right)) || areSame(wrapper.resolvePath(left), wrapper.resolvePath(right));
    }

    function noOpReplay(name: string) {
        console.log("Swallowed write operation during replay: " + name);
    }

    recordReplay(wrapper.appendFile)(
        (path, contents) => callAndRecord(underlying.appendFile(path, contents), recordLog.filesAppended, { path: path, contents: contents }),
        (path, codepage) => noOpReplay('appendFile'));

    Object.defineProperty(wrapper, 'arguments', {
        get() {
            if (replayLog !== undefined) {
                return replayLog.arguments;
            } else if (recordLog !== undefined) {
                recordLog.arguments = underlying.arguments;
            }
            return underlying.arguments;
        }
    });

    wrapper.createDirectory = recordReplay(wrapper.createDirectory)(
        (path) => callAndRecord(underlying.createDirectory(path), recordLog.dirsCreated, { path: path }),
        (path) => noOpReplay('createDirectory'));

    wrapper.deleteFile = recordReplay(wrapper.deleteFile)(
        (path) => callAndRecord(underlying.deleteFile(path), recordLog.filesDeleted, { path: path }),
        (path) => noOpReplay('deleteFile'));

    wrapper.dir = recordReplay(wrapper.dir)(
        (path, re?, opts?) => callAndRecord(underlying.dir(path, re, opts), recordLog.dirs, { path: path, re: re.source, re_m: re.multiline, re_g: re.global, re_i: re.ignoreCase, opts: opts }),
        (path, re?, opts?) => findResultByFields(replayLog.dirs, { path: path, re: re.source, re_m: re.multiline, re_g: re.global, re_i: re.ignoreCase, opts: opts }));

    wrapper.directoryExists = recordReplay(wrapper.directoryExists)(
        (path) => callAndRecord(underlying.directoryExists(path), recordLog.dirExists, { path: path }),
        (path) => findResultByFields(replayLog.dirExists, { path: path }));

    wrapper.fileExists = recordReplay(wrapper.fileExists)(
        (path) => callAndRecord(underlying.fileExists(path), recordLog.fileExists, { path: path }),
        (path) => findResultByFields(replayLog.fileExists, { path: path }, false));

    wrapper.getExecutingFilePath = () => {
        if (replayLog !== undefined) {
            return replayLog.executingPath;
        } else if (recordLog !== undefined) {
            return recordLog.executingPath = underlying.getExecutingFilePath();
        } else {
            return underlying.getExecutingFilePath();
        }
    };

    wrapper.resolvePath = recordReplay(wrapper.resolvePath)(
        (path) => callAndRecord(underlying.resolvePath(path), recordLog.pathsResolved, { path: path }),
        (path) => findResultByFields(replayLog.pathsResolved, { path: path }, path));

    wrapper.readFile = recordReplay(wrapper.readFile)(
        (path, codepage) => callAndRecord(underlying.readFile(path, codepage), recordLog.filesRead, { path: path, codepage: codepage }),
        (path, codepage) => {
            return findResultByPath(replayLog.filesRead, path);
        });

    wrapper.writeFile = recordReplay(wrapper.writeFile)(
        (path, contents, writeBom) => callAndRecord(underlying.writeFile(path, contents, writeBom), recordLog.filesWritten, { path: path, contents: contents, bom: writeBom }),
        (path, contents, writeBom) => noOpReplay('writeFile'));

    wrapper.quit = (exitCode) => {
        if (recordLog !== undefined) {
            wrapper.endRecord();
        }
        underlying.quit(exitCode);
    };

    return wrapper;
}

