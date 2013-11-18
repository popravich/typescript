///<reference path='..\..\src\compiler\io.ts' />
///<reference path='..\..\src\services\typescriptServices.ts' />

module Editor {
    var gloError = false;
    var lineCollectionCapacity = 4;
    var indentStrings: string[] = [];
    var indentBase = "    ";
    function getIndent(indentAmt: number) {
        if (!indentStrings[indentAmt]) {
            indentStrings[indentAmt] = "";
            for (var i = 0; i < indentAmt; i++) {
                indentStrings[indentAmt] += indentBase;
            }
        }
        return indentStrings[indentAmt];
    }

    function editFlat(s: number, dl: number, nt: string, source: string) {
        return source.substring(0, s) + nt + source.substring(s + dl, source.length);
    }

    function showLines(s: string) {
        var strBuilder = "";
        for (var i = 0, len = s.length; i < len; i++) {
            if (s.charCodeAt(i) == 10) {
                strBuilder += '\\n';
            }
            else if (s.charCodeAt(i) == 13) {
                strBuilder += '\\r';
            }
            else {
                strBuilder += s.charAt(i);
            }
        }
        return strBuilder;
    }

    function editTest() {
        var fname = 'tests\\versionCache\\editme';
        var content = TypeScript.IO.readFile(fname, null);
        var lm = TypeScript.LineIndex.linesFromText(content.contents);
        var lines = lm.lines;
        if (lines.length == 0) {
            return;
        }
        var lineMap = lm.lineMap;

        var lineIndex = new TypeScript.LineIndex();
        lineIndex.load(lines);

        var editedText = lineIndex.getText(0, content.contents.length);

        var snapshot: TypeScript.LineIndex;
        var checkText: string;
        var insertString: string;

        // Case VII: insert at end of file
        insertString = "hmmmm...\r\n";
        checkText = editFlat(content.contents.length,0,insertString,content.contents);
        snapshot = lineIndex.edit(content.contents.length, 0, insertString);
        editedText = snapshot.getText(0, checkText.length);
        if (editedText != checkText) {
            gloError = true;
            return;
        }

        // Case IV: unusual line endings merge
        snapshot = lineIndex.edit(lines[0].length-1,lines[1].length, "");
        editedText = snapshot.getText(0, content.contents.length - lines[1].length);
        checkText = editFlat(lines[0].length-1, lines[1].length, "", content.contents);
        if (editedText != checkText) {
            gloError = true;
            return;
        }


        // Case VII: delete whole line and nothing but line
        snapshot = lineIndex.edit(0, lines[0].length, "");
        editedText = snapshot.getText(0, content.contents.length - lines[0].length);
        checkText = editFlat(0, lines[0].length, "" , content.contents);
        if (editedText != checkText) {
            gloError = true;
            return;
        }

        // and insert with no line breaks
        insertString = "moo, moo, moo! ";
        snapshot = lineIndex.edit(0, lines[0].length, insertString);
        editedText = snapshot.getText(0, content.contents.length - lines[0].length + insertString.length);
        checkText = editFlat(0, lines[0].length, insertString, content.contents);
        if (editedText != checkText) {
            gloError = true;
            return;
        }

        // and insert with multiple line breaks
        insertString = "moo, \r\nmoo, \r\nmoo! ";
        snapshot = lineIndex.edit(0, lines[0].length, insertString);
        editedText = snapshot.getText(0, content.contents.length - lines[0].length + insertString.length);
        checkText = editFlat(0, lines[0].length, insertString, content.contents);
        if (editedText != checkText) {
            gloError = true;
            return;
        }

        snapshot = lineIndex.edit(0, lines[0].length + lines[1].length, "");
        editedText = snapshot.getText(0, content.contents.length - (lines[0].length+lines[1].length));
        checkText = editFlat(0, lines[0].length+ lines[1].length, "", content.contents);
        if (editedText != checkText) {
            gloError = true;
            return;
        }

        snapshot = lineIndex.edit(lines[0].length, lines[1].length + lines[2].length, "");

        editedText = snapshot.getText(0, content.contents.length - (lines[1].length + lines[2].length));
        checkText = editFlat(lines[0].length, lines[1].length + lines[2].length, "", content.contents);
        if (editedText != checkText) {
            gloError = true;
            return;
        }

        // Case VI: insert multiple line breaks

        insertString = "cr...\r\ncr...\r\ncr...\r\ncr...\r\ncr...\r\ncr...\r\ncr...\r\ncr...\r\ncr...\r\ncr...\r\ncr...\r\ncr";
        snapshot = lineIndex.edit(21, 1, insertString);
        editedText = snapshot.getText(0, content.contents.length + insertString.length - 1);
        checkText = editFlat(21, 1, insertString, content.contents);
        if (editedText != checkText) {
            gloError = true;
            return;
        }

        insertString = "cr...\r\ncr...\r\ncr";
        snapshot = lineIndex.edit(21, 1, insertString);
        editedText = snapshot.getText(0, content.contents.length + insertString.length - 1);
        checkText = editFlat(21, 1, insertString, content.contents);
        if (editedText != checkText) {
            gloError = true;
            return;
        }

        // leading '\n'
        insertString = "\ncr...\r\ncr...\r\ncr";
        snapshot = lineIndex.edit(21, 1, insertString);
        editedText = snapshot.getText(0, content.contents.length + insertString.length - 1);
        checkText = editFlat(21, 1, insertString, content.contents);
        if (editedText != checkText) {
            gloError = true;
            return;
        }

        // Case I: single line no line breaks deleted or inserted
        // delete 1 char
        snapshot = lineIndex.edit(21, 1);
        editedText = snapshot.getText(0, content.contents.length - 1);
        checkText = editFlat(21, 1, "", content.contents);
        if (editedText != checkText) {
            gloError = true;
            return;
        }

        // insert 1 char
        snapshot = lineIndex.edit(21, 0, "b");
        editedText = snapshot.getText(0, content.contents.length + 1);
        checkText = editFlat(21, 0, "b", content.contents);
        if (editedText != checkText) {
            gloError = true;
            return;
        }

        // delete 1, insert 2
        snapshot = lineIndex.edit(21, 1, "cr");
        editedText = snapshot.getText(0, content.contents.length + 1);
        checkText = editFlat(21, 1, "cr", content.contents);
        if (editedText != checkText) {
            gloError = true;
            return;
        }

        // Case II: delete across line break
        snapshot = lineIndex.edit(21, 22);
        editedText = snapshot.getText(0, content.contents.length -22);
        checkText = editFlat(21, 22, "", content.contents);
        if (editedText != checkText) {
            gloError = true;
            return;
        }

        snapshot = lineIndex.edit(21, 32);
        editedText = snapshot.getText(0, content.contents.length - 32);
        checkText = editFlat(21, 32, "", content.contents);
        if (editedText != checkText) {
            gloError = true;
            return;
        }

        // Case III: delete across multiple line breaks and insert no line breaks
        snapshot = lineIndex.edit(21, 42);
        editedText = snapshot.getText(0, content.contents.length - 42);
        checkText = editFlat(21, 42, "", content.contents);
        if (editedText != checkText) {
            gloError = true;
            return;
        }

        snapshot = lineIndex.edit(21, 42, "slithery ");
        editedText = snapshot.getText(0, content.contents.length - 33);
        checkText = editFlat(21, 42, "slithery ", content.contents);
        if (editedText != checkText) {
            gloError = true;
            return;
        }
    }


    function editStress(fname: string, timing: boolean) {
        var content = TypeScript.IO.readFile(fname, null);
        var lm = TypeScript.LineIndex.linesFromText(content.contents);
        var lines = lm.lines;
        if (lines.length == 0) {
            return;
        }
        var lineMap = lm.lineMap;

        var lineIndex = new TypeScript.LineIndex();
        lineIndex.load(lines);
        var totalChars = content.contents.length;
        var rsa:number[]= [];
        var la:number[] = [];
        var las:number[] = [];
        var elas:number[] = [];
        var ersa:number[] = [];
        var ela:number[] = [];
        var etotalChars = totalChars;
        var j:number;
        
        var startTime:number;
        for (j = 0; j < 100000; j++) {
            rsa[j] = Math.floor(Math.random() * totalChars);
            la[j] = Math.floor(Math.random() * (totalChars - rsa[j]));
            if (la[j] > 4) {
                las[j] = 4;
            }
            else {
                las[j] = la[j];
            }
            if (j < 4000) {
                ersa[j] = Math.floor(Math.random() * etotalChars);
                ela[j] = Math.floor(Math.random() * (etotalChars - ersa[j]));
                if (ela[j] > 4) {
                    elas[j] = 4;
                }
                else {
                    elas[j] = ela[j];
                }
                etotalChars += (las[j] - elas[j]);
            }
        }
        if (timing) {
            startTime = Date.now();
        }
        for (j = 0; j < 2000; j++) {
            var s2 = lineIndex.getText(rsa[j], la[j]);
            if (!timing) {
                var s1 = content.contents.substring(rsa[j], rsa[j] + la[j]);
                if (s1 != s2) {
                    gloError = true;
                    return;
                }
            }
        }
        if (timing) {
            TypeScript.IO.printLine("range (average length 1/4 file size): " + ((Date.now() - startTime) / 2).toFixed(3) + " us");
        }
        if (timing) {
            startTime = Date.now();
        }
        for (j = 0; j < 10000; j++) {
            var s2 = lineIndex.getText(rsa[j], las[j]);
            if (!timing) {
                var s1 = content.contents.substring(rsa[j], rsa[j] + las[j]);
                if (s1 != s2) {
                    gloError = true;
                    return;
                }
            }
        }
        if (timing) {
            TypeScript.IO.printLine("range (average length 4 chars): " + ((Date.now() - startTime) / 10).toFixed(3) + " us");
        }

        if (timing) {
            startTime = Date.now();
        }
        var snapshot: TypeScript.LineIndex;
        for (j = 0; j < 2000; j++) {
            var insertString = content.contents.substring(rsa[100000 - j], rsa[100000 - j] + las[100000 - j]);
            snapshot = lineIndex.edit(rsa[j], las[j], insertString);
            if (!timing) {
                var checkText = editFlat(rsa[j], las[j], insertString, content.contents);
                var snapText = snapshot.getText(0, checkText.length);
                if (checkText != snapText) {
                    if (s1 != s2) {
                        gloError = true;
                        return;
                    }
                }
            }
        }
        if (timing) {
            TypeScript.IO.printLine("edit (average length 4): " + ((Date.now() - startTime) / 2).toFixed(3) + " us");
        }

        var svc = TypeScript.ScriptVersionCache.fromString(content.contents);
        checkText = content.contents;
        if (timing) {
            startTime = Date.now();
        }
        for (j = 0; j < 2000; j++) {
            insertString = content.contents.substring(rsa[j], rsa[j] + las[j]);
            svc.edit(ersa[j], elas[j], insertString);
            if (!timing) {
                checkText = editFlat(ersa[j], elas[j], insertString, checkText);
            }
            if (0 == (j % 4)) {
                var snap = svc.getSnapshot();
                if (!timing) {
                    snapText = snap.getText(0, checkText.length);
                    if (checkText != snapText) {
                        if (s1 != s2) {
                            gloError = true;
                            return;
                        }
                    }
                }
            }
        }
        if (timing) {
            TypeScript.IO.printLine("edit ScriptVersionCache: " + ((Date.now() - startTime) / 2).toFixed(3) + " us");
        }

        if (timing) {
            startTime = Date.now();
        }
        for (j = 0; j < 5000; j++) {
            insertString = content.contents.substring(rsa[100000 - j], rsa[100000 - j] + la[100000 - j]);
            snapshot = lineIndex.edit(rsa[j], la[j], insertString);
            if (!timing) {
                checkText = editFlat(rsa[j], la[j], insertString, content.contents);
                snapText = snapshot.getText(0, checkText.length);
                if (checkText != snapText) {
                    if (s1 != s2) {
                        gloError = true;
                        return;
                    }
                }
            }
        }
        if (timing) {
            TypeScript.IO.printLine("edit (average length 1/4th file size): " + ((Date.now() - startTime) / 5).toFixed(3) + " us");
        }

        var t: TypeScript.LineAndCharacter;
        var errorCount = 0;
        if (timing) {
            startTime = Date.now();
        }

        for (j = 0; j < 100000; j++) {
            var lp = lineIndex.charOffsetToLineNumberAndPos(rsa[j]);

            if (!timing) {
                var lac = lineMap.getLineAndCharacterFromPosition(rsa[j]);

                if (lac.line() != (lp.line - 1)) {
                    gloError = true;
                    return;
                }
                if (lac.character() != (lp.offset)) {
                    gloError = true;
                    return;
                }
            }
        }
        if (timing) {
            TypeScript.IO.printLine("line/offset from pos: " + ((Date.now() - startTime) / 100).toFixed(3) + " us");
        }

        if (timing) {
            startTime = Date.now();
        }

        var outer = 1;
        if (timing) {
            outer = 100;
        }
        for (var ko = 0; ko < outer; ko++) {
            for (var k = 0, llen = lines.length; k < llen; k++) {
                var lineIndexLine = lineIndex.lineNumberToCharOffset(k + 1);
                if (!timing) {
                    var lineMapLine = lineMap.getLineStartPosition(k);
                    if (lineIndexLine != lineMapLine) {
                        gloError = true;
                        return;
                    }
                }
            }
        }
        if (timing) {
            TypeScript.IO.printLine("start pos from line: " + (((Date.now() - startTime) / lines.length) * 10).toFixed(3) + " us");
        }
    }

    export class ScriptInfo {
        svc: TypeScript.ScriptVersionCache;

        constructor(public fileName: string, public fileInfo: TypeScript.FileInformation, public isOpen = true) {
            this.svc = TypeScript.ScriptVersionCache.fromString(fileInfo.contents);
        }

 
        public snap() {
            return this.svc.getSnapshot();
        }

        public editContent(minChar: number, limChar: number, newText: string): void {
            this.svc.edit(minChar, limChar - minChar, newText);
        }

        public getTextChangeRangeBetweenVersions(startVersion: number, endVersion: number): TypeScript.TextChangeRange {
            return this.svc.getTextChangesBetweenVersions(startVersion, endVersion);
        }
    }


    var libFolder = "";
    //export var libText = TypeScript.IO.readFile(libFolder + "lib.d.ts");
    export function readFile(path: string) {
        var content = TypeScript.IO.readFile(path, null);
        return content;
    }


    export class LSDiag implements TypeScript.Services.ILanguageServicesDiagnostics {

        constructor(private destination: string) { }

        public log(content: string): void {
            //Imitates the LanguageServicesDiagnostics object when not in Visual Studio
        }

    }

    export class LSHost implements TypeScript.Services.ILanguageServiceHost, TypeScript.Services.ICoreServicesHost {
        private ls: TypeScript.Services.ILanguageService = null;
        logger: TypeScript.ILogger;
        private compilationSettings: TypeScript.CompilationSettings = null;

        private fileNameToScript = new TypeScript.StringHashTable<ScriptInfo>();

        constructor() {
            this.logger = this;
        }

        getLocalizedDiagnosticMessages() {
            // TODO
        }

        public addDefaultLibrary() {
            //this.addScript("lib.d.ts", libText);
        }

        getDiagnosticsObject() {
            return new LSDiag("");
        }

        getScriptByteOrderMark(fileName: string) {
            return this.getScriptInfo(fileName).fileInfo.byteOrderMark;
        }

        getScriptSnapshot(fileName: string): TypeScript.IScriptSnapshot {
            return this.getScriptInfo(fileName).snap();
        }
                
        getCompilationSettings() {
            return this.compilationSettings;
        }

        getScriptFileNames() {
            return this.fileNameToScript.getAllKeys();
        }

        getScriptVersion(fileName: string) {
            return this.getScriptInfo(fileName).svc.latestVersion();
        }

        getScriptIsOpen(fileName: string) {
            return this.getScriptInfo(fileName).isOpen;
        }

        public addFile(fileName: string) {
            var fileInfo = TypeScript.IO.readFile(name, null);
            this.addScript(name, fileInfo);
        }

        getScriptInfo(fileName: string): ScriptInfo {
            return this.fileNameToScript.lookup(fileName);
        }

        public addScript(fileName: string, fileInfo: TypeScript.FileInformation) {
            var script = new ScriptInfo(fileName, fileInfo);
            this.fileNameToScript.add(fileName, script);
            return script;
        }

        public editScript(fileName: string, minChar: number, limChar: number, newText: string) {
            var script = this.getScriptInfo(fileName);
            if (script !== null) {
                script.editContent(minChar, limChar, newText);
                return;
            }

            throw new Error("No script with name '" + fileName + "'");
        }
        /// IReferenceResolverHost implementation
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
            normalizedPath = TypeScript.switchToForwardSlashes(normalizedPath);

            return normalizedPath;
        }

        resolvePath(path: string): string {
            var start = new Date().getTime();
            var result = TypeScript.IO.resolvePath(path);
            return result;
        }

        fileExists(path: string): boolean {
            var start = new Date().getTime();
            var result = TypeScript.IO.fileExists(path);
            return result;
        }

        directoryExists(path: string): boolean {
            return TypeScript.IO.directoryExists(path);
        }
        getParentDirectory(path: string): string {
            return TypeScript.IO.dirName(path);
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
            //TypeScript.IO.printLine("TypeScriptLS:" + s);
        }
    }

    export class CompilerService {
        serviceFactory = new TypeScript.Services.TypeScriptServicesFactory();
        host = new LSHost();
        languageService: TypeScript.Services.ILanguageService;
        coreService: TypeScript.Services.CoreServices;
        classifier: TypeScript.Services.Classifier;
        settings = new TypeScript.CompilationSettings();
   
        constructor() {
            this.languageService = this.serviceFactory.createPullLanguageService(this.host);
            this.coreService = this.serviceFactory.createCoreServices(this.host);
            this.classifier = this.serviceFactory.createClassifier(this.host);
        }

        openFile(filename: string) {
            var info = this.host.getScriptInfo(filename);
            if (info == null) {
                var fileInfo = TypeScript.IO.readFile(filename, null);
                info = this.host.addScript(filename, fileInfo);
                var preProcessedInfo = TypeScript.preProcessFile(filename, TypeScript.ScriptSnapshot.fromString(fileInfo.contents),false);
                if (preProcessedInfo.referencedFiles.length > 0) {
                    for (var i = 0, len = preProcessedInfo.referencedFiles.length; i < len; i++) {
                        var refFilename = preProcessedInfo.referencedFiles[i].path;
                        this.openFile(refFilename);
                    }
                }
            }
            return info;
        }

    }

    export function lsTest() {
        var compilerService = new CompilerService();
        var info = compilerService.openFile("tests\\versionCache\\tst.ts");
        var typeInfo = compilerService.languageService.getTypeAtPosition("tests\\versionCache\\z.ts", 0);
        if (typeInfo.memberName.toString()!="{ zebra: number; giraffe: string; }") {
            gloError = true;
            return;
        }
        compilerService.host.editScript("tests/versionCache/z.ts", 2, 9, "zebra");
        typeInfo = compilerService.languageService.getTypeAtPosition("tests\\versionCache\\z.ts", 2);
        if (typeInfo.memberName.toString()!="number") {
            gloError = true;
            return;
        }
        compilerService.host.editScript("tests/versionCache/z.ts", 2, 7, "giraffe");
        typeInfo = compilerService.languageService.getTypeAtPosition("tests\\versionCache\\z.ts", 2);
        if (typeInfo.memberName.toString()!="string") {
            gloError = true;
            return;
        }
        var snapshot = compilerService.host.getScriptSnapshot("tests/versionCache/z.ts");
        var text = snapshot.getText(0, snapshot.getLength());
        var tinsertString = "class Manimal {\r\n    location: Point;\r\n}\r\n";
        compilerService.host.editScript("tests\\versionCache\\tst.ts", 0, 0, tinsertString);
        var insertString = ";\r\nvar m = new Manimal();\r\nm.location"
        compilerService.host.editScript("tests/versionCache/z.ts", text.length - 1, text.length - 1, insertString);
        var offset = text.length + 28;
        typeInfo = compilerService.languageService.getTypeAtPosition("tests\\versionCache\\z.ts", offset);
        if (typeInfo.memberName.toString()!="Point") {
            gloError = true;
            return;
        }
    }

    function bigTest() {
        editStress("src\\compiler\\ast.ts", false);
        editStress("typings\\lib.d.ts", false);
    }

    editTest();
    if (!gloError) {
        lsTest();
    }
    if (!gloError) {
        bigTest();
    }
    if (gloError) {
        TypeScript.IO.printLine(" ! Fail: versionCache");
    }
    else {
        TypeScript.IO.printLine("Pass"); 
    }
}

