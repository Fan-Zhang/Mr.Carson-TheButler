// TODO: ERROR IN CONSOLE GET http://localhost:3000/app?name=slack net::ERR_CONNECTION_REFUSED
const express = require('express')
const server = express()

server.use(express.static('web'))

server.get('/app', function (req, res) {
	//res.send('Hello ' + req.query.name + '!')
	var child = require('child_process').execFile;
	//var child = require('child_process').exec;
    var clientInput = req.query.name;
    var clientInputKeywords = clientInput.substring(clientInput.indexOf(' ')+1);
    var cmd = 'open';
    var parameters = [];

    if (/^(d|dic) /.test(clientInput)) {
        parameters = ['dict://'+clientInputKeywords];
    } else if (/(s|slack)/.test(clientInput)) {
        parameters = ['-a', 'Slack.app'];
    }

	child(cmd, parameters, function (err, data) {
		if (err) {
		console.error(err);
        return;
    }
	console.log(data.toString());
	})
});

server.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
