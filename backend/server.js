'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _comment = require('./models/comment');

var _comment2 = _interopRequireDefault(_comment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var app = (0, _express2.default)();
// const router = express.Router();
var server = _http2.default.createServer(app);
var io = (0, _socket2.default)(server);

var API_PORT = process.env.PORT || 3001;

_mongoose2.default.connect(_config2.default.mongoURL, function (error) {
    if (error) {
        console.error('Please make sure Mongodb is installed and running!');
        throw error;
    }
});
var db = _mongoose2.default.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(_bodyParser2.default.urlencoded({ extended: true }));
app.use(_bodyParser2.default.json());
app.use((0, _morgan2.default)('dev'));
if (process.env.NODE_ENV === 'production') {
    app.use(_express2.default.static('../client/build'));
}

io.on('connection', function (socket) {
    console.log('User connected');

    socket.on('change color', function (color) {
        // once we get a 'change color' event from one of our clients, we will send it to the rest of the clients
        // we make use of the socket.emit method again with the argument given to use from the callback function above
        console.log('Color Changed to: ', color);
        io.sockets.emit('change color', color);
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});

var users = {};

var getUsers = function getUsers() {
    return Object.keys(users).map(function (key) {
        return users[key].username;
    });
};

var createSocket = function createSocket(user) {
    var cur_user = users[user.uid],
        updated_user = _defineProperty({}, user.uid, Object.assign(cur_user, { sockets: [].concat(_toConsumableArray(cur_user.sockets), [user.socket_id]) }));
    users = Object.assign(users, updated_user);
};

var createUser = function createUser(user) {
    users = Object.assign(_defineProperty({}, user.uid, {
        username: user.username,
        uid: user.uid,
        sockets: [user.socket_id]
    }), users);
};

var removeSocket = function removeSocket(socket_id) {
    var uid = '';
    Object.keys(users).map(function (key) {
        var sockets = users[key].sockets;
        if (sockets.indexOf(socket_id) !== -1) {
            uid = key;
        }
    });
    var user = users[uid];
    if (user.sockets.length > 1) {
        // Remove socket only
        var index = user.sockets.indexOf(socket_id);
        var updated_user = _defineProperty({}, uid, Object.assign(user, {
            sockets: user.sockets.slice(0, index).concat(user.sockets.slice(index + 1))
        }));
        users = Object.assign(users, updated_user);
    } else {
        // Remove user by key
        var clone_users = Object.assign({}, users);
        delete clone_users[uid];
        users = clone_users;
    }
};

// server.get('/', (req, res) => {
//   res.json({ message: 'Hello, World!' });
// });

app.get('/comments', function (req, res) {
    _comment2.default.find(function (err, comments) {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data: comments });
    });
});

app.post('/comments', function (req, res) {
    var comment = new _comment2.default();
    var _req$body = req.body,
        author = _req$body.author,
        text = _req$body.text;

    if (!author || !text) {
        return res.json({
            success: false,
            error: 'You must provide an author and comment'
        });
    }
    comment.author = author;
    comment.text = text;
    comment.save(function (err) {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true });
    });
});

app.put('/comments/:commentId', function (req, res) {
    console.log(req.params);
    var commentId = req.params.commentId;

    if (!commentId) {
        return res.json({ success: false, error: 'No comment id provided' });
    }
    _comment2.default.findById(commentId, function (error, comment) {
        if (error) return res.json({ success: false, error: error });
        var _req$body2 = req.body,
            author = _req$body2.author,
            text = _req$body2.text;

        if (author) comment.author = author;
        if (text) comment.text = text;
        comment.save(function (error) {
            if (error) return res.json({ success: false, error: error });
            return res.json({ success: true });
        });
    });
});

app.delete('/comments/:commentId', function (req, res) {
    var commentId = req.params.commentId;

    if (!commentId) {
        return res.json({ success: false, error: 'No comment id provided' });
    }
    _comment2.default.remove({ _id: commentId }, function (error, comment) {
        if (error) return res.json({ success: false, error: error });
        return res.json({ success: true });
    });
});

io.on('connection', function (socket) {
    var query = socket.request._query,
        user = {
        username: query.username,
        uid: query.uid,
        socket_id: socket.id
    };

    if (users[user.uid] !== undefined) {
        createSocket(user);
        socket.emit('updateUsersList', getUsers());
    } else {
        createUser(user);
        io.emit('updateUsersList', getUsers());
    }

    socket.on('message', function (data) {
        console.log(data);
        socket.broadcast.emit('message', {
            username: data.username,
            message: data.message,
            uid: data.uid
        });
    });

    socket.on('disconnect', function () {
        removeSocket(socket.id);
        io.emit('updateUsersList', getUsers());
    });
});

//app.use('/api', server);
//app.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`));

server.listen(API_PORT, function () {
    return console.log('Listening on port ' + API_PORT);
});