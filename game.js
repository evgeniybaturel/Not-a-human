// ============================================================
// GAME ENGINE
// NOT A HUMAN
// 2 PLAYERS + HIDDEN AI
// ============================================================


let currentQuestion = "";

let currentRound = 1;

let myAnswer = "";

let myScore = 0;

let answersMap = {};

let shuffledAnswers = [];





// ============================================================
// START GAME
// ============================================================


async function startGame(){


    if(!currentRoomId)
        return;



    const ref =
    database.ref(
        "rooms/" +
        currentRoomId
    );



    const snapshot =
    await ref.once("value");



    const room =
    snapshot.val();





    // Если игра уже создана

    if(
        room.game &&
        room.game.question
    ){


        showQuestion(
            room.game.question
        );


        listenGame();


        return;


    }







    // Первый игрок создаёт раунд


    if(myRole === "player1"){



        const question =
        await generateQuestion();



        await ref
        .child("game")
        .set({



            round:
            currentRound,



            question:
            question,



            answers:{},



            votes:{},



            status:
            "answering"



        });



    }






    listenGame();



}









// ============================================================
// LISTEN GAME
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
        async snapshot=>{



            const game =
            snapshot.val();




            if(!game)
                return;






            if(game.question){


                showQuestion(
                    game.question
                );


            }






            // два человека ответили

            if(

                game.answers &&
                Object.keys(
                    game.answers
                ).length === 2

                &&
                !game.aiGenerated

            ){



                await generateAIResponse();



            }







            // появились все ответы


            if(

                game.answers &&
                Object.keys(
                    game.answers
                ).length === 3

            ){



                prepareVoting(
                    game.answers
                );



            }





        }
    );



}









// ============================================================
// SHOW QUESTION
// ============================================================


function showQuestion(text){



    document
    .getElementById(
        "lobby-screen"
    )
    .classList
    .add(
        "hidden"
    );




    document
    .getElementById(
        "game-screen"
    )
    .classList
    .remove(
        "hidden"
    );






    document
    .getElementById(
        "question-text"
    )
    .textContent =
    text;



}









// ============================================================
// SEND PLAYER ANSWER
// ============================================================


async function sendAnswer(){



    const input =
    document
    .getElementById(
        "answer-input"
    );



    const text =
    input.value.trim();





    if(!text)
        return;






    myAnswer =
    text;




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
        text,



        type:
        "human"



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
// AI ANSWER
// ============================================================


async function generateAIResponse(){



    const ref =
    database.ref(
        "rooms/" +
        currentRoomId +
        "/game"
    );





    const snapshot =
    await ref.once(
        "value"
    );





    const game =
    snapshot.val();





    if(
        game.aiGenerated
    )
        return;






    const aiAnswer =
    await generateAIAnswer(
        game.question
    );







    await ref
    .update({



        aiGenerated:
        true



    });








    await ref
    .child(
        "answers/ai"
    )
    .set({



        text:
        aiAnswer,



        type:
        "ai"



    });



}









// ============================================================
// PREPARE VOTING
// ============================================================


function prepareVoting(answers){



    const array = [



        {
            id:"player1",
            text:answers.player1.text
        },


        {
            id:"player2",
            text:answers.player2.text
        },


        {
            id:"ai",
            text:answers.ai.text
        }



    ];






    shuffledAnswers =
    shuffleAnswers(
        array
    );







    showVoting(
        shuffledAnswers
    );



}









// ============================================================
// SHOW VOTING
// ============================================================


function showVoting(list){



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







    document
    .getElementById(
        "vote-one"
    )
    .textContent =
    "Ответ A\n\n" +
    list[0].text;





    document
    .getElementById(
        "vote-two"
    )
    .textContent =
    "Ответ B\n\n" +
    list[1].text;






    document
    .getElementById(
        "vote-three"
    )
    .textContent =
    "Ответ C\n\n" +
    list[2].text;



}









// ============================================================
// VOTE
// ============================================================


async function vote(index){



    const selected =
    shuffledAnswers[index];






    await database
    .ref(
        "rooms/" +
        currentRoomId +
        "/game/votes/" +
        myRole
    )
    .set({



        answer:
        selected.id



    });







    checkVotes();



}








async function checkVotes(){



    const snapshot =
    await database
    .ref(
        "rooms/" +
        currentRoomId +
        "/game/votes"
    )
    .once(
        "value"
    );




    const votes =
    snapshot.val();




    if(
        !votes ||
        Object.keys(votes).length < 2
    )
        return;






    calculateRoundResult(
        votes
    );



}









// ============================================================
// SCORE
// ============================================================


async function calculateRoundResult(votes){



    const gameSnap =
    await database
    .ref(
        "rooms/" +
        currentRoomId +
        "/game/answers"
    )
    .once(
        "value"
    );




    const answers =
    gameSnap.val();





    let aiId =
    "ai";





    let myPoints = 0;






    // угадал ИИ


    if(
        votes[myRole].answer === aiId
    ){


        myPoints += 2;


    }







    // если человека приняли за ИИ


    if(
        votes[
            myRole === "player1"
            ?
            "player2"
            :
            "player1"
        ]
        &&
        votes[
            myRole === "player1"
            ?
            "player2"
            :
            "player1"
        ].answer === myRole

    ){


        myPoints += 1;


    }








    myScore += myPoints;





    document
    .getElementById(
        "score"
    )
    .textContent =
    myScore;





    nextRound();



}









// ============================================================
// NEXT ROUND
// ============================================================


function nextRound(){



    currentRound++;




    if(currentRound > 5){



        showFinal();


        return;


    }






    database
    .ref(
        "rooms/" +
        currentRoomId +
        "/game"
    )
    .remove();





    setTimeout(

        startGame,

        1000

    );



}








function showFinal(){



    document
    .getElementById(
        "vote-screen"
    )
    .classList
    .add(
        "hidden"
    );




    document
    .getElementById(
        "final-screen"
    )
    .classList
    .remove(
        "hidden"
    );





    document
    .getElementById(
        "final-score"
    )
    .textContent =
    myScore;



}









// ============================================================
// BUTTONS
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
        ()=>vote(0)
    );



    document
    .getElementById(
        "vote-two"
    )
    ?.addEventListener(
        "click",
        ()=>vote(1)
    );



    document
    .getElementById(
        "vote-three"
    )
    ?.addEventListener(
        "click",
        ()=>vote(2)
    );



});





console.log(
"🎮 Game engine loaded"
);
