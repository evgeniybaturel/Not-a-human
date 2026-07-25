// ============================================================
// UI CONTROLLER
// NOT A HUMAN
// Интерфейс игры
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









// ============================================================
// VOTING
// ============================================================


function showVoting(){


showScreen(
"vote-screen"
);


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
// INIT
// ============================================================


document
.addEventListener(
"DOMContentLoaded",
()=>{


console.log(
"UI initialized"
);



});








console.log(
"🎨 UI loaded"
);
