// ============================================================
// ROOM SYSTEM
// NOT A HUMAN
// Multiplayer room manager v3
// ============================================================


let currentRoomId = null;

let myPlayerId = null;

let myRole = null;

let gameStarted = false;

let heartbeatTimer = null;

let roomListenerStarted = false;









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



for(
let i = 0;
i < 6;
i++
){


code +=
chars[
Math.floor(
Math.random()*chars.length
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

created:Date.now(),

status:"waiting",


player1:{

id:myPlayerId,

online:true,

lastSeen:Date.now(),

score:0

},


player2:null,


game:null


});







setupDisconnectCleanup(
"rooms/" +
code +
"/player1"
);






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



if(
room.player2 &&
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

id:myPlayerId,

online:true,

lastSeen:Date.now(),

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








await ref
.child("status")
.set(
"ready"
);






setupDisconnectCleanup(
"rooms/" +
code +
"/" +
myRole
);






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
setInterval(
()=>{


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

lastSeen:Date.now()

});




},
10000
);



}









// ============================================================
// RESTORE ROOM AFTER F5
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





if(!snapshot.exists()){


clearRoomStorage();

return;


}






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

lastSeen:Date.now()

});







openLobby();

listenRoom();

startHeartbeat();





if(
typeof restoreGameAfterReload === "function"
){

restoreGameAfterReload();

}



}









// ============================================================
// LISTEN ROOM
// ============================================================


function listenRoom(){



if(
roomListenerStarted
)

return;




roomListenerStarted=true;






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



setTimeout(
()=>{

startGame();

},
500
);



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




return (

player.online === true &&

Date.now()
-
player.lastSeen
<
30000

);


}









// ============================================================
// LEAVE ROOM
// ============================================================


async function leaveRoom(){



if(
!currentRoomId ||
!myRole
)

return;







await database
.ref(
"rooms/" +
currentRoomId +
"/" +
myRole
)
.remove();







clearRoomStorage();






currentRoomId=null;

myRole=null;

myPlayerId=null;

gameStarted=false;

roomListenerStarted=false;






location.reload();



}









function clearRoomStorage(){



localStorage.removeItem(
"notHumanRoom"
);


localStorage.removeItem(
"notHumanRole"
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





restoreRoom();



});








console.log(
"🏠 Not a Human room system v3 loaded"
);
