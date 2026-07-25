// ============================================================
// UI CONTROLLER
// NOT A HUMAN
// Interface Manager
// ============================================================



// ============================================================
// SCREEN CONTROL
// ============================================================


function showScreen(id){


    const screens = [

        "start-screen",
        "lobby-screen",
        "game-screen",
        "vote-screen",
        "final-screen"

    ];



    screens.forEach(screen=>{


        const element =
        document.getElementById(
            screen
        );


        if(element){

            element.classList.add(
                "hidden"
            );

        }


    });





    const target =
    document.getElementById(id);



    if(target){

        target.classList.remove(
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
    document.getElementById(
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
    document.getElementById(
        "answer-input"
    );



    if(input){


        input.value = "";


    }


}









// ============================================================
// VOTING
// ============================================================


function openVoting(){


    showScreen(
        "vote-screen"
    );


}









// ============================================================
// FINAL
// ============================================================


function showFinalResult(text){



    showScreen(
        "final-screen"
    );




    const result =
    document.getElementById(
        "final-result"
    );



    if(result){


        result.innerHTML =
        text;


    }



}









// ============================================================
// API KEY
// ============================================================


function initApiInput(){



    const input =
    document.getElementById(
        "api-key"
    );



    if(!input)
        return;





    const saved =
    localStorage.getItem(
        "groq_api_key"
    );





    if(saved){


        input.value =
        saved;


    }







    input.addEventListener(
        "change",
        ()=>{


            saveApiKey(
                input.value.trim()
            );


        }
    );



}









// ============================================================
// LOAD
// ============================================================


document.addEventListener(
"DOMContentLoaded",
()=>{


    initApiInput();



});







console.log(
"🎨 UI controller loaded"
);
