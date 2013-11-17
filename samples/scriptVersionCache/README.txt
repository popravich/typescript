This sample shows writers of code editors how to use the
ScriptVersionCache class in the TypeScript module.  The script version
cache enables editors to convert a stream of text edits to a
repository of script snapshots.  This enables the TypeScript language
service to parse incrementally.

To compile the sample:
tsc client.ts -out client.js

Then run client.js using node or, on Windows, cscript.

