var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var socket_io    = require( "socket.io" );

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

let io = socket_io();
app.io = io;

let players = {}





io.on('connection', function(socket){
  console.log('a user connected', socket.id);

  let player = {
    name:'test',
    id:socket.id,
    x:0,
    y:0,
    z:0,
    rotation:{
        x:0,
        y:0,
        z:0
    }
  }
  players[socket.id] = player

  io.sockets.emit('players', players);

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });


  socket.on('movement', (data) => {

      if (players[data.id]) {
          players[data.id].x = data.position.x,
          players[data.id].y = data.position.y,
          players[data.id].z = data.position.z

          players[data.id].rotation.x = data.rotation.x,
          players[data.id].rotation.y = data.rotation.y,
          players[data.id].rotation.z = data.rotation.z

          socket.broadcast.emit("movement", players[data.id])
      }
  })

  socket.on('rocket', (data) => {
      socket.broadcast.emit("rockets", data)
  })

});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/scripts', express.static(path.join(__dirname, 'node_modules/three.terrain.js/build')));
// app.use('/scripts', express.static(path.join(__dirname, 'node_modules/three-orbit-controls')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
