import $ from 'jquery';

export default class DOM {
    constructor() {
        this.$html = $('html');
        this.$input = $('#input');
        this.$messageForm = $('.messageForm');
        this.$msgsField = $('.messages_ul');
        this.$popupWrapper = $('.popupWrapper');
        this.$loginWindow = $('.loginWindow');
        this.$registerWindow = $('.registerWindow');
        this.$settingsWindow = $('.settingsWindow');
        this.$clear = $('.a_Clear');
        this.$a_settings = $('.a_settings');
        this.$onlineListButton = $('.a_online');
        this.$a_register = $('.loginWindow form a');
        this.$a_login = $('.registerWindow form a');
        this.$registerForm = $('.registerWindow form');
        this.$loginForm = $('.loginWindow form');
        this.$settingsForm = $('.settingsWindow form');
        this.$onlineList = $('.onlineListWindow ul');
        this.$onlineListWindow = $('.onlineListWindow');
        this.$writeInfo = $('.writeInfo');
        this.$smileButton = $('.smileButton');
        this.$smilesWrapper = $('.smilesWrapper');
        this.$smiles = $('.smiles');
        this.$smilesArray = $('.smiles a');

        this.bindEvents();

        this.smileInit()
    }

    /*methods for learning*/
    onMessageSend(CB) {
        this.sendMessage = CB;
    }

    onGetOnlineList(CB) {
        this.getOnlineList = CB;
    }

    onRegisterFormSend(CB) {
        this.registerFormSend = CB;
    }

    onLoginFormSend(CB) {
        this.loginFormSend = CB;
    }

    onSendWrite(CB) {
        this.sendWrite = CB;
    }

    onSendSettigs(CB) {
        this.sendSettings = CB;
    }

    /**
     * @param message[
     *      text;
     *      userID;
     *      name;
     * ]
     */
    addMessage(message) {
        let $message = $('<li></li>').attr('data-user-id', message.userID);
        $message.append($('<span class="userName"></span>').text(message.name));
        message.text = this.smileReplace(message.text);
        $message.append('<p>' + message.text + '</p>');
        if ($message.children('p').text().trim() == '') {
            $message.children('p').children('span').css({
                'transform': 'scale(1.6)',
                'margin-bottom': '0px',
                'margin-right': '5px'
            });
        }
        this.$msgsField.prepend($message);
    }

    smileReplace(text) {
        let smileInter = 0;
        while (smileInter !== -1) {
            smileInter = text.indexOf('#');
            if (smileInter !== -1) {
                let smileEnd = text.indexOf('/', smileInter + 1);
                let smileID = text.slice(smileInter + 1, smileEnd);
                let posX = -(smileID % 5 * 25) + 'px';
                let posY = -(parseInt(smileID / 5) * 25) + 2 + 'px';
                let smileElement = `<span data-smile-id="${smileID}" style="background-position: ${posX} ${posY};"></span>`;
                text = `${text.slice(0, smileInter)} ${smileElement} ${text.slice(smileEnd + 1)}`;
            }
        }
        return text;
    }

    clearMessages() {
        this.$msgsField.html('');
    }

    smileInit() {
        this.$smilesArray.each((index, smile) => {
            let posX = -(index % 5 * 45) + 'px';
            let posY = -(parseInt(index / 5) * 45) + 'px';
            let smileID = '#' + index + '/';

            $(smile).css({'background-position': posX + ' ' + posY});
            $(smile).attr('data-smile-id', smileID);
        });
    }

    showFormLogin() {
        this.$popupWrapper.show();
        this.$registerWindow.hide();
        this.$settingsWindow.hide();
        this.$loginWindow.show();
    }

    showFormRegister() {
        this.$popupWrapper.show();
        this.$loginWindow.hide();
        this.$settingsWindow.hide();
        this.$registerWindow.show();
    }

    showFormSettings() {
        this.$settingsWindow.show();
        this.$popupWrapper.show();
        this.$loginWindow.hide();
        this.$registerWindow.hide();
    }

    hideForm() {
        this.$popupWrapper.hide();
    }

    toggleOnlineList() {
        this.$onlineListWindow.slideToggle();
    }

    getText() {
        return this.$input.val();
    }

    onlineListReload(list) {
        this.$onlineList.html('');
        list.forEach((item) => {
            let listItem = $('<li></li>').text(item.name).attr('data-user-id', item.id).attr('data-user-color', item.color);
            this.$onlineList.append(listItem);
        })
    }

    chatStyleReload(myID) {
        this.$msgsField.children('li').each((index, item) => {
            let itemID = $(item).attr('data-user-id');

            if (itemID == myID) {
                $(item).css({'text-align': 'right'});
            }

            $(item).children('span').css({'background-color': this.getColor(itemID)});
        });
    }

    getColor(id) {
        let color;

        this.$onlineList.children('li').each((index, item) => {
            let itemID = $(item).attr('data-user-id');
            let itemColor = $(item).attr('data-user-color');
            if (itemID == id) {
                color = itemColor;
            }
        });

        return color;
    }

    userWrite(user) {
        this.$writeInfo.text(user.name + ' набирает сообщение...');
    }

    writeClear() {
        this.$writeInfo.text('');
    }

    bindEvents() {
        this.$messageForm.on('submit', (e) => {
            e.preventDefault();
            if (this.getText().trim()) {
                this.sendMessage(this.getText());
            }
            this.$smilesWrapper.hide();
            this.$input.val('');
        });

        this.$clear.on('click', (e) => {
            e.preventDefault();
            this.clearMessages();
        });

        this.$onlineListButton.on('click', (e) => {
            e.preventDefault();
            this.getOnlineList();
            this.toggleOnlineList();
        });

        this.$a_register.on('click', (e) => {
            e.preventDefault();
            this.showFormRegister();
        });

        this.$a_login.on('click', (e) => {
            e.preventDefault();
            this.showFormLogin();
        });
        this.$registerForm.on('submit', (e) => {
            e.preventDefault();
            let formName = $('.register__name').val();
            let formPassword = $('.register__password').val();
            let formColor = $('.registerWindow .settings__colors input:checked').attr('data-colorID');

            if (formName.trim() && formPassword.trim() && formColor.trim()) {
                this.registerFormSend({name: formName, password: formPassword, color: formColor});
            } else {
                alert('Недостаточно данных');
            }
        });

        this.$loginForm.on('submit', (e) => {
            e.preventDefault();
            let formName = $('.login__name').val();
            let formPassword = $('.login__password').val();

            if (formName.trim() && formPassword.trim()) {
                this.loginFormSend({name: formName, password: formPassword});
            } else {
                alert('Недостаточно данных');
            }
        });

        this.$input.on('input change', () => {
            this.sendWrite();
            this.$smilesWrapper.hide();
        });

        this.$smileButton.on('click', (e) => {
            e.preventDefault();
            this.$smilesWrapper.slideToggle();
        });

        this.$smilesArray.on('click', (e) => {
            e.preventDefault();
            this.$input.val(this.$input.val() + $(e.currentTarget).attr('data-smile-id'));
        });

        this.$html.on('click', (e) => {
            if (!($(e.target).hasClass('smile')) && !($(e.target).hasClass('smileButton'))) {
                this.$smilesWrapper.hide();
            }
        });

        this.$a_settings.on('click', (e) => {
            e.preventDefault();
            this.showFormSettings()
        });

        this.$settingsForm.on('submit', (e) => {
            e.preventDefault();
            this.sendSettings($('.settingsWindow .settings__colors input:checked').attr('data-colorID'));
            this.hideForm();
        });
    }
}
