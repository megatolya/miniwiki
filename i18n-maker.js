var fs = require('fs'),
    config = require('./config').config,
    format= '.json',
    $ = require('jquery'),
    i18n = {},
    en = {};

fs.readFile(__dirname + '/i18n/en.json', 'utf8', function (err, content) {
    if (err) throw err;

    en=JSON.parse(content);
    fs.readdir(__dirname+'/i18n/', function(err, langs) {
        if (err) throw err;

        langs.forEach(function(lang){
            lang = lang.replace(format, '');
            fs.readFile(__dirname + '/i18n/' + lang + format, 'utf8', function (err, content) {
                if (err) throw err;

                i18n[lang]=$.extend({}, en, JSON.parse(content));
            });
        });
    });
});


setTimeout(function () {
    console.log('module.exports=' + JSON.stringify(i18n));
},1000);