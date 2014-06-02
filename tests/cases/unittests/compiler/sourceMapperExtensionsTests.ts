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
            commonDirectoryPath() { }
        };

        it("one document with media type has 'x_ms_mediaTypes' extension", function () {
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

        it("one document with media type has matching media type in 'x_ms_mediaTypes' extension", function () {
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

        it("two documents with same media type has only one entry in 'x_ms_mediaTypes' extension", function () {
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
});

