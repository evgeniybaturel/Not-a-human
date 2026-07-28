// ============================================================
// GAME ENGINE
// NOT A HUMAN
// Multiplayer synchronized engine v5
// 5 rounds system
// ============================================================


let currentRound = 1;

let maxRounds = 5;

let myScore = 0;

let hasAnswered = false;

let hasVoted = false;

let aiGenerating = false;

let gameListenerStarted = false;

let scoreApplied = false;

let currentVoteOrder = [];









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





    if(game && game.question){

        restoreGameState(game);

        listenGame();

        return;

    }







    if(myRole !== "player1")
        return;







    const question =
    await generateQuestion();






    await ref.set({

        round:1,

        maxRounds:5,

        question:question,

        questionsUsed:[
            question
        ],

        totalScores:{

            player1:0,

            player2:0

        },

        answers:{},

        votes:{},

        answerOrder:null,

        status:"answering",

        aiGenerated:false,

        finished:false,

        scoreApplied:false,

        readyNextRound:{}

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






            restoreGameState(game);






            if(

                game.status==="answering" &&

                game.answers &&

                Object.keys(game.answers).length===0

            ){

                resetRoundState();

            }







            if(game.finished){


                showFinalResult(game);


                return;


            }








            if(game.question){


                showQuestion(
                    game.question
                );


            }









            if(

                game.answers &&

                game.answers.player1 &&

                game.answers.player2 &&

                !game.aiGenerated

            ){


                createAIAnswer(game);


            }









            if(

                game.answers &&

                game.answers.player1 &&

                game.answers.player2 &&

                game.answers.ai

            ){


                openVoting(

                    game.answers,

                    game.answerOrder

                );


            }



        }


    );



}









// ============================================================
// RESTORE STATE
// ============================================================


function restoreGameState(game){



currentRound =
game.round || 1;



maxRounds =
game.maxRounds || 5;






const round =
document.getElementById(
"round-number"
);



if(round)

round.textContent =
currentRound;







if(game.status==="answering"){


hasAnswered =
!!(
game.answers &&
game.answers[myRole]
);


}







if(game.status==="voting"){


hasVoted =
!!(
game.votes &&
game.votes[myRole]
);


}







if(game.answerOrder){


currentVoteOrder =
game.answerOrder;


}



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
document.getElementById(
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
await ref.once(
"value"
);






const current =
snapshot.val();






if(

current.aiGenerated ||

!current.answers.player1 ||

!current.answers.player2

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


async function openVoting(answers, order){



if(!order){



order =
shuffle([

"player1",

"player2",

"ai"

]);






await database
.ref(
"rooms/" +
currentRoomId +
"/game/answerOrder"
)
.set(
order
);



}







currentVoteOrder =
order;







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

answers[
order[0]
]
.text;







document
.getElementById(
"vote-two"
)
.textContent =

"Ответ B\n\n" +

answers[
order[1]
]
.text;







document
.getElementById(
"vote-three"
)
.textContent =

"Ответ C\n\n" +

answers[
order[2]
]
.text;



}









// ============================================================
// VOTE
// ============================================================


async function vote(index){



if(hasVoted)
return;





hasVoted=true;






const selected =
currentVoteOrder[index];






await database
.ref(
"rooms/" +
currentRoomId +
"/game/votes/" +
myRole
)
.set({

answer:selected,

time:Date.now()

});







document
.querySelectorAll(
".answer-card"
)
.forEach(
button=>{


button.disabled=true;


});







waitVotes();



}









// ============================================================
// WAIT VOTES
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
// FINISH ROUND
// ============================================================


async function finishRound(votes){



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
game.scoreApplied
)
return;






let scores = {

player1:0,

player2:0

};






const player1Vote =
votes.player1.answer;



const player2Vote =
votes.player2.answer;







if(
player1Vote === "ai"
){

scores.player1 += 2;

}





if(
player2Vote === "ai"
){

scores.player2 += 2;

}





if(
player1Vote === "player2"
){

scores.player2 += 1;

}





if(
player2Vote === "player1"
){

scores.player1 += 1;

}







const totalScores =
game.totalScores || {

player1:0,

player2:0

};






totalScores.player1 +=
scores.player1;



totalScores.player2 +=
scores.player2;








await ref.update({

finished:true,

status:"finished",

scores:scores,

totalScores:totalScores,

scoreApplied:true

});



}









// ============================================================
// FINAL RESULT
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
"game-screen"
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








if(
scoreApplied
)
return;







scoreApplied=true;







const total =
game.totalScores || {

player1:
0,

player2:
0

};






myScore =
total[myRole];








const finalScore =
document
.getElementById(
"final-score"
);





if(finalScore)

finalScore.textContent =
myScore;








const result =
document
.getElementById(
"final-result"
);





if(result){



result.textContent =

"Раунд " +
game.round +
" из " +
game.maxRounds +

"\n\n" +

"Очки за раунд:\n" +

"Игрок 1: " +
game.scores.player1 +
"\n" +

"Игрок 2: " +
game.scores.player2 +

"\n\n" +

"Общий счёт:\n" +

"Игрок 1: " +
total.player1 +
"\n" +

"Игрок 2: " +
total.player2;



}








const nextButton =
document
.getElementById(
"next-round-btn"
);





const newButton =
document
.getElementById(
"new-experiment-btn"
);







if(
game.round < game.maxRounds
){



if(nextButton){

nextButton.classList
.remove(
"hidden"
);


nextButton.disabled=false;


nextButton.textContent =
"Следующий раунд";


}





if(newButton)

newButton.classList
.add(
"hidden"
);



}
else{



if(nextButton)

nextButton.classList
.add(
"hidden"
);




if(newButton)

newButton.classList
.remove(
"hidden"
);



}



}









// ============================================================
// NEXT ROUND
// ============================================================


async function nextRound(){



const button =
document.getElementById(
"next-round-btn"
);





if(button){

button.disabled=true;

button.textContent =
"Ждём второго игрока...";

}







await database
.ref(
"rooms/" +
currentRoomId +
"/game/readyNextRound/" +
myRole
)
.set(
true
);








const readyRef =
database.ref(
"rooms/" +
currentRoomId +
"/game/readyNextRound"
);








readyRef.on(
"value",
async snapshot=>{



const ready =
snapshot.val();







if(

!ready ||
!ready.player1 ||
!ready.player2

)

return;








if(
myRole !== "player1"
)

return;








const gameSnapshot =
await database
.ref(
"rooms/" +
currentRoomId +
"/game"
)
.once(
"value"
);







const oldGame =
gameSnapshot.val();








if(
oldGame.round >= oldGame.maxRounds
)

return;








let question="";





do{


question =
await generateQuestion();



}

while(

oldGame.questionsUsed &&

oldGame.questionsUsed.includes(
question
)

);








await database
.ref(
"rooms/" +
currentRoomId +
"/game"
)
.set({

round:
oldGame.round + 1,

maxRounds:
oldGame.maxRounds,

question:question,

questionsUsed:[

...(oldGame.questionsUsed || []),

question

],

totalScores:
oldGame.totalScores,

answers:{},

votes:{},

answerOrder:null,

status:"answering",

aiGenerated:false,

finished:false,

scoreApplied:false,

readyNextRound:{}

});



}



});



} 
// ============================================================
// RESET ROUND STATE
// ============================================================


function resetRoundState(){



hasAnswered=false;

hasVoted=false;

aiGenerating=false;

scoreApplied=false;

currentVoteOrder=[];







const input =
document
.getElementById(
"answer-input"
);





if(input){


input.value="";

input.disabled=false;


}







const send =
document
.getElementById(
"send-answer-btn"
);





if(send)

send.disabled=false;







const wait =
document
.getElementById(
"answer-wait"
);





if(wait)

wait
.classList
.add(
"hidden"
);







document
.querySelectorAll(
".answer-card"
)
.forEach(
button=>{


button.disabled=false;


});



}









// ============================================================
// RESTORE AFTER F5
// ============================================================


async function restoreGameAfterReload(){



if(
!currentRoomId
)

return;






const snapshot =
await database
.ref(
"rooms/" +
currentRoomId +
"/game"
)
.once(
"value"
);







const game =
snapshot.val();







if(!game)
return;







restoreGameState(game);






if(
game.finished
){


showFinalResult(
game
);


}

else if(
game.status==="voting"
){



openVoting(

game.answers,

game.answerOrder

);



}

else{



showQuestion(
game.question
);



}



}









// ============================================================
// NEW EXPERIMENT
// ============================================================


async function newExperiment(){



if(
typeof leaveRoom === "function"
){


await leaveRoom();


}
else{


location.reload();


}



}









// ============================================================
// SHUFFLE
// ============================================================


function shuffle(array){


return array
.slice()
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






document
.getElementById(
"next-round-btn"
)
?.addEventListener(
"click",
nextRound
);







document
.getElementById(
"new-experiment-btn"
)
?.addEventListener(
"click",
newExperiment
);





});









console.log(
"🎮 Not a Human game engine v5 loaded"
);
