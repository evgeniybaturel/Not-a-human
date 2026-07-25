// ============================================================
// GAME ENGINE
// NOT A HUMAN
// 2 PLAYERS + AI
// ============================================================


let currentRound = 1;

let myScore = 0;

let shuffledAnswers = [];

let hasAnswered = false;

let hasVoted = false;






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

        showQuestion(
            room.game.question
        );

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






if(

game.answers &&

Object.keys(
game.answers
).length === 2

&&

!game.aiGenerated

){


generateAIResponse();


}







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

type:
"human"

});







// блокируем повторную отправку


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
// AI RESPONSE
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





if(game.aiGenerated)
    return;





const answer =
await generateAIAnswer(
game.question
);





await ref.update({

aiGenerated:true

});





await ref
.child(
"answers/ai"
)
.set({

text:answer,

type:"ai"

});




}









// ============================================================
// VOTING
// ============================================================


function prepareVoting(answers){



const list=[



{

id:"player1",

text:
answers.player1.text

},


{

id:"player2",

text:
answers.player2.text

},


{

id:"ai",

text:
answers.ai.text

}


];




shuffledAnswers =
shuffle(
list
);



showVoting(
shuffledAnswers
);



}









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
"vote-title"
)
.textContent =
"Кто кажется искусственным интеллектом?";







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



if(hasVoted)
    return;




hasVoted = true;



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
.forEach(btn=>{


btn.disabled = true;


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
// RESULT
// ============================================================


async function calculateResult(votes){



let points = 0;



// угадал ИИ

if(
votes[myRole].answer === "ai"
){

points += 2;

}





// игрока приняли за ИИ

const other =
myRole==="player1"
?
"player2"
:
"player1";




if(
votes[other]
&&
votes[other].answer === myRole
){

points +=1;

}





myScore += points;




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









function nextRound(){


currentRound++;


hasAnswered=false;

hasVoted=false;




if(currentRound>5){


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
textContent =
myScore;



}









function shuffle(array){


return array.sort(
()=>Math.random()-0.5
);


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
