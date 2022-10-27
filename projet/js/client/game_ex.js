window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

var groundCv = document.getElementById("ground");
var groundCtx = groundCv.getContext("2d");

var objectCv = document.getElementById("object");
var objectCtx = objectCv.getContext("2d");

objectCtx.font = 'normal normal 100 12px arial';
objectCtx.lineWidth = 1;
objectCtx.backgroung = 'blue';
var socket = io();
var canvasDim = {
    width: groundCv.width,
    height: groundCv.height
};
//Moving of the characters
var direction = {
    "ArrowRight": 16,
    "ArrowLeft": 48,
    "ArrowUp": 32,
    "ArrowDown": 0
};
//Name
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const userName = urlParams.get('user');
const character = urlParams.get('character');
var socket_id;//Store the socket id of this player used to know who is the player of the webpage
//Choose the good sprite from the url
var sprite_choice;
//Chat
var chat_answer = undefined;//Store the answer of the chat request undefined: we don't know , true: accepted, false : refused
var chat_answered = false;//Store if the chat request has been answereed
var id_answer_chat_request = 0;//Store the id from the chat request
var on_chat_request = false;//Stop the movement to wait for an answer from the user
var conversation = {};
switch (character) {
    case "avatar1": sprite_choice = "1";
        break;
    case "avatar2": sprite_choice = "2";
        break;
    case "avatar3": sprite_choice = "3";
        break;
    default:
        sprite_choice = "1";
        break;
}
document.onkeydown = function (e) {
    if (direction[e.key] === undefined) {
        return;
    }
    if (!on_chat_request) {
        socket.emit('movement_keydown', e.key);
    }
};

//When the user release the key set the character to stable position.
document.onkeyup = function (e) {
    if (direction[e.key] === undefined) {
        return;
    }
    if (!on_chat_request) {
        socket.emit('movement_keyup', e.key);
    }
};


// Sprite loading
var sprite = {
    mapfinale: null
}

var spriteLoaded = function () {

    this.loaded = true;

    for (var name in sprite) {
        if (!sprite[name].loaded) {
            return;
        }
    }

    init();
};

sprite.mapfinale = new Image();
sprite.mapfinale.src = "../../ressource/texture/mapfinale.png";
sprite.mapfinale.onload = spriteLoaded;
sprite.mapfinale
const nb=50;
function init() {
    groundCtx.drawImage(sprite.mapfinale,0,0);
}



var NewUsersMessages = document.getElementById('NewUsersMessages');
var typingSpace = document.getElementById('typingSpace');
var typing = false;

socket.on('user joined', function (username) {
    if (NewUsersMessages.childElementCount > 2) {
        NewUsersMessages.removeChild(NewUsersMessages.lastChild);
    }
    var item = document.createElement('li');
    item.textContent = " Hi I'm " + username + " |";
    NewUsersMessages.insertBefore(item, NewUsersMessages.firstChild);
    socket.emit('get_socket_id');
});

socket.on('count_users', function (numberOfUsers) {
    document.getElementById("NbUsers").innerHTML = "Users :" + numberOfUsers;
});
socket.on('user left', function (username) {
    if (NewUsersMessages.childElementCount > 2) {
        NewUsersMessages.removeChild(NewUsersMessages.lastChild);
    }
    var item = document.createElement('li');
    item.textContent = " I'm " + username + " and I'm gone |";
    NewUsersMessages.insertBefore(item, NewUsersMessages.firstChild);

});
socket.on('chat message', function (data) {
    var concat = data.id + data.other_id;
    var reversed_concat = data.other_id + data.id;
    time = new Date();
    time=time.getHours() + ":" + time.getMinutes();
    if (conversation[concat] != undefined) {//If the concat is found
        conversation[concat].nb_message++;
        if (conversation[concat].last_message == 5) {
            conversation[concat].last_message = 0;
            conversation[concat].time[conversation[concat].last_message] = time;
            conversation[concat].content_message[conversation[concat].last_message] = data.message;
            conversation[concat].sender_message[conversation[concat].last_message] = data.username;
            conversation[concat].last_message++;

        } else {
            conversation[concat].time[conversation[concat].last_message] = time;
            conversation[concat].content_message[conversation[concat].last_message] = data.message;
            conversation[concat].sender_message[conversation[concat].last_message] = data.username;
            conversation[concat].last_message++;
        }
    } else {
        if (conversation[reversed_concat] != undefined) {//it's the reversed one
            conversation[reversed_concat].nb_message++;
            if (conversation[reversed_concat].last_message == 5) {
                conversation[reversed_concat].last_message = 0;
                conversation[reversed_concat].time[conversation[reversed_concat].last_message] = time;
                conversation[reversed_concat].content_message[conversation[reversed_concat].last_message] = data.message;
                conversation[reversed_concat].sender_message[conversation[reversed_concat].last_message] = data.username;
                conversation[reversed_concat].last_message++;

            } else {
                conversation[reversed_concat].time[conversation[reversed_concat].last_message] = time;
                conversation[reversed_concat].content_message[conversation[reversed_concat].last_message] = data.message;
                conversation[reversed_concat].sender_message[conversation[reversed_concat].last_message] = data.username;
                conversation[reversed_concat].last_message++;
            }
        }
    }
    var item = document.createElement('li');
    item.textContent = time + " | " + data.username + " : " + data.message;
    messages.appendChild(item);
    document.getElementById('messages').scrollTo(0, document.getElementById('messages').scrollHeight);
});
socket.on('new_user_is_coming', function () {
    socket.emit('new_user', userName, sprite_choice);
});
var i = 0;
socket.on('is_moving', function (users) {
    for (var id in users) {
        var user = users[id];
        var user1 = users[socket_id];
        var taille_joueur = 32;
        if (id != socket_id && user.inChat == 0 && user1.inChat == 0) {
            if (user.x < user1.x + taille_joueur &&
                user.x + taille_joueur > user1.x &&
                user.y < user1.y + taille_joueur &&
                taille_joueur + user.y > user1.y) {
                socket.emit('ask_chat', id);
                i++;
            }
        }
        if (id != socket_id && user.inChat == socket_id && user1.inChat == id) {
            if (!(user.x < user1.x + taille_joueur &&
                user.x + taille_joueur > user1.x &&
                user.y < user1.y + taille_joueur &&
                taille_joueur + user.y > user1.y)) {
                closeChat();
                i++;
            }
        }
    }
    socket.emit('drawavatars');
});
socket.on('pop_up', function (id, users) {
    openPopup(users[id].Username)
    id_answer_chat_request = id;
    waitForIt();
});
socket.on('chat_is_refused', function () {
    openMessage("Chat refused");
    closePopup();
});
socket.on('drawingavatars', function (users) {
    objectCtx.clearRect(0, 0, 800, 600);
    for (var id in users) {
        var user = users[id];
        var avatar = new Image();
        avatar.src = "../../ressource/sprite/S_0" + user.Sprite + ".png";
        objectCtx.strokeText(user.Username, user.x + 16 - objectCtx.measureText(user.Username).width / 2, user.y - 2);
        objectCtx.drawImage(avatar, user.sx, user.sy, 16, 16, user.x, user.y, 32, 32);
    }
})
socket.on('socket_id', function (id) {
    socket_id = id;
});
input.onkeyup = function () {
    if (typing == false) {
        socket.emit('typing');
        typing = true;
    }
}
socket.on('typing', function (username) {
    typingSpace.innerHTML = typingSpace.innerHTML + " " + username + " is typing ... ";
});
socket.on('stop typing', function () {
    typingSpace.innerHTML = "";

});

socket.on('beginChat', function (id, id_other) {
    document.getElementById("messages").innerHTML = '';
    var concat = id + id_other;
    reversed_concat = id_other + id;

    if (conversation[concat] != undefined || conversation[reversed_concat] != undefined) {//Conversation already exist so we load the messages
        conversation_temp = conversation[concat] || conversation[reversed_concat];//Get the one that exist
        console.log(conversation_temp);
        if (conversation_temp.nb_message != 0) {//Has messages in it

            if (conversation_temp.nb_message > 5) {
                for (var counter = conversation_temp.last_message; counter < 5; counter++) {
                    var item = document.createElement('li');
                    item.textContent = conversation_temp.time[counter]+ " | " + conversation_temp.sender_message[counter] + " : " + conversation_temp.content_message[counter];
                    messages.appendChild(item);
                }
            }
            for (var counter = 0; counter <= conversation_temp.last_message - 1; counter++) {
                var item = document.createElement('li');
                item.textContent = conversation_temp.time[counter]+ " | " + conversation_temp.sender_message[counter] + " : " + conversation_temp.content_message[counter];
                messages.appendChild(item);
            }

        }
    } else {//Does not exist yet so we initialise it
        conversation[concat] = {
            content_message: {},
            sender_message: {},
            time: {},
            nb_message: 0,
            last_message: 0
        }
    }
    document.getElementById("messageContainer").style.display = "block";

});
socket.on('chat_is_done', function (name) {
    document.getElementById("messageContainer").style.display = "none";
});

//Popup
function openPopup(username) {
    document.getElementById("popupChat").style.display = "block";
    document.getElementById("Username").innerText = username + " ?";
    on_chat_request = true;
}
function closePopup() {
    document.getElementById("popupChat").style.display = "none";
}
function chatRequestRefused() {
    closePopup();
    chat_answer = false;
    chat_answered = true;

}
function chatRequestAccepted() {
    closePopup();
    chat_answer = true;
    chat_answered = true;

}
function openMessage(text) {
    document.getElementById("Popup-text").innerText = text;
    document.getElementById("popupMessage").style.display = "block";

}
function closeMessage() {
    document.getElementById("popupMessage").style.display = "none";
    on_chat_request = false;
}
function waitForIt() {
    if (!chat_answered) {
        setTimeout(waitForIt, 2500);
    } else {
        displayRefusedAnswer(id_answer_chat_request);
    }
}
function displayRefusedAnswer(id) {
    if (chat_answer == true) {
        socket.emit('chat_accepted', id);
        chat_answered = false;
        chat_answer = undefined;
        on_chat_request = false;
    } else {
        if (chat_answer == false) {
            socket.emit('chat_refused', id);
            chat_answered = false;
            chat_answer = undefined;
            on_chat_request = false;
            id_answer_chat_request = 0;
        }
    }
}
function sendMessage() {
    var input = document.getElementById('input');
    if (input.value) {
        socket.emit('chat message', input.value);
        socket.emit('stop typing');
        typing = false;
        input.value = '';
    }
}
function closeChat() {
    socket.emit('leave_chat');
    document.getElementById("messageContainer").style.display = "none";
    id_answer_chat_request = 0;
}
document.getElementById("input").addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        sendMessage();
    }
});

