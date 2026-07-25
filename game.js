// ============================================================
// GAME ENGINE
// NOT A HUMAN
// 2 HUMAN + AI
// ============================================================


let currentRound = 1;

let myScore = 0;

let hasAnswered = false;

let hasVoted = false;

let shuffledAnswers = [];

let aiGenerating = false;






// ============================================================
// START GAME
// ============================================================


async function startGame(){


    if(!currentRoomId)
        return;



    const ref =
    database.ref(
        "rooms/" + currentRoomId
    );



    const snapshot =
    await ref.once("value");



    const room =
    snapshot.val();



    if(
        room.game &&
        room.game.question
    ){

        listenGame();

        return;

    }




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


            aiGenerated:false,


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






// два человека ответили

if(

game.answers &&

game.answers.player1 &&

game.answers.player2

&&

!game.aiGenerated

){


createAIAnswer(
game
);


}








// есть все 3 ответа

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



});


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





hasAnswered = true;





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






input.disabled = true;




const button =
document
.getElementById(
"send-answer-btn"
);



button.disabled = true;



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
// AI PLAYER
// ============================================================


async function createAIAnswer(game){



if(aiGenerating)
return;



aiGenerating = true;




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

text:
answer,


type:
"ai"


});







await ref.update({

aiGenerated:true


});





aiGenerating=false;



}









// ============================================================
// VOTING
// ============================================================


function openVoting(answers){



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





shuffledAnswers =
shuffle(list);







document
.getElementById(
"vote-one"
)
.textContent =
"Ответ A\n\n" +
shuffledAnswers[0].text;





document
.getElementById(
"vote-two"
)
.textContent =
"Ответ B\n\n" +
shuffledAnswers[1].text;





document
.getElementById(
"vote-three"
)
.textContent =
"Ответ C\n\n" +
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

answer:
selected.id


});





document
.querySelectorAll(
".answer-card"
)
.forEach(
button=>{


button.disabled=true;


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





calculateResult(
votes
);



}









// ============================================================
// SCORE
// ============================================================


function calculateResult(votes){



let points=0;




// угадал ИИ

if(
votes[myRole].answer==="ai"
){

points+=2;

}






// тебя приняли за ИИ

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

points+=1;

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
2500
);



}









// ============================================================
// NEXT ROUND
// ============================================================


function nextRound(){



if(currentRound>=5){


showFinal();

return;


}




currentRound++;


hasAnswered=false;


hasVoted=false;


aiGenerating=false;





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
"🎮 Game engine loaded"
);
