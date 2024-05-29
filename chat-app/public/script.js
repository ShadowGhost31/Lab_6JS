const socket = io();

const params = new URLSearchParams(window.location.search);
const username = params.get('username');
const room = params.get('room');

document.getElementById('send').addEventListener('click', () => {
    const message = document.getElementById('message').value;
    if (message.startsWith('@')) {
        const [user, ...text] = message.split(':');
        const privateMessage = text.join(':').trim();
        socket.emit('sendMessage', { room, message: privateMessage, username: user.slice(1).trim() });
    } else {
        socket.emit('sendMessage', { room, message, username });
    }
    document.getElementById('message').value = '';
});

document.getElementById('message').addEventListener('keypress', () => {
    socket.emit('userIsTyping', { room, username });
});

socket.emit('join', { room, username });

socket.on('message', (message) => {
    const output = document.getElementById('output');
    output.innerHTML += `<p>${message}</p>`;
    output.scrollTop = output.scrollHeight;
});

socket.on('userIsTyping', (username) => {
    const feedback = document.getElementById('feedback');
    if (username) {
        feedback.innerHTML = `<p><em>${username} is typing...</em></p>`;
    } else {
        feedback.innerHTML = '';
    }
});

socket.on('roomData', ({ users }) => {
    console.log(users);
});
