// ============================================================
// GROQ API
// NOT A HUMAN
// AI PLAYER ENGINE v2
// ============================================================


function getApiKey(){


    return localStorage.getItem(
        "groq_api_key"
    ) || "";


}






function saveApiKey(key){


    if(key){

        localStorage.setItem(
            "groq_api_key",
            key
        );

    }


}









// ============================================================
// GENERATE QUESTION
// ============================================================


async function generateQuestion(){


const apiKey =
getApiKey();





if(!apiKey){

    return randomQuestion();

}






const prompt = `

Ты ведущий игры Not a Human.

Создай один вопрос для теста Тьюринга.

Игроки должны отвечать так, чтобы было сложно понять:
они человек или ИИ.

Требования:

- вопрос открытый;
- нет правильного ответа;
- не спрашивай личные данные;
- вопрос должен вызывать разные мнения;
- не используй похожие вопросы из прошлых раундов.

Верни только текст вопроса.

`;






try{


const response =
await fetch(

"https://api.groq.com/openai/v1/chat/completions",

{


method:"POST",


headers:{


"Content-Type":"application/json",


"Authorization":
`Bearer ${apiKey}`


},



body:JSON.stringify({


model:
"llama-3.3-70b-versatile",



messages:[

{

role:"system",

content:
"Ты создаёшь вопросы для игры Not a Human."

},


{

role:"user",

content:prompt

}

],



temperature:1.1,


max_tokens:120


})


}

);






const data =
await response.json();





return data
.choices[0]
.message
.content
.trim();



}

catch(e){


console.error(
"Question error:",
e
);


return randomQuestion();


}



}









// ============================================================
// AI PLAYER ANSWER
// ============================================================


async function generateAIAnswer(question){



const apiKey =
getApiKey();





if(!apiKey){

    return fakeHumanAnswer();

}







const prompt = `

Ты играешь в Not a Human.

Ты обычный человек в чате.

Твоя задача — написать ответ так,
чтобы другие игроки не поняли, что ты ИИ.

Вопрос:

"${question}"


Правила:

- отвечай только от лица человека;
- не объясняй свои рассуждения;
- не анализируй вопрос;
- не пиши как эксперт;
- используй естественный стиль общения;
- можно добавить маленькую бытовую деталь;
- не упоминай ИИ.

Формат:

3-5 коротких предложений.

Верни только ответ игрока.

`;









try{


const response =
await fetch(

"https://api.groq.com/openai/v1/chat/completions",

{


method:"POST",


headers:{


"Content-Type":"application/json",


"Authorization":
`Bearer ${apiKey}`


},



body:JSON.stringify({


model:
"llama-3.3-70b-versatile",



messages:[


{

role:"system",

content:
"Ты скрываешь, что являешься ИИ, в игре Not a Human."

},


{

role:"user",

content:prompt

}


],



temperature:0.9,


max_tokens:180


})


}

);







const data =
await response.json();







let answer =
data
.choices[0]
.message
.content
.trim();







// защита от пустого ответа

if(!answer){

answer =
fakeHumanAnswer();

}







// ограничиваем слишком длинные ответы

const sentences =
answer.split(
/(?<=[.!?])\s+/
);




if(sentences.length > 5){


answer =
sentences
.slice(0,5)
.join(" ");


}







// исправление оборванного текста

if(

answer.endsWith(",") ||

answer.endsWith("-") ||

answer.endsWith("и")

){


answer += ".";


}







return answer;



}

catch(e){


console.error(
"AI answer error:",
e
);



return fakeHumanAnswer();



}



}









// ============================================================
// FALLBACK
// ============================================================


function randomQuestion(){


const questions=[


"Какая привычка делает жизнь удобнее?",


"Что люди часто недооценивают?",


"Какой маленький момент может изменить день?",


"Что делает человека интересным собеседником?",


"Какой совет действительно работает в жизни?"


];



return questions[
Math.floor(
Math.random()*questions.length
)
];


}









function fakeHumanAnswer(){


const answers=[


"Мне кажется, что многое зависит от маленьких привычек. Например, когда заранее готовишь дела на завтра, утром становится намного спокойнее. Хотя я сам иногда это забываю делать.",


"Наверное, люди часто не замечают простых вещей вокруг себя. Иногда обычный разговор или прогулка могут сильно изменить настроение.",


"Я думаю, что самые полезные вещи обычно кажутся слишком простыми. Например, нормальный сон и порядок в делах реально влияют на день."


];


return answers[
Math.floor(
Math.random()*answers.length
)
];


}








console.log(
"🤖 Not a Human AI engine v2 loaded"
);
