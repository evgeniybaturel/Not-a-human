// ============================================================
// GAME ENGINE
// NOT A HUMAN
// Stable multiplayer version
// 2 HUMAN + AI
// ============================================================


let currentRound = 1;

let myScore = 0;

let hasAnswered = false;

let hasVoted = false;

let votingOrder = [];

let aiGenerating = false;

let gameListener = null;









// ============================================================
// RESTORE STATE
// ============================================================


function restoreGameState(game){


    if(!game)
        return;



    if(game.round){

        currentRound =
        game.round;

    }



    if(game.scores){

        myScore =
        game.scores[myRole] || 0;

    }



}









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





if(!room)
    return;





// если игра уже идёт

if(
room.game &&
room.game.status
){


restoreGameState(
room.game
);



listenGame();


return;


}






// создаёт только player1

if(myRole==="player1"){



const question =
await generateQuestion();





await ref
.child("game")
.set({

round:1,


question:


question,


status:
"answering",



answers:{},



votes:{},



votingOrder:null,



scores:{


player1:0,


player2:0


},



aiGenerated:false,


result:null



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





gameListener =
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
game.status==="answering"
&&
game.question
){


showQuestion(
game.question
);


}






if(

game.status==="ai_generating"

){


showWaitingAI();


}







if(

game.status==="voting"

&&
game.votingOrder

){


openVoting(
game
);


}







if(

game.status==="finished"

&&
game.result

){


showRoundResult(
game.result
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
"rooms/"
+
currentRoomId
+
"/game/answers/"
+
myRole
)
.set({

text:text,


type:"human"


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






checkAnswers();



}









// ============================================================
// CHECK TWO HUMANS
// ============================================================


async function checkAnswers(){



const snapshot =
await database
.ref(
"rooms/"
+
currentRoomId
+
"/game"
)
.once(
"value"
);




const game =
snapshot.val();






if(

!game.answers ||

!game.answers.player1 ||

!game.answers.player2

)
return;






// только один запускает AI

if(

myRole==="player1"

&&

!game.aiGenerated

&&

game.status==="answering"

){



await database
.ref(
"rooms/"
+
currentRoomId
+
"/game/status"
)
.set(
"ai_generating"
);



createAIAnswer();



}



}









// ============================================================
// AI PLAYER
// ============================================================


async function createAIAnswer(){



if(aiGenerating)
return;



aiGenerating=true;





const snapshot =
await database
.ref(
"rooms/"
+
currentRoomId
+
"/game"
)
.once(
"value"
);



const game =
snapshot.val();






if(
game.aiGenerated
){

aiGenerating=false;

return;

}







const answer =
await generateAIAnswer(
game.question
);






const shortAnswer =
answer
.substring(
0,
450
);






await database
.ref(
"rooms/"
+
currentRoomId
+
"/game/answers/ai"
)
.set({

text:
shortAnswer,


type:
"ai"



});






// создаём фиксированный порядок

const order =
shuffle([

"player1",

"player2",

"ai"

]);






await database
.ref(
"rooms/"
+
currentRoomId
+
"/game"
)
.update({

votingOrder:
order,


aiGenerated:true,


status:
"voting"


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






const answers =
game.answers;





const list =
game.votingOrder.map(id=>({


id:id,


text:
answers[id].text



}));






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






votingOrder =
game.votingOrder;



}









// ============================================================
// VOTE
// ============================================================


async function vote(index){



if(hasVoted)
return;



hasVoted=true;





const selected =
votingOrder[index];





await database
.ref(
"rooms/"
+
currentRoomId
+
"/game/votes/"
+
myRole
)
.set({

answer:
selected



});






document
.querySelectorAll(
".answer-card"
)
.forEach(btn=>{


btn.disabled=true;


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
"rooms/"
+
currentRoomId
+
"/game"
)
.once(
"value"
);





const game =
snapshot.val();





if(

!game.votes ||

!game.votes.player1 ||

!game.votes.player2

)
return;







// считает только player1

if(
myRole==="player1"
){


calculateResult(game);



}



}









// ============================================================
// RESULT
// ============================================================


async function calculateResult(game){



let scores =
{

player1:
0,


player2:
0


};







const votes =
game.votes;






for(
const player of
[
"player1",
"player2"
]

){



const voted =
votes[player].answer;






// угадал ИИ

if(
voted==="ai"
){


scores[player]+=2;


}






// его приняли за ИИ

const other =
player==="player1"
?
"player2"
:
"player1";





if(
votes[other].answer===player
){


scores[player]+=1;


}




}








await database
.ref(
"rooms/"
+
currentRoomId
+
"/game"
)
.update({

scores:scores,


status:
"finished",



result:{

scores:scores,


votes:votes



}



});



}









// ============================================================
// SHOW RESULT
// ============================================================


function showRoundResult(result){



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
"final-result"
)
.textContent =


"Раунд завершён\n\n" +

"Игрок 1: "
+
result.scores.player1
+
" очков\n" +


"Игрок 2: "
+
result.scores.player2
+
" очков";






setTimeout(

nextRound,

3000

);



}









// ============================================================
// NEXT ROUND
// ============================================================


async function nextRound(){



const snapshot =
await database
.ref(
"rooms/"
+
currentRoomId
+
"/game"
)
.once(
"value"
);





const game =
snapshot.val();





if(
!game
)
return;






const next =
(game.round || 1)+1;






if(
next>5
){


showFinalGame(
game
);


return;


}







hasAnswered=false;

hasVoted=false;

aiGenerating=false;






const input =
document
.getElementById(
"answer-input"
);



if(input){

input.disabled=false;

input.value="";

}





document
.getElementById(
"send-answer-btn"
)
.disabled=false;








if(
myRole==="player1"
){



const question =
await generateQuestion();





await database
.ref(
"rooms/"
+
currentRoomId
+
"/game"
)
.set({

round:next,


question:question,


status:
"answering",


answers:{},


votes:{},


votingOrder:null,


aiGenerated:false,


scores:game.scores || {


player1:0,


player2:0


},


result:null


});



}



}









// ============================================================
// FINAL
// ============================================================


function showFinalGame(game){



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






const scores =
game.scores ||
{player1:0,player2:0};





document
.getElementById(
"final-score"
)
.textContent =

myRole==="player1"
?
scores.player1
:
scores.player2;



}









// ============================================================
// WAIT AI
// ============================================================


function showWaitingAI(){



document
.getElementById(
"answer-wait"
)
.classList
.remove(
"hidden"
);



document
.getElementById(
"answer-wait"
)
.innerHTML =

"🤖 ИИ формирует ответ.<br>Ждём голосование...";



}









// ============================================================
// SHUFFLE
// ============================================================


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
