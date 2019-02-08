const P2P = require('socket.io-p2p');
const io = require('socket.io-client');

class Multiplayer {
  connect() {
    this.private = false
    this.players = []
    const socket = io();
    this.p2psocket = new P2P(socket, {autoUpgrade: false, numClients: 10});

    socket.on('connect', () => {
      this.socketId = socket.io.engine.id
    })

    this.p2psocket.on('go-private', () => {
      console.log('private time')
      this.p2psocket.upgrade(); // upgrade to peerConnection
      this.private = true
    });

    this.p2psocket.on('players', (data) => {
      console.log('Got player list', data)
      this.players = data
    });

    this.p2psocket.on('my-position', (data) => {
      console.log('players', this.players)
      this.players.map((p) => {
        console.log(p, data.socketId)
        if (data.socketId === p.id) {
          p.position = data.position
        }
      })


      console.log(this.players)
    });


    return this
  }

  readyUp() {
    console.log('im ready')
    this.p2psocket.emit('ready-up', {message:'ready'})
  }

  sendPosition(socketId, position) {
    if (this.private) {
      this.p2psocket.emit('my-position',{socketId:socketId, position:position});
    }
  }
}

export default new Multiplayer().connect()
