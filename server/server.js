const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

let users = [];
let onlineList = [];

app.use(express.static(path.join(__dirname, '../public/dist')));

/*Server events*/
io.on('connection', (socket) => {
    console.log('Пользователь подключился: ' + socket.id);

    socket.on('disconnect', () => {
        userDisconnect(socket.id);
    });
    socket.on('send message', (message) => {
        message.userID = socket.id;
        if (checkOnline(message.name)) {
            io.emit('get message', message);
        }
    });

    socket.on('get onlineList', () => {
        socket.emit('get onlineList', onlineList);
    });

    socket.on('check online', (ID, Name, Color) => {
        if (ID && Name && Color) {
            addOnlineUser(ID, Name, Color);
        }
    });

    socket.on('userRegister', (userData) => {
        if (!checkName(userData.name)) {
            users.push(userData);

            userData.id = socket.id;

            addOnlineUser(userData.id, userData.name, userData.color);

            socket.emit('authorization', userData);
            socket.broadcast.emit('new user');
        } else {
            socket.emit('err', 'Это имя уже зарегистрировано');
        }
    });

    socket.on('userLogin', (userData) => {
        if (checkName(userData.name)) {
            let user = users.filter((item) => (item.name == userData.name))[0];

            if (userData.password === user.password) {
                if (!checkOnline(user.name)) {
                    user.id = socket.id;

                    addOnlineUser(user.id, user.name, user.color);

                    socket.emit('authorization', user);
                    socket.broadcast.emit('new user');
                } else {
                    socket.emit('err', 'Данный пользователь сейчас онлайн');
                }
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
        onlineList.forEach((item) => {
            if (item.name == settings.name) {
                item.color = settings.color;
            }
        });
        io.emit('get onlineList', onlineList);
    });

    socket.on('send write', (user) => {
        io.emit('get write', user);
    });
});

/*Other funcs*/
function addOnlineUser(ID, Name, Color) {
    onlineList.push({id: ID, name: Name, color: Color});
    io.emit('get onlineList', onlineList);
}

function checkName(name) {
    return users.some((elem) => {
        return elem.name == name;
    });
}

function checkOnline(name) {
    return onlineList.some((elem) => {
        return elem.name == name;
    });
}

function userDisconnect(ID) {
    onlineList = onlineList.filter((user) => (!(user.id === ID)));
    io.emit('get onlineList', onlineList);
}

http.listen(8080, function () {
    console.log('listening on *:8080');
});