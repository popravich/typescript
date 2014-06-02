//// [enumErrors.js]
// Enum named with PredefinedTypes
var any;
(function (any) {
})(any || (any = {}));
var number;
(function (number) {
})(number || (number = {}));
var string;
(function (string) {
})(string || (string = {}));
var boolean;
(function (boolean) {
})(boolean || (boolean = {}));

// Enum with computed member initializer of type Number
var E5;
(function (E5) {
    E5[E5["C"] = new Number(30)] = "C";
})(E5 || (E5 = {}));

var E9;
(function (E9) {
    E9[E9["A"] = 0] = "A";
    E9[E9["B"] = E9.A] = "B";
})(E9 || (E9 = {}));

//Enum with computed member intializer of different enum type
// Bug 707850: This should be allowed
var E10;
(function (E10) {
    E10[E10["A"] = 0 /* A */] = "A";
    E10[E10["B"] = E9.B] = "B";
})(E10 || (E10 = {}));

// Enum with computed member intializer of other types
var E11;
(function (E11) {
    E11[E11["A"] = ''] = "A";
    E11[E11["B"] = new Date()] = "B";
    E11[E11["C"] = window] = "C";
    E11[E11["D"] = {}] = "D";
})(E11 || (E11 = {}));
