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

app.get('/lodash.js', (req, res) => {
  res.sendFile(`${__dirname}/node_modules/lodash/lodash.js`);
});

app.get('/assets/:asset', (req, res) => {
  res.sendFile(`${__dirname}/assets/${req.params.asset}`);
});

io.on('connection', socket => {
  console.log('a user connected with socket.id ', socket.id);

  socket.once('connect', () => {

  });

  socket.once('disconnect', () => {
    console.log('user disconnected with socket.id ', socket.id);
    const playerToRemove = find(activePlayers, {'socketId':socket.id});
    if (playerToRemove !== undefined) {
      socket.broadcast.emit('removePlayer', playerToRemove['username'], socket.id);
      console.log('Removing player ', playerToRemove);
      delete playerToRemove;
    }
  });

  socket.on('location', (username, x, y, angle) => {
    const playerToMove = find(activePlayers, {'socketId':socket.id});
      if (playerToMove['xPos'] !== x || playerToMove['yPos'] !== y) {
          socket.broadcast.emit('location', username, x, y, angle, socket.id);
          console.log(`Moved ${username} (${socket.id}) to ${x},${y}`);
      }
    playerToMove['xPos'] = x;
    playerToMove['yPos'] = y;
    playerToMove['angle'] = angle;
  });

  socket.on('newPlayer', (username, x, y) => {
    console.log(`New player: ${username}`);
    socket.broadcast.emit('createPlayer', username, x, y, socket.id);
    activePlayers.forEach(activePlayer => {
      socket.emit('createPlayer', activePlayer['username'], activePlayer['xPos'], activePlayer['yPos'], activePlayer['socketId'])
    });
    console.log('Pushing new player ', username);
    activePlayers.push({
      'username':username,
      'xPos':x,
      'yPos':y,
      'angle':0,
      'socketId':socket.id
    });
    console.log('Pushed player ', find(activePlayers, {'username':username}));
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
