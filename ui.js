// ============================================================
// UI CONTROLLER
// NOT A HUMAN
// Interface controller v3
// ============================================================


// ============================================================
// SCREEN CONTROL
// ============================================================


function showScreen(id){


    document
    .querySelectorAll(
        "section"
    )
    .forEach(section=>{


        section
        .classList
        .add(
            "hidden"
        );


    });





    const screen =
    document
    .getElementById(id);





    if(screen){


        screen
        .classList
        .remove(
            "hidden"
        );


    }


}









// ============================================================
// START
// ============================================================


function openStart(){


    showScreen(
        "start-screen"
    );


}









// ============================================================
// LOBBY
// ============================================================


function showLobby(){


    showScreen(
        "lobby-screen"
    );


}






function updateRoomCode(code){



const element =
document
.getElementById(
"room-display"
);




if(element){


element.textContent =
code;


}



}









// ============================================================
// GAME
// ============================================================


function openGame(){


    showScreen(
        "game-screen"
    );


}






function clearAnswer(){


const input =
document
.getElementById(
"answer-input"
);




if(input){


input.value =
"";


}



}









function resetGameUI(){



const input =
document
.getElementById(
"answer-input"
);



if(input){


input.value = "";

input.disabled = false;


}





const button =
document
.getElementById(
"send-answer-btn"
);



if(button){


button.disabled = false;


}





const wait =
document
.getElementById(
"answer-wait"
);



if(wait){


wait
.classList
.add(
"hidden"
);


}



}









// ============================================================
// VOTING
// ============================================================


function showVoting(){


showScreen(
"vote-screen"
);


}









function disableVoting(){



document
.querySelectorAll(
".answer-card"
)
.forEach(
button=>{


button.disabled=true;


});


}









// ============================================================
// FINAL
// ============================================================


function showResult(text){



showScreen(
"final-screen"
);




const result =
document
.getElementById(
"final-result"
);





if(result){


result.textContent =
text;


}



}









// ============================================================
// SCORE
// ============================================================


function updateScore(value){



const score =
document
.getElementById(
"score"
);




if(score){


score.textContent =
value;


}



}









// ============================================================
// ROOM EXIT
// ============================================================


function setupLeaveButton(){



const button =
document
.getElementById(
"leave-room-btn"
);





if(
button &&
typeof leaveRoom === "function"
){


button.onclick =
leaveRoom;


}



}









// ============================================================
// RESTORE UI
// ============================================================


function restoreUI(){



if(
typeof currentRoomId !== "undefined" &&
currentRoomId
){


showLobby();


}



}









// ============================================================
// INIT
// ============================================================


document
.addEventListener(
"DOMContentLoaded",
()=>{


console.log(
"UI initialized"
);



setupLeaveButton();


});








console.log(
"🎨 Not a Human UI v3 loaded"
);
