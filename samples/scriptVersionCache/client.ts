///<reference path='..\..\src\compiler\io.ts' />
///<reference path='..\..\src\services\typescriptServices.ts' />

module Editor {
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

    function editTest2() {
        var fname = 'cl.ts';
        var content = TypeScript.IO.readFile(fname, null);
        var lm = TypeScript.LineIndex.linesFromText(content.contents);
        var lines = lm.lines;
        if (lines.length == 0) {
            return;
        }
        var lineMap = lm.lineMap;
        TypeScript.IO.printLine(fname + ": " + lines.length + " lines");

        var lineIndex = new TypeScript.LineIndex();
        lineIndex.load(lines);

        var editedText = lineIndex.getText(0, content.contents.length);
        lineIndex.print();
        TypeScript.IO.printLine(editedText);
    }

    function editTest() {
        var fname = 'editme';
        var content = TypeScript.IO.readFile(fname, null);
        var lm = TypeScript.LineIndex.linesFromText(content.contents);
        var lines = lm.lines;
        if (lines.length == 0) {
            return;
        }
        var lineMap = lm.lineMap;
        TypeScript.IO.printLine(fname + ": " + lines.length + " lines");

        var lineIndex = new TypeScript.LineIndex();
        lineIndex.load(lines);

        var editedText = lineIndex.getText(0, content.contents.length);
        lineIndex.print();
        TypeScript.IO.printLine(editedText);

        // print via 'every' function
        lineIndex.every((ll: TypeScript.LineLeaf) => {
            TypeScript.IO.print(ll.text);
            return true;
        }, 0);
        TypeScript.IO.printLine("...from every");
        var snapshot: TypeScript.LineIndex;
        var checkText: string;
        var insertString: string;

        // Case VII: insert at end of file
        insertString = "hmmmm...\r\n";
        checkText = editFlat(content.contents.length,0,insertString,content.contents);
        snapshot = lineIndex.edit(content.contents.length, 0, insertString);
        snapshot.print();
        editedText = snapshot.getText(0, checkText.length);
        TypeScript.IO.printLine(showLines(editedText));
        TypeScript.IO.printLine(checkText);

        // Case IV: unusual line endings merge
        snapshot = lineIndex.edit(lines[0].length-1,lines[1].length, "");
        snapshot.print();
        editedText = snapshot.getText(0, content.contents.length - lines[1].length);
        checkText = editFlat(lines[0].length-1, lines[1].length, "", content.contents);
        TypeScript.IO.printLine(editedText);
        TypeScript.IO.printLine(checkText);


        // Case VII: delete whole line and nothing but line
        snapshot = lineIndex.edit(0, lines[0].length, "");
        snapshot.print();
        editedText = snapshot.getText(0, content.contents.length - lines[0].length);
        checkText = editFlat(0, lines[0].length, "" , content.contents);
        TypeScript.IO.printLine(editedText);
        TypeScript.IO.printLine(checkText);

        // and insert with no line breaks
        insertString = "moo, moo, moo! ";
        snapshot = lineIndex.edit(0, lines[0].length, insertString);
        snapshot.print();
        editedText = snapshot.getText(0, content.contents.length - lines[0].length + insertString.length);
        checkText = editFlat(0, lines[0].length, insertString, content.contents);
        TypeScript.IO.printLine(editedText);
        TypeScript.IO.printLine(checkText);

        // and insert with multiple line breaks
        insertString = "moo, \r\nmoo, \r\nmoo! ";
        snapshot = lineIndex.edit(0, lines[0].length, insertString);
        snapshot.print();
        editedText = snapshot.getText(0, content.contents.length - lines[0].length + insertString.length);
        checkText = editFlat(0, lines[0].length, insertString, content.contents);
        TypeScript.IO.printLine(editedText);
        TypeScript.IO.printLine(checkText);

        snapshot = lineIndex.edit(0, lines[0].length + lines[1].length, "");
        snapshot.print();
        editedText = snapshot.getText(0, content.contents.length - (lines[0].length+lines[1].length));
        checkText = editFlat(0, lines[0].length+ lines[1].length, "", content.contents);
        TypeScript.IO.printLine(editedText);
        TypeScript.IO.printLine(checkText);

        snapshot = lineIndex.edit(lines[0].length, lines[1].length + lines[2].length, "");
        snapshot.print();
        editedText = snapshot.getText(0, content.contents.length - (lines[1].length + lines[2].length));
        checkText = editFlat(lines[0].length, lines[1].length + lines[2].length, "", content.contents);
        TypeScript.IO.printLine(editedText);
        TypeScript.IO.printLine(checkText);

        // Case VI: insert multiple line breaks

        insertString = "cr...\r\ncr...\r\ncr...\r\ncr...\r\ncr...\r\ncr...\r\ncr...\r\ncr...\r\ncr...\r\ncr...\r\ncr...\r\ncr";
        snapshot = lineIndex.edit(21, 1, insertString);
        snapshot.print();
        editedText = snapshot.getText(0, content.contents.length + insertString.length - 1);
        checkText = editFlat(21, 1, insertString, content.contents);
        TypeScript.IO.printLine(editedText);
        TypeScript.IO.printLine(checkText);

        insertString = "cr...\r\ncr...\r\ncr";
        snapshot = lineIndex.edit(21, 1, insertString);
        snapshot.print();
        editedText = snapshot.getText(0, content.contents.length + insertString.length - 1);
        checkText = editFlat(21, 1, insertString, content.contents);
        TypeScript.IO.printLine(editedText);
        TypeScript.IO.printLine(checkText);

        // leading '\n'
        insertString = "\ncr...\r\ncr...\r\ncr";
        snapshot = lineIndex.edit(21, 1, insertString);
        snapshot.print();
        editedText = snapshot.getText(0, content.contents.length + insertString.length - 1);
        checkText = editFlat(21, 1, insertString, content.contents);
        TypeScript.IO.printLine(editedText);
        TypeScript.IO.printLine(checkText);

        // Case I: single line no line breaks deleted or inserted
        // delete 1 char
        snapshot = lineIndex.edit(21, 1);
        editedText = snapshot.getText(0, content.contents.length - 1);
        checkText = editFlat(21, 1, "", content.contents);
        snapshot.print();
        TypeScript.IO.printLine(editedText);
        TypeScript.IO.printLine(checkText);

        // insert 1 char
        snapshot = lineIndex.edit(21, 0, "b");
        editedText = snapshot.getText(0, content.contents.length + 1);
        checkText = editFlat(21, 0, "b", content.contents);
        snapshot.print();
        TypeScript.IO.printLine(editedText);
        TypeScript.IO.printLine(checkText);

        // delete 1, insert 2
        snapshot = lineIndex.edit(21, 1, "cr");
        editedText = snapshot.getText(0, content.contents.length + 1);
        checkText = editFlat(21, 1, "cr", content.contents);
        snapshot.print();
        TypeScript.IO.printLine(editedText);
        TypeScript.IO.printLine(checkText);

        // Case II: delete across line break
        snapshot = lineIndex.edit(21, 22);
        editedText = snapshot.getText(0, content.contents.length -22);
        checkText = editFlat(21, 22, "", content.contents);
        snapshot.print();
        TypeScript.IO.printLine(editedText);
        TypeScript.IO.printLine(checkText);

        snapshot = lineIndex.edit(21, 32);
        editedText = snapshot.getText(0, content.contents.length - 32);
        checkText = editFlat(21, 32, "", content.contents);
        snapshot.print();
        TypeScript.IO.printLine(editedText);
        TypeScript.IO.printLine(checkText);
        // Case III: delete across multiple line breaks and insert no line breaks
        snapshot = lineIndex.edit(21, 42);
        editedText = snapshot.getText(0, content.contents.length - 42);
        checkText = editFlat(21, 42, "", content.contents);
        snapshot.print();
        TypeScript.IO.printLine(editedText);
        TypeScript.IO.printLine(checkText);

        snapshot = lineIndex.edit(21, 42, "slithery ");
        editedText = snapshot.getText(0, content.contents.length - 33);
        checkText = editFlat(21, 42, "slithery ", content.contents);
        snapshot.print();
        TypeScript.IO.printLine(editedText);
        TypeScript.IO.printLine(checkText);

        // from Auto test

        snapshot = lineIndex.edit(77, 4, "");
        snapshot.print();
        checkText = editFlat(77, 4, "", content.contents);
        var trunkText = snapshot.getText(0, snapshot.root.charCount());
        TypeScript.IO.printLine(showLines(checkText));
        editedText = snapshot.getText(0, checkText.length);
        TypeScript.IO.printLine(editedText);
        if (editedText == checkText) {
            TypeScript.IO.printLine("match");
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
        TypeScript.IO.printLine(fname + ": " + lines.length + " lines");

        var lineIndex = new TypeScript.LineIndex();
        lineIndex.load(lines);
        var totalChars = content.contents.length;
        var rsa = [];
        var la = [];
        var las = [];
        var elas = [];
        var ersa = [];
        var ela = [];
        var etotalChars = totalChars;
        var j;
        
        var startTime;
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
        if (!timing) {
            TypeScript.IO.print("range (1/4 file): ");
        }
        for (j = 0; j < 2000; j++) {
            var s2 = lineIndex.getText(rsa[j], la[j]);
            if (!timing) {
                if (j % 250 == 0) {
                    TypeScript.IO.print("*");
                }
                var s1 = content.contents.substring(rsa[j], rsa[j] + la[j]);
                if (s1 != s2) {
                    TypeScript.IO.printLine('diff: ' + rsa[j] + ' ' + la[j]);
                    TypeScript.IO.printLine(s1);
                    TypeScript.IO.printLine(s2);
                }
            }
        }
        if (!timing) {
            TypeScript.IO.printLine("");
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
                    TypeScript.IO.printLine('diff: ' + rsa[j] + ' ' + las[j]);
                    TypeScript.IO.printLine(s1);
                    TypeScript.IO.printLine(s2);
                    errorCount++;
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
        if (!timing) {
            TypeScript.IO.print("edit (4): ");
        }
        for (j = 0; j < 2000; j++) {
            var insertString = content.contents.substring(rsa[100000 - j], rsa[100000 - j] + las[100000 - j]);
            snapshot = lineIndex.edit(rsa[j], las[j], insertString);
            if (!timing) {
                if (j % 250 == 0) {
                    TypeScript.IO.print("*");
                }
                var checkText = editFlat(rsa[j], las[j], insertString, content.contents);
                var snapText = snapshot.getText(0, checkText.length);
                if (checkText != snapText) {
                    TypeScript.IO.printLine('diff: ' + rsa[j] + ' ' + las[j]);
                    TypeScript.IO.printLine(snapText);
                    TypeScript.IO.printLine(checkText);
                    errorCount++;
                }
            }
        }
        if (!timing) {
            TypeScript.IO.printLine("");
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
                        TypeScript.IO.printLine('diff: ' + ersa[j] + ' ' + elas[j]);
                        TypeScript.IO.printLine(snapText);
                        TypeScript.IO.printLine(checkText);
                        errorCount++;
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
        if (!timing) {
            TypeScript.IO.print("edit (1/4 file): ");
        }
        for (j = 0; j < 20000; j++) {
            insertString = content.contents.substring(rsa[100000 - j], rsa[100000 - j] + la[100000 - j]);
            snapshot = lineIndex.edit(rsa[j], la[j], insertString);
            if (!timing) {
                if (j % 250 == 0) {
                    TypeScript.IO.print("*");
                }
                checkText = editFlat(rsa[j], la[j], insertString, content.contents);
                snapText = snapshot.getText(0, checkText.length);
                if (checkText != snapText) {
                    TypeScript.IO.printLine('diff: ' + rsa[j] + ' ' + la[j]);
                    TypeScript.IO.printLine(snapText);
                    TypeScript.IO.printLine(checkText);
                    errorCount++;
                }
            }
        }
        if (!timing) {
            TypeScript.IO.printLine("");
        }
        if (timing) {
            TypeScript.IO.printLine("edit (average length 1/4th file size): " + ((Date.now() - startTime) / 20).toFixed(3) + " us");
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
                    TypeScript.IO.printLine("pos: " + rsa[j] + " lineMap: " + (lac.line() + 1) + " index: " + lp.line);
                    errorCount++;
                }
                if (lac.character() != (lp.offset)) {
                    TypeScript.IO.printLine("pos: " + rsa[j] + " lineMapOffset: " + lac.character() + " index: " + lp.offset);
                    errorCount++;
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
                        TypeScript.IO.printLine("mismatch at " + k);
                        errorCount++;
                    }
                }
            }
        }
        if (timing) {
            TypeScript.IO.printLine("start pos from line: " + (((Date.now() - startTime) / lines.length) * 10).toFixed(3) + " us");
        }
        else {
            TypeScript.IO.printLine("Tests finished with " + errorCount + " errors.");
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

            throw new Error("No script with name '" + name + "'");
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
            TypeScript.IO.printLine(filename);
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
        var info = compilerService.openFile("tst.ts");
        var completionInfo = compilerService.languageService.getCompletionsAtPosition("z.ts", 2, true);
        for (var i = 0, len = completionInfo.entries.length; i < len; i++) {
            TypeScript.IO.printLine(completionInfo.entries[i].name);
        }
        var typeInfo = compilerService.languageService.getTypeAtPosition("z.ts", 0);
        TypeScript.IO.printLine(typeInfo.memberName.toString());
        compilerService.host.editScript("z.ts", 2, 9, "zebra");
        var snapshot = compilerService.host.getScriptSnapshot("z.ts");
        var text = snapshot.getText(0, snapshot.getLength());
        var lines = text.split("\n");
        for (var l = 0, llen = lines.length; l < llen; l++) {
            TypeScript.IO.printLine(lines[l]);
            var classy = compilerService.classifier.getClassificationsForLine(lines[l], TypeScript.Services.EndOfLineState.Start);
        }
        
        typeInfo = compilerService.languageService.getTypeAtPosition("z.ts", 2);
        TypeScript.IO.printLine(typeInfo.memberName.toString());

        compilerService.host.editScript("z.ts", 2, 7, "giraffe");
        typeInfo = compilerService.languageService.getTypeAtPosition("z.ts", 2);
        snapshot = compilerService.host.getScriptSnapshot("z.ts");
        text = snapshot.getText(0, snapshot.getLength());
        TypeScript.IO.printLine(text);
        TypeScript.IO.printLine(typeInfo.memberName.toString());

        var tinsertString = "class Manimal {\r\n    location: Point;\r\n}\r\n";
        compilerService.host.editScript("tst.ts", 0, 0, tinsertString);
        var tsnap = compilerService.host.getScriptSnapshot("tst.ts");
        var ttext = tsnap.getText(0, tsnap.getLength());
        TypeScript.IO.printLine(ttext);
                        
        var insertString = ";\r\nvar m = new Manimal();\r\nm.location"
        compilerService.host.editScript("z.ts", text.length - 1, text.length - 1, insertString);
        var offset = text.length + 28;
        typeInfo = compilerService.languageService.getTypeAtPosition("z.ts", offset);
        TypeScript.IO.printLine(typeInfo.memberName.toString());
        snapshot = compilerService.host.getScriptSnapshot("z.ts");
        text = snapshot.getText(0, snapshot.getLength());
        TypeScript.IO.printLine(text);
        TypeScript.IO.printLine(text.substring(offset));

        var items = compilerService.languageService.getScriptLexicalStructure("z.ts");
        var diags = compilerService.languageService.getSyntacticDiagnostics("z.ts");
        for (var j = 0, dlen = diags.length; j < dlen; j++) {
            TypeScript.IO.printLine(diags[j].text());
        }
    }

    function bigTest() {
        var d = [
            TypeScript.IO.dir('..\\..\\typings'),
            TypeScript.IO.dir('..\\..\\src\\compiler'),
            TypeScript.IO.dir('..\\..\\src\\services')
        ];

        for (var i = 0; i < d.length; i++) {
            var directory = d[i];
            for (var j = 0, len = directory.length; j < len; j++) {
                var fname = directory[j];
                // pass true as second parameter to measure performance
                editStress(fname, false);
            }
        }
    }
    editTest();
    lsTest();
    bigTest();
}

