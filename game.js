// ============================================================
// GAME ENGINE
// NOT A HUMAN
// Логика раундов
// ============================================================


let currentQuestion = "";

let myAnswer = "";

let currentRound = 1;



// ============================================================
// СТАРТ ИГРЫ
// ============================================================

async function startGame(){


    if(!currentRoomId)
        return;



    const roomRef =
        database.ref(
            "rooms/" + currentRoomId
        );



    const snapshot =
        await roomRef.once("value");



    const room =
        snapshot.val();



    // Если игру уже начали
    if(
        room.game &&
        room.game.question
    ){

        showQuestion(
            room.game.question
        );

        return;

    }




    // Первый игрок создаёт вопрос

    if(myRole === "player1"){


        currentQuestion =
            await generateQuestion();



        await roomRef
        .child("game")
        .set({

            round:
                currentRound,


            question:
                currentQuestion,


            answers:{},


            status:
                "answering"


        });


    }



    listenGame();

}




// ============================================================
// СЛУШАЕМ ИГРУ
// ============================================================

function listenGame(){


    database
    .ref(
        "rooms/" +
        currentRoomId +
        "/game"
    )
    .on(
        "value",
        snapshot=>{


            const game =
                snapshot.val();



            if(!game)
                return;



            if(game.question){

                showQuestion(
                    game.question
                );

            }



            if(
                game.answers &&
                Object.keys(
                    game.answers
                ).length === 2
            ){


                setTimeout(
                    ()=>{
                        openVoting();

                    },
                    1000
                );


            }


        }
    );

}





// ============================================================
// ПОКАЗАТЬ ВОПРОС
// ============================================================

function showQuestion(text){


    const screen =
        document.getElementById(
            "game-screen"
        );


    const lobby =
        document.getElementById(
            "lobby-screen"
        );


    lobby.classList.add(
        "hidden"
    );


    screen.classList.remove(
        "hidden"
    );



    document
    .getElementById(
        "question-text"
    )
    .textContent = text;


}




// ============================================================
// ОТПРАВКА ОТВЕТА
// ============================================================

async function sendAnswer(){


    const input =
        document.getElementById(
            "answer-input"
        );


    const text =
        input.value.trim();



    if(!text)
        return;



    myAnswer = text;



    input.value = "";



    await database
    .ref(
        "rooms/" +
        currentRoomId +
        "/game/answers/" +
        myRole
    )
    .set({

        text:
            myAnswer,


        player:
            myPlayerId

    });



    document
    .getElementById(
        "answer-wait"
    )
    .classList
    .remove(
        "hidden"
    );


}




// ============================================================
// ГОЛОСОВАНИЕ
// ============================================================

function openVoting(){


    document
    .getElementById(
        "game-screen"
    )
    .classList
    .add(
        "hidden"
    );



    document
    .getElementById(
        "vote-screen"
    )
    .classList
    .remove(
        "hidden"
    );



    const ref =
        database.ref(
            "rooms/" +
            currentRoomId +
            "/game/answers"
        );



    ref.once(
        "value"
    )
    .then(
        snapshot=>{


            const answers =
                snapshot.val();



            document
            .getElementById(
                "vote-one"
            )
            .textContent =
                "Игрок 1:\n\n" +
                answers.player1.text;



            document
            .getElementById(
                "vote-two"
            )
            .textContent =
                "Игрок 2:\n\n" +
                answers.player2.text;


        }
    );


}






// ============================================================
// ГОЛОС
// ============================================================

async function vote(player){


    await database
    .ref(
        "rooms/" +
        currentRoomId +
        "/game/votes/" +
        myRole
    )
    .set(player);


}




// ============================================================
// КНОПКИ
// ============================================================


document.addEventListener(
"DOMContentLoaded",
()=>{


    document
    .getElementById(
        "send-answer-btn"
    )
    ?.addEventListener(
        "click",
        sendAnswer
    );



    document
    .getElementById(
        "vote-one"
    )
    ?.addEventListener(
        "click",
        ()=>vote("player1")
    );



    document
    .getElementById(
        "vote-two"
    )
    ?.addEventListener(
        "click",
        ()=>vote("player2")
    );


});



console.log(
    "🎮 Game engine loaded"
);
