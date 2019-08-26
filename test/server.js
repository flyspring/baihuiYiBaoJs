const express = require('express');
const http = require('http');

var app = express();
var server = http.createServer(app);;

server.listen(parseInt(8080, 10), function() {
	console.log('Server is running!');
});

app.use(express.static(__dirname));

app.get('/test', function (req, res) {
    res.sendFile(__dirname + '/test.html', [], function (err) {
        if (err) {
            res.writeHead(404);
            res.end('404');
        }
    });
});

app.get('*', function (req, res) {
	res.writeHead(200);
	res.end('');
});


