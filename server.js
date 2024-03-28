const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io");
const PORT = process.env.PORT || 3000
const io = new Server(server);
const path = require('path');
const roomsList = []
var connectRoom = {}
var connections = []
var part = []
var spaceName;
var name;

app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

// Public altındaki bütün dosyaların erişilebilir olmasını sağlar.
app.use(express.static(path.join(__dirname, "public")))

app.get('/rooms', (req, res) => {
    //console.log(connectRoom[name])
    res.render('rooms', {rooms: roomsList});
})


app.get('/room/', (req, res) => {
    var name = req.query.name;
    spaceName = String(name);
    if (connectRoom[spaceName] < 2) {
        res.render('multiplayer',{rooms: name});
    } else {
        res.redirect('rooms')
    }
})

app.get('/addRoom/', (req, res) => {
    name = req.query.name;
    roomsList.push(name);
    connectRoom[name] = 0;
    part[name] = 0;
    connections[name] = [null, null];
    console.log(JSON.stringify(roomsList))
    res.sendStatus(200);
})

//console.log(spaceName)
const adminNameSpace =  io.of(/^\/\w+$/);

adminNameSpace.on('connect', (socket) => {
    let playerIndex = -1;
    let temp = spaceName;
    connectRoom[temp] +=1
    part[temp]+=1

    for(const i in connections[temp]){
        if (connections[temp][i] === null) {
            playerIndex = i
            connections[temp][i] = false
            socket.emit('player-number', playerIndex)
            socket.broadcast.emit('player-connection', playerIndex)
            break
        }
    }


    socket.on('player-ready', () => {
        socket.broadcast.emit('enemy-ready', playerIndex)
        connections[temp][playerIndex] = true
    })

    socket.on('check-players', () => {
        const players = []
        for (const i in connections[temp]){
            connections[temp][i] === null ? players.push({connected: false, ready: false}) : players.push({connected: true, ready: connections[temp][i]})
        }
        socket.emit('check-players', players)
    })

    socket.on('fire', id => {
        socket.broadcast.emit('fire', id)
    })


    socket.on('fire-reply', square => {
        socket.broadcast.emit('fire-reply', square)
    })

    socket.on('disconnect', () => {
        //console.log('user disconnected');
        socket.broadcast.emit('check-ready', playerIndex)
        socket.broadcast.emit('player-continue')
        connectRoom[temp] -=1
        part[temp] -=1
        connections[temp][playerIndex] = null
        //console.log(connections[temp]);
        socket.broadcast.emit('player-connection', playerIndex)
    });


    //console.log("Oda:" + spaceName + " KişiS.: " + connectRoom[spaceName])
})

// Server baslatma
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))