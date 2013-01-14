var requirejs = require('../r.js');

requirejs.config({
    nodeRequire: require
});

requirejs(['A'],
function (A) {
});