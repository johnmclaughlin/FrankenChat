import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import http from 'http';
import socketIO from 'socket.io';
import config from './config';
import Comment from './models/comment';

const app = express();
// const router = express.Router();
const server = http.createServer(app);
const io = socketIO(server)

const API_PORT = process.env.PORT || 3001;

mongoose.connect(config.mongoURL, (error) => {
  if (error) {
    console.error('Please make sure Mongodb is installed and running!');
    throw error;
  }
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('/client/build'));
  }

io.on('connection', socket => {
    console.log('User connected')

    socket.on('change color', (color) => {
        // once we get a 'change color' event from one of our clients, we will send it to the rest of the clients
        // we make use of the socket.emit method again with the argument given to use from the callback function above
        console.log('Color Changed to: ', color)
        io.sockets.emit('change color', color)
      })
    
    socket.on('disconnect', () => {
      console.log('user disconnected')
    })
  })

let users = {};

let getUsers = () => {
    return Object.keys(users).map(function(key){
        return users[key].username
    });
};

let createSocket = (user) => {
    let cur_user = users[user.uid],
        updated_user = {
            [user.uid] : Object.assign(cur_user, {sockets : [...cur_user.sockets, user.socket_id]})
        };
    users = Object.assign(users, updated_user);
};

let createUser = (user) => {
    users = Object.assign({
        [user.uid] : {
            username : user.username,
            uid : user.uid,
            sockets : [user.socket_id]
        }
    }, users);
};

let removeSocket = (socket_id) => {
    let uid = '';
    Object.keys(users).map(function(key){
        let sockets = users[key].sockets;
        if(sockets.indexOf(socket_id) !== -1){
            uid = key;
        }
    });
    let user = users[uid];
    if(user.sockets.length > 1){
        // Remove socket only
        let index = user.sockets.indexOf(socket_id);
        let updated_user = {
            [uid] : Object.assign(user, {
                sockets : user.sockets.slice(0,index).concat(user.sockets.slice(index+1))
            })
        };
        users = Object.assign(users, updated_user);
    }else{
        // Remove user by key
        let clone_users = Object.assign({}, users);
        delete clone_users[uid];
        users = clone_users;
    }
};

// server.get('/', (req, res) => {
//   res.json({ message: 'Hello, World!' });
// });

app.get('/comments', (req, res) => {
  Comment.find((err, comments) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: comments });
  });
});

app.post('/comments', (req, res) => {
  const comment = new Comment();
  const { author, text } = req.body;
  if (!author || !text) {
    return res.json({
      success: false,
      error: 'You must provide an author and comment'
    });
  }
  comment.author = author;
  comment.text = text;
  comment.save(err => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

app.put('/comments/:commentId', (req, res) => {
  console.log(req.params);
  const { commentId } = req.params;
  if (!commentId) {
    return res.json({ success: false, error: 'No comment id provided' });
  }
  Comment.findById(commentId, (error, comment) => {
    if (error) return res.json({ success: false, error });
    const { author, text } = req.body;
    if (author) comment.author = author;
    if (text) comment.text = text;
    comment.save(error => {
      if (error) return res.json({ success: false, error });
      return res.json({ success: true });
    });
  });
});

app.delete('/comments/:commentId', (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    return res.json({ success: false, error: 'No comment id provided' });
  }
  Comment.remove({ _id: commentId }, (error, comment) => {
    if (error) return res.json({ success: false, error });
    return res.json({ success: true });
  });
});

io.on('connection', (socket) => {
  let query = socket.request._query,
      user = {
          username : query.username,
          uid : query.uid,
          socket_id : socket.id
      };

  if(users[user.uid] !== undefined){
      createSocket(user);
      socket.emit('updateUsersList', getUsers());
  }
  else{
      createUser(user);
      io.emit('updateUsersList', getUsers());
  }

  socket.on('message', (data) => {
      console.log(data);
      socket.broadcast.emit('message', {
          username : data.username,
          message : data.message,
          uid : data.uid
      });
  });

  socket.on('disconnect', () => {
      removeSocket(socket.id);
      io.emit('updateUsersList', getUsers());
  });
});

//app.use('/api', server);
//app.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`));

server.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`))