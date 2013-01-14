var requirejs = require('../r.js');

requirejs.config({
    nodeRequire: require
});

requirejs(['app'],
function (app) {
});