///<reference path='..\..\..\..\src\compiler\typescript.ts' />
///<reference path='..\..\..\..\src\harness\harness.ts' />

describe('Compiling tests\\compiler\\sourceMapperExtensionsTests.ts', function () {
    describe('x_ms_mediaTypes extension', function () {

        // resuable mocks
        var mockJsFile: TypeScript.TextWriter = <any>{
            WriteLine() { }
        };
        var mockDocument0: TypeScript.Document = <any>{
            fileName: "test0.ts"
        };
        var mockDocument1: TypeScript.Document = <any>{
            fileName: "test1.ts"
        };
        var mockDocumentWithDifferentMediaType: TypeScript.Document = <any>{
            fileName: "test2.ts"
        };
        var mockEmitOptions: TypeScript.EmitOptions = <any>{
            sourceMapRootDirectory() { },
            sourceRootDirectory() { },
            commonDirectoryPath() { },
            compilationSettings() {
                return {
                    propagateEnumConstants() { },
                    removeComments() { },
                    noResolve() { },
                    noLib() { },
                    codeGenTarget() { },
                    moduleGenTarget() { },
                    useCaseSensitiveFileResolution() { },
                    noImplicitAny() { },
                    codepage() { },
                    outFileOption() { }
                }
            }
        };

        it("map for one document with media type has 'x_ms_mediaTypes' extension", function () {
            // arrange
            var sourceMap: {
                x_ms_mediaTypes: string[];
                x_ms_sourceMediaTypes: number[];
            };
            var mockSourceMapOut: TypeScript.TextWriter = <any>{
                Write(value: string) { sourceMap = JSON.parse(value); },
                Close() { }
            };

            // act
            var mapper = new TypeScript.SourceMapper(
                mockJsFile,
                mockSourceMapOut,
                mockDocument0,
                "test.js",
                mockEmitOptions,
                null);
            mapper.emitSourceMapping();

            // assert
            assert.is("x_ms_mediaTypes" in sourceMap, "missing 'x_ms_mediaTypes' extension");
        });

        it("map for one document with media type has matching media type in 'x_ms_mediaTypes' extension", function () {
            // arrange
            var expectedMediaType = "application/x.typescript;version=" + TypeScript.version;
            var sourceMap: {
                x_ms_mediaTypes: string[];
                x_ms_sourceMediaTypes: number[];
            };
            var mockSourceMapOut: TypeScript.TextWriter = <any>{
                Write(value: string) { sourceMap = JSON.parse(value); },
                Close() { }
            };

            // act
            var mapper = new TypeScript.SourceMapper(
                mockJsFile,
                mockSourceMapOut,
                mockDocument0,
                "test.js",
                mockEmitOptions,
                null);
            mapper.emitSourceMapping();

            // assert
            assert.arrayLengthIs(sourceMap.x_ms_mediaTypes, 1);
            assert.is(sourceMap.x_ms_mediaTypes[0] === expectedMediaType);
        });

        it("map for two documents with same media type has only one entry in 'x_ms_mediaTypes' extension", function () {
            // arrange
            var expectedMediaType = "application/x.typescript;version=" + TypeScript.version;
            var sourceMap: {
                x_ms_mediaTypes: string[];
                x_ms_sourceMediaTypes: number[];
            };
            var mockSourceMapOut: TypeScript.TextWriter = <any>{
                Write(value: string) { sourceMap = JSON.parse(value); },
                Close() { }
            };

            // act
            var mapper = new TypeScript.SourceMapper(
                mockJsFile,
                mockSourceMapOut,
                mockDocument0,
                "test.js",
                mockEmitOptions,
                null);
            mapper.setNewSourceFile(
                mockDocument1,
                mockEmitOptions);
            mapper.emitSourceMapping();

            // assert
            assert.arrayLengthIs(sourceMap.x_ms_mediaTypes, 1);
            assert.is(sourceMap.x_ms_mediaTypes[0] === expectedMediaType);
        });
    });

    describe('x_ms_compilerFlags extension', function () {
        // resuable mocks
        var mockJsFile: TypeScript.TextWriter = <any>{
            WriteLine() { }
        };
        var mockDocument0: TypeScript.Document = <any>{
            fileName: "test0.ts"
        };
        var mockEmitOptions: TypeScript.EmitOptions = <any>{
            sourceMapRootDirectory() { },
            sourceRootDirectory() { },
            commonDirectoryPath() { },
            compilationSettings() {
                return {
                    propagateEnumConstants() { },
                    removeComments() { },
                    noResolve() { },
                    noLib() { },
                    codeGenTarget() { },
                    moduleGenTarget() { },
                    useCaseSensitiveFileResolution() { },
                    noImplicitAny() { },
                    codepage() { },
                    outFileOption() { }
                }
            }
        };
        var mockEmitOptions2: TypeScript.EmitOptions = <any>{
            sourceMapRootDirectory() { },
            sourceRootDirectory() { },
            commonDirectoryPath() { },
            compilationSettings() {
                return {
                    propagateEnumConstants() { return true; },
                    removeComments() { return true; },
                    noResolve() { return true; },
                    noLib() { return true; },
                    codeGenTarget() { return TypeScript.LanguageVersion.EcmaScript5; },
                    moduleGenTarget() { return TypeScript.ModuleGenTarget.Asynchronous; },
                    useCaseSensitiveFileResolution() { return true },
                    noImplicitAny() { return true },
                    codepage() { return 1033; },
                    outFileOption() { return "test.js"; }
                }
            }
        };

        it("no 'x_ms_compilerFlags' extension when using defaults", function () {
            // arrange
            var sourceMap: {
                x_ms_compilerFlags: string;
            };
            var mockSourceMapOut: TypeScript.TextWriter = <any>{
                Write(value: string) { sourceMap = JSON.parse(value); },
                Close() { }
            };

            // act
            var mapper = new TypeScript.SourceMapper(
                mockJsFile,
                mockSourceMapOut,
                mockDocument0,
                "test.js",
                mockEmitOptions,
                null);
            mapper.emitSourceMapping();

            // assert
            assert.is(!("x_ms_compilerFlags" in sourceMap), "unexpected 'x_ms_compilerFlags' extension");
        });

        it("has 'x_ms_compilerFlags' extension when non-default flags", function () {
            // arrange
            var sourceMap: {
                x_ms_compilerFlags: string;
            };
            var mockSourceMapOut: TypeScript.TextWriter = <any>{
                Write(value: string) { sourceMap = JSON.parse(value); },
                Close() { }
            };

            // act
            var mapper = new TypeScript.SourceMapper(
                mockJsFile,
                mockSourceMapOut,
                mockDocument0,
                "test.js",
                mockEmitOptions2,
                null);
            mapper.emitSourceMapping();

            // assert
            assert.is("x_ms_compilerFlags" in sourceMap, "missing 'x_ms_compilerFlags' extension");
        });

        it("correct values for 'x_ms_compilerFlags' extension when non-default flags", function () {
            // arrange
            var sourceMap: {
                x_ms_compilerFlags: string;
            };
            var mockSourceMapOut: TypeScript.TextWriter = <any>{
                Write(value: string) { sourceMap = JSON.parse(value); },
                Close() { }
            };

            // act
            var mapper = new TypeScript.SourceMapper(
                mockJsFile,
                mockSourceMapOut,
                mockDocument0,
                "test.js",
                mockEmitOptions2,
                null);
            mapper.emitSourceMapping();

            // assert
            assert.equal(sourceMap.x_ms_compilerFlags, "--propagateEnumConstants --removeComments --noResolve --noLib --target ES5 --module amd --useCaseSensitiveFileResolution --noImplicitAny --codepage 1033");
        });
    });
});

