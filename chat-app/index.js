const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', ({ room, username }) => {
        socket.join(room);
        socket.username = username; // Зберігаємо ім'я користувача
        socket.to(room).emit('message', { username: 'System', text: `${username} has joined the room` });
        io.to(room).emit('roomData', {
            room,
            users: getUsersInRoom(room)
        });
    });

    socket.on('sendMessage', ({ room, message }) => {
        io.to(room).emit('message', { username: socket.username, text: message });
    });

    socket.on('userIsTyping', ({ room, username }) => {
        socket.to(room).emit('userIsTyping', username);
        setTimeout(() => {
            socket.to(room).emit('userIsTyping', '');
        }, 2000);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

function getUsersInRoom(room) {
    const clients = io.sockets.adapter.rooms.get(room);
    if (clients) {
        return Array.from(clients).map(clientId => io.sockets.sockets.get(clientId).username);
    }
    return [];
}

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
