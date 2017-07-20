// TODO: ERROR IN CONSOLE GET http://localhost:3000/app?name=slack net::ERR_CONNECTION_REFUSED
const express = require('express');
const server = express();

server.use(express.static('web'));

server.get('/app', function (req, res) {
	//res.send('Hello ' + req.query.name + '!')
	var child = require('child_process').execFile;
    var clientInput = req.query.name;
    var clientInputKeywords = clientInput.substring(clientInput.indexOf(' ')+1);
    var cmd = 'open';
    var parameters = [];

    if (/^(d|dic) /.test(clientInput)) {
        parameters = ['dict://'+clientInputKeywords];
    } else if (/^(s|slack)/.test(clientInput)) {
        parameters = ['-a', 'Slack.app'];
    }

    // http://ourcodeworld.com/articles/read/154/how-to-execute-an-exe-file-system-application-using-electron-framework
	child(cmd, parameters, function (err, data) {
		if (err) {
		console.error(err);
        return;
    }
	console.log(data.toString());
	})
});

server.get('/search', function (req, res) {
	var child = require('child_process').execFile;
    var clientInput = req.query.name;
    var cmd = 'find';
    var parameters = ['/Users/fan/Documents', '-iname', '*'+clientInput+'*', '-atime', '-30', '-type', 'f'];

	child(cmd, parameters, function (err, data) {
		if (err) {
		console.error(err);
        return;
    }
	console.log(data.toString());
    res.send(data);
	})

});

server.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
