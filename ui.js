// ============================================================
// UI CONTROLLER
// NOT A HUMAN
// Интерфейс игры
// ============================================================



// ============================================================
// ЭКРАНЫ
// ============================================================


function showScreen(id){


    document
    .querySelectorAll(".screen")
    .forEach(screen=>{

        screen.classList.add(
            "hidden"
        );

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
// СТАРТ
// ============================================================


function openStart(){


    showScreen(
        "start-screen"
    );

}




// ============================================================
// ЛОББИ
// ============================================================


function showLobby(){


    showScreen(
        "lobby-screen"
    );

}





function updateRoomCode(code){


    const el =
        document.getElementById(
            "room-display"
        );


    if(el){

        el.textContent =
            code;

    }

}





// ============================================================
// ИГРА
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
// ГОЛОСОВАНИЕ
// ============================================================


function showVoting(){


    showScreen(
        "vote-screen"
    );


}




// ============================================================
// РЕЗУЛЬТАТЫ
// ============================================================


function showResult(text){


    showScreen(
        "result-screen"
    );


    const result =
        document.getElementById(
            "result-text"
        );


    if(result){

        result.textContent =
            text;

    }

}





// ============================================================
// ПОЛУЧЕНИЕ ОЧКОВ
// ============================================================


function calculateScore(){


    /*
    
    Логика первой версии:

    Если игрок угадал другого игрока:
    +1 очко

    Если игрок убедил всех,
    что он ИИ:
    +2 очка


    Позже сюда добавим:
    - статистику
    - рейтинг
    - серии побед
    */


    return 0;

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
// КНОПКИ
// ============================================================


document.addEventListener(
"DOMContentLoaded",
()=>{


    initApiInput();



    document
    .getElementById(
        "back-btn"
    )
    ?.addEventListener(
        "click",
        openStart
    );


});




console.log(
    "🎨 UI loaded"
);
