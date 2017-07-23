// TODO: ERROR IN CONSOLE GET http://localhost:3000/app?name=slack net::ERR_CONNECTION_REFUSED
const express = require('express');
const server = express();
const { execFile } = require('child_process');

server.use(express.static('web'));

server.get('/app', function (req, res) {
    if (!(req.query.input && req.query.config && req.query.config.cmd)) {
        res.send("Server: Invalid input or configuration.");
        return;
    }

    var input = req.query.input;
    var cmd = req.query.config.cmd;
    var params = [];

    if (/^(d|dic) /.test(input)) {
        if (!req.query.config.url) {
            res.send("Server: Invalid input or configuration.");
            return;
        }
        var pluginInput = input.substring(input.indexOf(' ')+1);
        params = [req.query.config.url + pluginInput];
    } else if (/^(s|slack)/.test(input)) {
        params = ['-a', 'Slack.app'];
    }

    // http://ourcodeworld.com/articles/read/154/how-to-execute-an-exe-file-system-application-using-electron-framework
    execFile(cmd, params, function (err, stdout, stderr) {
        if (err) {
            res.send('Server: Failed to open app.');
        } else {
            res.send('Server: Success!');
        }
    });
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

server.listen(3000, function () {
    console.log('Listening on port 3000!')
});
