// ============================================================
// GAME ENGINE
// NOT A HUMAN
// Stable version
// ============================================================


let currentRound = 1;

let myScore = 0;

let hasAnswered = false;

let hasVoted = false;

let shuffledAnswers = [];

let gameListener = null;

let aiGenerating = false;

let currentVoteOrder = null;





// ============================================================
// START GAME
// ============================================================


async function startGame(){


    if(!currentRoomId)
        return;



    const ref = database.ref(
        "rooms/" + currentRoomId
    );



    const snapshot = await ref.once("value");

    const room = snapshot.val();



    if(!room)
        return;




    // если игра уже создана
    if(
        room.game &&
        room.game.question
    ){

        listenGame();

        return;

    }





    // только первый игрок создаёт раунд

    if(myRole === "player1"){



        const question =
            await generateQuestion();



        await ref.child("game").set({

            round: currentRound,

            question: question,

            status:"answering",

            answers:{},

            votes:{},

            aiGenerated:false,

            voteOrder:null


        });



    }




    listenGame();


}









// ============================================================
// LISTEN GAME
// ============================================================


function listenGame(){



    if(gameListener)
        return;



    gameListener = database
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







            // оба человека ответили
            // запускаем ИИ один раз


            if(

                game.status==="answering" &&

                game.answers &&

                game.answers.player1 &&

                game.answers.player2

            ){


                generateAIOnce();


            }







            // голосование


            if(

                game.status==="voting"

                &&

                game.answers.player1

                &&

                game.answers.player2

                &&

                game.answers.ai

            ){


                openVoting(
                    game
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

type:"human"

});





input.disabled=true;



const button =
document.getElementById(
"send-answer-btn"
);



button.disabled=true;



button.textContent =
"Ответ отправлен";





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
// AI GENERATION
// ============================================================


async function generateAIOnce(){



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



const game =
snapshot.val();





if(
game.aiGenerated ||
game.status!=="answering"
){

aiGenerating=false;

return;

}







await ref.update({

status:"ai_generating"

});







const answer =
await generateAIAnswer(
game.question
);








await ref.child(
"answers/ai"
)
.set({

text:answer,

type:"ai"

});








// создаём постоянный порядок

const order =
shuffle([

"player1",

"player2",

"ai"

]);








await ref.update({

aiGenerated:true,

status:"voting",

voteOrder:order


});





aiGenerating=false;



}









// ============================================================
// VOTING
// ============================================================


function openVoting(game){



if(hasVoted)
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






if(
!game.voteOrder
)
return;





const answers = game.answers;






currentVoteOrder =
game.voteOrder;






const buttons=[

"vote-one",

"vote-two",

"vote-three"

];






buttons.forEach(
(id,index)=>{


const answerId =
currentVoteOrder[index];


const button =
document.getElementById(id);



button.textContent =
"Ответ " +
String.fromCharCode(
65+index
)
+
"\n\n"
+
answers[answerId].text;



button.disabled=false;



});



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

answer:selected

});






document
.querySelectorAll(
".answer-card"
)
.forEach(
b=>{

b.disabled=true;

});






checkVotes();


}









// ============================================================
// CHECK VOTES
// ============================================================


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
Object.keys(votes).length<2
)
return;





calculateResult(
votes
);



}









// ============================================================
// RESULT
// ============================================================


function calculateResult(votes){



let points=0;




if(
votes[myRole].answer==="ai"
){

points+=2;

}





const other =
myRole==="player1"
?
"player2"
:
"player1";




if(
votes[other] &&
votes[other].answer===myRole
){

points++;

}




myScore+=points;




document
.getElementById(
"score"
)
.textContent =
myScore;




setTimeout(
nextRound,
2000
);



}









// ============================================================
// NEXT ROUND
// ============================================================


async function nextRound(){



if(currentRound>=5){

showFinal();

return;

}




currentRound++;


hasAnswered=false;

hasVoted=false;

aiGenerating=false;

currentVoteOrder=null;



if(gameListener){

database
.ref(
"rooms/" +
currentRoomId +
"/game"
)
.off(
"value",
gameListener
);


gameListener=null;


}





await database
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









// ============================================================
// FINAL
// ============================================================


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
// HELPERS
// ============================================================


function shuffle(array){



return [...array]
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
