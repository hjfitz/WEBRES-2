const express = require('express');
const path = require('path');
const logger = require('morgan');
const http = require('http')

const app = express();
const port = process.env.PORT || 3000
const server = http.createServer(app)


const io = require('socket.io')(server)
const p2p = require('socket.io-p2p-server').Server
io.use(p2p)

let players = []
let readyCount = 0

io.on('connection', function (socket) {
  console.log('connected', socket.id)
  players.push({id:socket.id, isReady:false})

  console.log('all players', players)

  console.log('sending players to all other clients')
  io.emit('players',players)

  socket.on('ready-up', function (data) {
    console.log(`${socket.id} is ready`)
    readyCount++

    console.log(readyCount, io.engine.clientsCount)

    if (readyCount === io.engine.clientsCount) {
      console.log('seems everyone is ready, lets roll')
      io.emit('go-private')
    }

    // players.map((p) => {
    //   readyCount++
    //   if (p.ready) {
    //     readyCount++
    //   }
    //
    //
    // })
  })

  socket.on('disconnect', () => {
    console.log('disconnected', socket.id)
    players.forEach((player, index) => {
      if (socket.id === player.id) {
        players.splice(index, 1);
        readyCount = 0
      }
    })
  })
})

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));


server.listen(port, () => console.log(`server listening on ${port}`))