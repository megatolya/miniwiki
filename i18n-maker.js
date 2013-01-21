var fs = require('fs'),
    config = require('./config').config,
    format= '.json',
    $ = require('jquery'),
    i18n = {},
    en = {},
    async = require('async');

fs.readFile(__dirname + '/i18n/en.json', 'utf8', function (err, content) {
    if (err) throw err;

    en=JSON.parse(content);
    fs.readdir(__dirname+'/i18n/', function(err, langs) {
        if (err) throw err;

        var tasks = {};
        langs.forEach(function(lang){
            tasks[lang] = function (callback) {
                    lang = lang.replace(format, '');
                fs.readFile(__dirname + '/i18n/' + lang + format, 'utf8', function (err, content) {
                    if (err) throw err;

                    callback(null, $.extend({}, en, JSON.parse(content)));
                });
            };

        });
        async.parallel(tasks, function (err, res) {
            console.dir(res);
        });
    });
});
