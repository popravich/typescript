//// [scannertest1.js]
///<reference path='References.ts' />
var CharacterInfo = (function () {
    function CharacterInfo() {
    }
    CharacterInfo.isDecimalDigit = function (c) {
        return c >= CharacterCodes._0 && c <= CharacterCodes._9;
    };

    CharacterInfo.isHexDigit = function (c) {
        return isDecimalDigit(c) || (c >= CharacterCodes.A && c <= CharacterCodes.F) || (c >= CharacterCodes.a && c <= CharacterCodes.f);
    };

    CharacterInfo.hexValue = function (c) {
        Debug.assert(isHexDigit(c));
        return isDecimalDigit(c) ? (c - CharacterCodes._0) : (c >= CharacterCodes.A && c <= CharacterCodes.F) ? c - CharacterCodes.A + 10 : c - CharacterCodes.a + 10;
    };
    return CharacterInfo;
})();
