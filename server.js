// Copyright (c) 2017 Fan Zhang
// This work is available under the "MIT license".
// Please see the file COPYING in this source
// distribution for license terms.


const express = require('express');
const server = express();
const { execFile } = require('child_process');
const { exec } = require('child_process');
const kpio = require('keepass.io');
const path = require('path');
const fs = require('fs');

server.use('/', express.static(__dirname + '/web'));

// openApp
server.get('/app', function (req, res) {
    if (!(req.query.input && req.query.config && req.query.config.cmd)) {
        res.send("Server: Invalid input or configuration.");
        return;
    }

    var pluginInput = req.query.pluginInput;
    var id = req.query.config.id;
    var cmd = req.query.config.cmd;

    var params = [];
    if (id === 'dict') {
        params = [req.query.config.url + pluginInput];
    } else if (id === 'open file') {
        params = [req.query.input];
    } else if (id === 'open trash') {
        params = [path.join(process.env['HOME'], req.query.config.path)]; 
    } else {
        params = req.query.config.params;
    }

    // http://ourcodeworld.com/articles/read/154/how-to-execute-an-exe-file-system-application-using-electron-framework
    // https://nodejs.org/api/child_process.html#child_process_child_process_execfile_file_args_options_callback
    execFile(cmd, params, function (err, stdout, stderr) {
        if (err) {
            console.log(err);
            res.send('Server: Failed to open app.');
        } else {
            if (id === 'open trash') {
                //res.send('Do you want to empyt the Trash ?\nYes\nNo');
                res.send('Server: Open Trash Success!');
            } else {
                res.send('Server: Success!');
            }
        }
    });
});

// system
server.get('/sys', function (req, res) {
    if (!(req.query.input && req.query.config)) {
        res.send("Server: Invalid input or configuration.");
        return;
    }

    var id = req.query.config.id;
    var cmd = req.query.config.cmd;
    var params = req.query.config.params;

    if (id === 'empty trash') {
        var homeDir = process.env['HOME'];
        var pTrash = req.query.config.path;
        var pathTrash = path.join(homeDir, pTrash);

		fs.readdir(pathTrash, function(err, files) {
            if (err) {
                console.log(err);
                res.send('Server: Please check the path of your Trash direcotry');
            } else {
                // Trash is empty
                if (files.length === 1) {
                    res.send('Server: Trash is empty now.');
                } else {
                    exec(cmd + pathTrash+'*', function (err, stdout, stderr) {
                        if (err) {
                            console.log(err);
                            res.send('Server: Failed to empty Trash.');
                        } else {
                            res.send('Server: Success!');
                        }
                    });
                }
            }
        });
    } else if (id === 'sleep') {
        execFile(cmd, params, function (err, stdout, stderr) {
            if (err) {
                console.log(err);
                res.send("Server: Failed to sleep.");
            }
        });
    }
});

// fileSearch
server.get('/search', function (req, res) {
    if (!(req.query.input && req.query.config && req.query.config.paths)) {
        res.send("Server: Invalid input or configuration.");
        return;
    }

    var input = req.query.input;
    var config = req.query.config;
    var paths = req.query.config.paths;
    var cmd = req.query.config.cmd;
    var p = req.query.config.params;

    var params = paths.concat(p).concat(['*'+input+'*']);

    execFile(cmd, params, function (err, stdout, stderr) {
        if (err) {
            res.send('Server: Failed to run find.');
        } else {
            res.send(stdout);
        }
    });
});

// keePassSearch
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
