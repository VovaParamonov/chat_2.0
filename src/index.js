import DOM from './DOM.js';
import './css/style.css';

let socket = io();

let userID;
let userName;
let userColor;

let onlineList;

/*DOM init*/
let dom = new DOM();

dom.onMessageSend((text) => {
    socket.emit('send message', {text: text, name: userName});
});

dom.onRegisterFormSend((registerData) => {
    socket.emit('userRegister', registerData);
});

dom.onLoginFormSend((userData) => {
    socket.emit('userLogin', userData);
});

dom.onSendWrite(() => {
    socket.emit('send write', {id: userID, name: userName});
});

dom.onSendSettings((colorID) => {
    socket.emit('send settings', {color: colorID, name: userName});
});

/*socket events*/
socket.on('get message', (message) => {
    dom.addMessage(message);
    dom.chatStyleReload(userName);
});

socket.on('new user', () => {
    console.log('Подключился новый пользователь');
});

socket.on('check online', () => {
    socket.emit('check online', userID, userName, userColor);
});

socket.on('get onlineList', (list) => {
    console.log('Список пользователей получен:');
    onlineList = list;
    dom.onlineListReload(onlineList);
    dom.chatStyleReload(userName);
});

socket.on('authorization', (userData) => {
    userID = userData.id;
    userName = userData.name;
    userColor = userData.color;

    dom.hideForm();

    alert('Вы были авторизованы');
});

/*----Как иначе?--->*/
let writeTimer;
/*<--------------*/
socket.on('get write', (user) => {
    dom.userWrite(user);
    clearTimeout(writeTimer);
    writeTimer = setTimeout(() => {
        dom.writeClear();
    }, 1000);
});

socket.on('err', (text) => {
    alert(text);
});




