var requirejs = require('../r.js');

requirejs.config({
    nodeRequire: require
});

requirejs(['nestedModule'],
function (nestedModule) {
});