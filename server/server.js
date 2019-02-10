const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

let users = [];

app.use(express.static(path.join(__dirname, '../public/dist')));

/*Server events*/
io.on('connection', (socket) => {
    socket.on('userRegister', (userData) => {
        if (!getUserByName(userData.name)) {
            userData.id = [socket.id];

            addRegisterUser(userData);

            socket.emit('authorization', userData);
            socket.broadcast.emit('new user');
        } else {
            socket.emit('err', 'Это имя уже зарегистрировано');
        }
    });

    socket.on('userLogin', userData => {
        let user = getUserByName(userData.name);
        if (user) {
            if (userData.password === user.password) {
                addOnlineUser({id:socket.id, name:userData.name});

                socket.emit('authorization', user);
                socket.broadcast.emit('new user');
            } else {
                socket.emit('err', 'Неверный пароль');
            }

        } else {
            socket.emit('err', 'Данное имя не зарегистрированно');
        }
    });

    socket.on('disconnect', () => {
        userDisconnect(socket.id);
    });

    socket.on('message', message => {
        if (getUserById(socket.id)) {
            message.userID = socket.id;
            message.color = getUserById(socket.id).color;
            io.emit('message', message);
        }
    });

    socket.on('settings', (settings) => {
        setNewColor(settings.name, settings.color);
    });

    socket.on('write', (user) => {
        if (getUserById(socket.id)) {
            socket.broadcast.emit('write', user);
        }
    });
});

/*Other funcs*/
function addRegisterUser(user) {
    users.push(user);

    onlineListReload();
}

function addOnlineUser(user) {
    users.forEach((elem) => {
        if (elem.name == user.name) {
            elem.id.push(user.id);
        }
    });

    onlineListReload();
}

function getUserByName(name) {
    return users.find(elem => elem.name === name);
}

function getUserById(id) {
    return users.find(elem => elem.id.indexOf(id) !== -1);
}

function userDisconnect(ID) {
    let user = users.find(elem => (elem.id.indexOf(ID) !== -1));

    if (user) {
        user.id = user.id.filter( id => id !== ID);
    }

    onlineListReload();
}

function onlineListReload() {
    let onlineList = users
        .filter(elem => elem.id.length)
        .map(elem => ({
            id: elem.id,
            name: elem.name,
            color: elem.color
        }));

    io.emit('onlineList', onlineList);
}

function setNewColor(name, color) {
    let user = getUserByName(name);
    let userIndex = users.indexOf(user);

    user.color = color;

    users[userIndex] = user;

    onlineListReload();
}

http.listen(8080, function () {
    console.log('listening on *:8080');
});