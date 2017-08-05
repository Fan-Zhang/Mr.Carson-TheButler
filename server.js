// TODO: ERROR IN CONSOLE GET http://localhost:3000/app?name=slack net::ERR_CONNECTION_REFUSED
const express = require('express');
const server = express();
const { execFile } = require('child_process');
const kpio = require('keepass.io');

server.use('/', express.static(__dirname + '/web'));

server.get('/app', function (req, res) {
    var input = req.query.input;
    var pluginInput = input.substring(input.indexOf(' ')+1);
    var cmd = req.query.config.cmd;

    if (!(req.query.input && req.query.config && req.query.config.cmd)) {
        res.send("Server: Invalid input or configuration.");
        return;
    }

    var apps = [
        { id: 'dict',        pattern: /^(d|dic) /,  params: [req.query.config.url+pluginInput] },
        { id: 'slack',       pattern: /^(s|slack)/,                params: ['-a', 'Slack.app'] },
        { id: 'firefox',       pattern: /^(f|firefox)/,          params: ['-a', 'Firefox.app'] },
        { id: 'chrome',       pattern: /^(c|chrome)/,      params: ['-a', 'Google\ Chrome.app'] },
        { id: 'text-edit',   pattern: /^(t|text)/,               params: ['-a', 'TextEdit.app'] },
        { id: 'file-open',   pattern: /^\//,                                   params: [input] },
    ];

    for (var i in apps) {
        var app = apps[i];
        var params = app.params;
        if (app.pattern.test(input)) {
            execFile(cmd, params, function (err, stdout, stderr) {
                if (err) {
                    res.send('Server: Failed to open app.');
                } else {
                    res.send('Server: Success!');
                }
            });
        }
    }

    /*
    if (/^(d|dic) /.test(input)) {
        var key = input.substring(input.indexOf(' ')+1);
        params = [req.query.config.url+key];
    } else if (/^(s|slack)/.test(input)) {
        params = ['-a', 'Slack.app'];
        // file-open
    } else if (/^\//.test(input)) {
        params = [input];
    }

    // http://ourcodeworld.com/articles/read/154/how-to-execute-an-exe-file-system-application-using-electron-framework
    // https://nodejs.org/api/child_process.html#child_process_child_process_execfile_file_args_options_callback
    execFile(cmd, params, function (err, stdout, stderr) {
        if (err) {
            res.send('Server: Failed to open app.');
        } else {
            res.send('Server: Success!');
        }
    });
    */
});

server.get('/search', function (req, res) {
    if (!(req.query.input && req.query.config && req.query.config.paths)) {
        res.send("Server: Invalid input or configuration.");
        return;
    }

    var input = req.query.input;
    var cmd = 'find';
    var params = req.query.config.paths.concat(
        ['-iname', '*'+input+'*', '-atime', '-30', '-type', 'f']);

    execFile(cmd, params, function (err, stdout, stderr) {
        if (err) {
            res.send('Server: Failed to run find.');
        } else {
            res.send(stdout);
        }
    });
});

server.get('/keepass', function (req, res) {
    if (!(req.query.input && req.query.config && req.query.config.file && req.query.config.password)) {
        res.send("Server: Invalid input or configuration.");
        return;
    }

    var input = req.query.input;
    var key = input.substring(input.indexOf(' ')+1).toLowerCase();
    var db = new kpio.Database();
    db.addCredential(new kpio.Credentials.Password(req.query.config.password));
    db.loadFile(req.query.config.file, function(err) {
        if (err) {
            res.send('Server: Failed to open KeePass database.');
        } else {
            var rawDatabase = db.getRawApi().get();
            var rootGroup = rawDatabase.KeePassFile.Root.Group;
            var allEntries = traverseGroup(rootGroup);
            var matchedEntries = allEntries.filter(titleContains(key));
            res.send(matchedEntries.map(function(e) { return e.String }));
        }
    });

    function traverseGroup(t) {
        var entries = t.Entry ? t.Entry : [];
        var subGroups = t.Group;
        if (subGroups) {
            for (var i = 0; i < subGroups.length; i++) {
                entries.concat(traverseGroup(subGroups[i]));
            }
        }
        return entries;
    }

    function titleContains(key) {
        return function(e) {
            var pairs = e.String;
            for (var i = 0; i < pairs.length; i++) {
                if (pairs[i].Key === 'Title' && pairs[i].Value.toLowerCase().indexOf(key) != -1) {
                    return true;
                }
            }
            return false;
        };
    }
});

server.listen(3000, function () {
    console.log('Listening on port 3000!')
});
