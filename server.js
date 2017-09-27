const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const{find} = require('lodash');

const activePlayers = [];

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

app.get('/app.js', (req, res) => {
  res.sendFile(`${__dirname}/app.js`);
});

app.get('/assets/:asset', (req, res) => {
  res.sendFile(`${__dirname}/assets/${req.params.asset}`);
});

io.on('connection', socket => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('location', (username, x, y) => {
    socket.broadcast.emit('location', username, x, y);
    find(activePlayers, {'username':username}).xPos = x;
    find(activePlayers, {'username':username}).yPos = y;
    console.log(activePlayers);
  });

  socket.on('newPlayer', (username, x, y) => {
    console.log(`New player: ${username}`);
    socket.broadcast.emit('newPlayer', username, x, y);
    activePlayers.forEach(activePlayer => {
      socket.emit('newPlayer', activePlayer.name, activePlayer.xPos, activePlayer.yPos);
    });
    activePlayers.push({
      'username':username,
      'xPos':x,
      'yPos':y
    });
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
