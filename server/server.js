const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

let users = [];

app.use(express.static(path.join(__dirname, '../public/dist')));

/*Server events*/
io.on('connection', (socket) => {
    console.log('Пользователь подключился: ' + socket.id);

    socket.on('disconnect', () => {
        userDisconnect(socket.id);
    });

    socket.on('send message', (message) => {
        message.userID = socket.id;
        message.color = getUserById(message.userID).color;
        
        if (checkOnline(message.userID)) {
            io.emit('get message', message);
        }
    });

    socket.on('get onlineList', () => {
        let onlineList = users.filter(elem => elem.id.length);
        onlineList.forEach(elem => delete elem.password);
        socket.emit('get onlineList', onlineList);
    });

    socket.on('check online', (ID, Name, Color) => {
        if (ID && Name && Color) {
            addOnlineUser({id: ID, name:Name, color:Color});
        }
    });

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

    socket.on('userLogin', (userData) => {
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

    socket.on('send settings', (settings) => {
        users.forEach((item) => {
            if (item.name === settings.name) {
                item.color = settings.color;
            }

        });
        users.forEach((item) => {
            if (item.name == settings.name) {
                item.color = settings.color;
            }
        });
        io.emit('get onlineList', users);
    });

    socket.on('send write', (user) => {
        io.emit('get write', user);
    });
});

/*Other funcs*/
function addRegisterUser(user) {
    users.push(user);

    io.emit('get onlineList', users);
}

function addOnlineUser(user) {
    users.forEach((elem) => {
        if (elem.name == user.name) {
            elem.id.push(user.id);
        }
    });

    io.emit('get onlineList', users);
}

function getUserByName(name) {
    return users.find(elem => elem.name === name);
}

function getUserById(id) {
    return users.find((elem) => {
        return elem.id.some( ID => ID === id);
    });
}

function checkOnline(id) {
    return users.find((elem) => {
        return elem.id.some((ID) => (ID == id));
    });
}

function userDisconnect(ID) {
    users.forEach((user) => {
        if (user.id.find(id => ID)) {
            user.id = user.id.filter((id) => (id !== ID));
        }
    });

    io.emit('get onlineList', users);
}

http.listen(8080, function () {
    console.log('listening on *:8080');
});