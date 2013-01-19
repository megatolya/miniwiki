exports.config = {
    users: [
        {
            login: 'admin',
            password: '123'
        }
    ],
    wikiRoot: __dirname + '/wiki_files/',
    encoding: 'utf8',
    wikiFormat: '.wiki',
    host: '127.0.0.1',
    port: 3000,
    logToConsole: true,
    nightMode: false,
    useAuth: true,
    lang: 'ru'
};
