// script.js
var io = require('socket.io')(2233);
var dir = __dirname;

io.on('connection', function (socket) {

	var spawn = require('child_process').spawn;
	var child = spawn('node', [dir+'/server.js']);
	var kill = require('tree-kill');

	child.stdout.on('data', function(data) {
	    console.log('stdout: ' + data);
	});

	child.stderr.on('data', function(data) {
	    console.log('stderr: ' + data);
	});

	child.on('close', function(code) {
	    console.log('closing code: ' + code);
	});

    console.info('New client connected (id=' + socket.id + ').');

    socket.on('stop', function() {
       console.log('kill the server');
       kill(child.pid, 'SIGKILL');
       console.log('reiniciando o server');
    });

    socket.on('disconnect', function() {
     	console.log('kill the server');
       	kill(child.pid, 'SIGKILL');
       	console.log('reiniciando o server');
    });
});

var host = process.env.PORT ? '0.0.0.0' : '127.0.0.1';
var port = process.env.PORT || 2525;

var cors_proxy = require('cors-anywhere');
cors_proxy.createServer({
    requireHeader: ['origin', 'x-requested-with'],
    removeHeaders: ['cookie', 'cookie2']
}).listen(port, host, function() {
    console.log('Running CORS Anywhere on ' + host + ':' + port);
});