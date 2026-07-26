// ============================================================
// ROOM SYSTEM
// NOT A HUMAN
// Stable room manager
// ============================================================


let currentRoomId = null;

let myPlayerId = null;

let myRole = null;

let gameStarted = false;



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


let code="";


for(let i=0;i<6;i++){


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



await database
.ref(
"rooms/"+code
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
"rooms/"+code
);



const snapshot =
await ref.once("value");



if(!snapshot.exists()){

alert(
"Комната не найдена"
);

return;

}



const room =
snapshot.val();





// если игрок уже был в комнате

const id =
createPlayerId();





if(
room.player1 &&
room.player1.id===id
){

myRole="player1";

}



else if(
room.player2 &&
room.player2.id===id
){

myRole="player2";

}



else{



if(
room.player2
&&
room.player2.online
){

alert(
"Комната уже заполнена"
);

return;

}



myRole="player2";



await ref
.child("player2")
.set({

id:id,

online:true,

lastSeen:
Date.now(),

score:0


});


}




myPlayerId=id;


currentRoomId=code;



localStorage.setItem(
"notHumanRoom",
code
);



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



setInterval(()=>{


if(
!currentRoomId ||
!myRole
)
return;



database
.ref(
"rooms/"
+
currentRoomId
+
"/"
+
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
// LISTEN ROOM
// ============================================================


function listenRoom(){



if(!currentRoomId)
return;




database
.ref(
"rooms/"+currentRoomId
)
.on(
"value",
snapshot=>{



const room =
snapshot.val();



if(!room)
return;






if(
room.player1
&&
room.player2
&&
room.status==="ready"
){

showRoomReady();



if(
!gameStarted
){

gameStarted=true;



setTimeout(()=>{


startGame();


},500);



}



}



});



}









// ============================================================
// CLEAN OLD PLAYER
// ============================================================


function checkPlayerAlive(player){


if(!player)
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
"Код: "+code;



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



});







console.log(
"🏠 Stable room system loaded"
);
