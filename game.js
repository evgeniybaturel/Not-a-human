// ============================================================
// GAME ENGINE
// NOT A HUMAN
// Stable multiplayer engine
// ============================================================


let currentRound = 1;

let myScore = 0;

let hasAnswered = false;

let hasVoted = false;

let shuffledAnswers = [];

let aiGenerating = false;

let gameListenerStarted = false;

let currentGameId = null;





// ============================================================
// START GAME
// ============================================================


async function startGame(){


    if(!currentRoomId)
        return;



    const ref =
    database.ref(
        "rooms/" + currentRoomId + "/game"
    );



    const snapshot =
    await ref.once("value");



    const game =
    snapshot.val();




    // если игра уже создана - просто подключаемся

    if(
        game &&
        game.question
    ){

        currentRound =
        game.round || 1;


        listenGame();

        return;

    }




    // создаёт только первый игрок

    if(myRole !== "player1")
        return;





    const question =
    await generateQuestion();





    await ref.set({

        round:1,

        question:question,

        answers:{},

        votes:{},

        status:"answering",

        aiGenerated:false,

        finished:false

    });




    listenGame();



}









// ============================================================
// LISTEN GAME
// ============================================================


function listenGame(){


    if(gameListenerStarted)
        return;


    gameListenerStarted=true;



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





            currentRound =
            game.round || 1;





            document
            .getElementById(
                "round-number"
            )
            .textContent =
            currentRound;






            if(
                game.finished
            ){

                showFinalResult(
                    game
                );

                return;

            }






            if(game.question){


                showQuestion(
                    game.question
                );


            }







            // оба человека ответили

            if(

                game.answers &&
                game.answers.player1 &&
                game.answers.player2 &&
                !game.aiGenerated

            ){

                createAIAnswer(game);

            }








            // только после ИИ открываем голосование

            if(

                game.answers &&
                game.answers.player1 &&
                game.answers.player2 &&
                game.answers.ai

            ){

                openVoting(
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
// SEND ANSWER
// ============================================================


async function sendAnswer(){



if(hasAnswered)
return;





const input =
document
.getElementById(
"answer-input"
);





const text =
input.value.trim();





if(!text)
return;





hasAnswered=true;






await database
.ref(
"rooms/" +
currentRoomId +
"/game/answers/" +
myRole
)
.set({

text:text,

type:"human",

time:Date.now()

});





input.disabled=true;




document
.getElementById(
"send-answer-btn"
)
.disabled=true;





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
// AI PLAYER
// ============================================================


async function createAIAnswer(game){



if(aiGenerating)
return;



aiGenerating=true;



const ref =
database.ref(
"rooms/" +
currentRoomId +
"/game"
);






const snapshot =
await ref.once("value");



const current =
snapshot.val();






if(
current.aiGenerated
){

aiGenerating=false;
return;

}





const answer =
await generateAIAnswer(
game.question
);






await ref
.child(
"answers/ai"
)
.set({

text:answer,

type:"ai",

time:Date.now()

});






await ref.update({

aiGenerated:true,

status:"voting"

});





aiGenerating=false;



}









// ============================================================
// VOTING
// ============================================================


function openVoting(answers){



if(
document
.getElementById(
"vote-screen"
)
.classList
.contains(
"hidden"
)===false
)
return;






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







const list=[

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





// перемешиваем один раз

shuffledAnswers =
shuffle(
list
);






document
.getElementById(
"vote-one"
)
.textContent =
"Ответ A\n\n"+
shuffledAnswers[0].text;




document
.getElementById(
"vote-two"
)
.textContent =
"Ответ B\n\n"+
shuffledAnswers[1].text;




document
.getElementById(
"vote-three"
)
.textContent =
"Ответ C\n\n"+
shuffledAnswers[2].text;



}









// ============================================================
// VOTE
// ============================================================


async function vote(index){



if(hasVoted)
return;



hasVoted=true;




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

answer:selected.id,

time:Date.now()

});





document
.querySelectorAll(
".answer-card"
)
.forEach(
b=>b.disabled=true
);





waitVotes();



}









// ============================================================
// CHECK VOTES
// ============================================================


function waitVotes(){



database
.ref(
"rooms/" +
currentRoomId +
"/game/votes"
)
.on(
"value",
snapshot=>{



const votes =
snapshot.val();





if(
!votes ||
!votes.player1 ||
!votes.player2
)
return;





finishRound(
votes
);



});


}









// ============================================================
// RESULT
// ============================================================


async function finishRound(votes){



const ref =
database.ref(
"rooms/" +
currentRoomId +
"/game"
);





const snapshot =
await ref.once("value");



const game =
snapshot.val();






if(game.finished)
return;






let p1 =
votes.player1.answer;


let p2 =
votes.player2.answer;




let scores={

player1:0,

player2:0

};





if(p1==="ai")
scores.player1+=2;


if(p2==="ai")
scores.player2+=2;






if(p2==="player1")
scores.player1+=1;


if(p1==="player2")
scores.player2+=1;







await ref.update({

finished:true,

scores:scores

});



}









// ============================================================
// FINAL
// ============================================================


function showFinalResult(game){



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





const score =
game.scores[myRole] || 0;



myScore+=score;





document
.getElementById(
"final-score"
)
.textContent =
myScore;




document
.getElementById(
"final-result"
)
.textContent =
"Раунд завершён\n\n"+
"Игрок 1: "+
game.scores.player1+
" очков\n"+
"Игрок 2: "+
game.scores.player2+
" очков";



}









// ============================================================
// NEXT ROUND
// ============================================================


function nextRound(){


database
.ref(
"rooms/" +
currentRoomId +
"/game"
)
.remove();



}









function shuffle(array){


return array
.sort(
()=>Math.random()-0.5
);


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
"🎮 Stable game engine loaded"
);
