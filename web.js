var express = require('express');
var sys = require('sys');
var twitter = require('twitter');
var logging = require('node-logging');

logging.setLevel('error');

var app = express.createServer();
app.register('.html', require('jade'));
app.set("view options", { layout: false });
app.listen(process.env.PORT || 3000);

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
  };
}

console.log("STARTING SERVER");
var io = require('socket.io').listen(app);
// Heroku won't actually allow us to use WebSockets
// so we have to setup polling instead.
// https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});
//io.set('transports', ['xhr-polling']); io.set('polling duration', 10);
var query = "defiantly";
io.sockets.on('connection', function (socket) { 
  console.log('STARTING SOCKET CONNECTION');
  twit.stream('user', {track: query}, function(stream) {
    stream.on('data', function (data) {
      if(data.text) {
        if(!data.text.startsWith("RT")) {
          data.split = data.text.split(" ")
          socket.volatile.emit('tweet', data);
        }
      }
    });
  });
  socket.on('disconnect', function () {
    console.log('SOCKET DISCONNECTED');
  });
});


var fs = require('fs');
eval(fs.readFileSync('credentials.js')+'');
