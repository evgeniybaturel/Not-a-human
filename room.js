// ============================================================
// ROOM SYSTEM
// NOT A HUMAN
// Stable room manager v2
// ============================================================


let currentRoomId = null;

let myPlayerId = null;

let myRole = null;

let gameStarted = false;

let heartbeatTimer = null;







// ============================================================
// PLAYER ID
// ============================================================


function createPlayerId(){


    let saved =
    localStorage.getItem(
        "notHumanPlayerId"
    );


    if(saved)
        return saved;



    let id =
    "player_" +
    Math.random()
    .toString(36)
    .substring(2,10);



    localStorage.setItem(
        "notHumanPlayerId",
        id
    );


    return id;


}









// ============================================================
// ROOM CODE
// ============================================================


function generateRoomCode(){


const chars =
"ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


let code = "";


for(let i = 0; i < 6; i++){


    code +=
    chars[
        Math.floor(
            Math.random() *
            chars.length
        )
    ];


}


return code;


}









// ============================================================
// CREATE ROOM
// ============================================================


async function createRoom(){


myPlayerId =
createPlayerId();


myRole =
"player1";


const code =
generateRoomCode();


currentRoomId =
code;



localStorage.setItem(
"notHumanRoom",
code
);


localStorage.setItem(
"notHumanRole",
myRole
);






await database
.ref(
"rooms/" + code
)
.set({

created:
Date.now(),


status:
"waiting",



player1:{


id:
myPlayerId,


online:true,


lastSeen:
Date.now(),


score:0


},



player2:null,


game:null


});







// очистка при закрытии

database
.ref(
"rooms/" +
code +
"/player1"
)
.onDisconnect()
.update({

online:false,

lastSeen:
Date.now()

});







showCreatedRoom(code);


openLobby();


listenRoom();


startHeartbeat();


}









// ============================================================
// JOIN ROOM
// ============================================================


async function joinRoom(){


const input =
document.getElementById(
"room-input"
);



const code =
input.value
.trim()
.toUpperCase();





if(!code){


alert(
"Введите код комнаты"
);


return;


}







const ref =
database.ref(
"rooms/" + code
);



const snapshot =
await ref.once(
"value"
);



if(!snapshot.exists()){


alert(
"Комната не найдена"
);


return;


}



const room =
snapshot.val();





myPlayerId =
createPlayerId();







// восстановление

if(
room.player1 &&
room.player1.id === myPlayerId
){


myRole =
"player1";


}

else if(
room.player2 &&
room.player2.id === myPlayerId
){


myRole =
"player2";


}

else{



// проверяем второго игрока

if(
room.player2 &&
room.player2.online &&
checkPlayerAlive(room.player2)
){


alert(
"Комната уже заполнена"
);


return;


}



myRole =
"player2";



await ref
.child(
"player2"
)
.set({

id:
myPlayerId,


online:true,


lastSeen:
Date.now(),


score:0


});



}






currentRoomId =
code;




localStorage.setItem(
"notHumanRoom",
code
);


localStorage.setItem(
"notHumanRole",
myRole
);







// ставим ready

await ref
.child(
"status"
)
.set(
"ready"
);








// disconnect

database
.ref(
"rooms/" +
code +
"/" +
myRole
)
.onDisconnect()
.update({

online:false,


lastSeen:
Date.now()

});








await ref
.child(
myRole
)
.update({

online:true,


lastSeen:
Date.now()

});







openLobby();


listenRoom();


startHeartbeat();



}









// ============================================================
// HEARTBEAT
// ============================================================


function startHeartbeat(){


if(heartbeatTimer)
clearInterval(
heartbeatTimer
);



heartbeatTimer =
setInterval(()=>{


if(
!currentRoomId ||
!myRole
)
return;




database
.ref(
"rooms/" +
currentRoomId +
"/" +
myRole
)
.update({

online:true,


lastSeen:
Date.now()

});



},10000);



}









// ============================================================
// RESTORE AFTER REFRESH
// ============================================================


async function restoreRoom(){



const roomId =
localStorage.getItem(
"notHumanRoom"
);



const role =
localStorage.getItem(
"notHumanRole"
);



if(
!roomId ||
!role
)
return;






const snapshot =
await database
.ref(
"rooms/" +
roomId
)
.once(
"value"
);





if(!snapshot.exists())
return;





const room =
snapshot.val();





currentRoomId =
roomId;


myRole =
role;


myPlayerId =
createPlayerId();





await database
.ref(
"rooms/" +
roomId +
"/" +
role
)
.update({

online:true,


lastSeen:
Date.now()

});





openLobby();


listenRoom();


startHeartbeat();



}









// ============================================================
// LISTEN ROOM
// ============================================================


function listenRoom(){


if(!currentRoomId)
return;





database
.ref(
"rooms/" +
currentRoomId
)
.on(
"value",
snapshot=>{


const room =
snapshot.val();



if(!room)
return;







if(
room.player1 &&
room.player2 &&
room.status==="ready"
){



showRoomReady();





if(!gameStarted){


gameStarted=true;


setTimeout(()=>{


startGame();


},500);


}



}



});



}









// ============================================================
// CHECK PLAYER
// ============================================================


function checkPlayerAlive(player){


if(!player)
return false;



if(
player.online !== true
)
return false;




return (
Date.now()
-
player.lastSeen
<
30000
);


}









// ============================================================
// UI
// ============================================================


function showCreatedRoom(code){


const el =
document.getElementById(
"created-room"
);



if(el)
el.textContent =
"Код: " + code;



}









function openLobby(){


document
.getElementById(
"start-screen"
)
.classList
.add(
"hidden"
);



document
.getElementById(
"lobby-screen"
)
.classList
.remove(
"hidden"
);





const display =
document.getElementById(
"room-display"
);



if(display)
display.textContent =
currentRoomId;



}









function showRoomReady(){


const wait =
document.querySelector(
".waiting"
);



if(wait)

wait.textContent =
"✅ Игрок подключился. Запуск эксперимента...";



}









// ============================================================
// BUTTONS
// ============================================================


document
.addEventListener(
"DOMContentLoaded",
()=>{


document
.getElementById(
"create-room-btn"
)
?.addEventListener(
"click",
createRoom
);




document
.getElementById(
"join-room-btn"
)
?.addEventListener(
"click",
joinRoom
);



// восстановление после F5

restoreRoom();



});








console.log(
"🏠 Room system v2 loaded"
);
