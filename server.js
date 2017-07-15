var http = require('http');
var fs = require('fs');

var server = http.createServer(function (req, res) {
    fs.readFile(decodeURIComponent(req.url.substr(1)), function(err, data) {
        if (err === null) {
            res.writeHead(200, { 
                'Content-Type': 'text/html'
            });

        res.write(data);  // data is actually a buffer
        }

        res.end();
    });
});

server.listen(8080);
            

