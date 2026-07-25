// ============================================================
// GROQ API
// NOT A HUMAN
// Генерация вопросов + AI игрок
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

Придумай вопрос для теста Тьюринга.

Люди будут отвечать, пытаясь выглядеть как ИИ.

Требования:

- вопрос должен быть открытым;
- ответ должен занимать несколько предложений;
- не спрашивай личные данные;
- вопрос должен раскрывать стиль мышления человека;
- не должно быть правильного ответа.

Верни только вопрос.

`;







try{


const response =
await fetch(

"https://api.groq.com/openai/v1/chat/completions",

{


method:"POST",


headers:{


"Content-Type":
"application/json",


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
"Ты создаёшь вопросы для игры."

},


{

role:"user",

content:
prompt

}


],



temperature:1,


max_tokens:100


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


console.error(e);


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

Ты играешь в игру Not a Human.

Твоя роль — притвориться обычным человеком.

Другие игроки должны решить:
ты настоящий человек или искусственный интеллект.

Ответь на вопрос:

"${question}"


Правила:

- пиши от первого лица;
- 2-5 предложений;
- не используй списки;
- не звучать как ассистент;
- не говори "как ИИ";
- допускай небольшие человеческие неточности;
- можешь добавить личное мнение или сомнение;
- не делай идеальный философский ответ.

Твой ответ должен выглядеть как сообщение обычного человека в чате.

`;








try{


const response =
await fetch(

"https://api.groq.com/openai/v1/chat/completions",

{


method:"POST",


headers:{


"Content-Type":
"application/json",


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
"Ты человек, который пытается пройти тест Тьюринга."

},


{

role:"user",

content:
prompt

}


],



temperature:1.2,


max_tokens:150


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


console.error(e);


return fakeHumanAnswer();


}




}









// ============================================================
// FALLBACK
// ============================================================



function randomQuestion(){


const questions=[


"Какой момент из жизни ты чаще всего вспоминаешь?",


"Что бы ты изменил в современном мире?",


"Какая маленькая вещь делает твой день лучше?",


"Какой совет ты дал бы себе несколько лет назад?",


"Что тебе кажется недооценённым людьми?"


];


return questions[
Math.floor(
Math.random()*questions.length
)
];


}








function fakeHumanAnswer(){


const answers=[


"Наверное, я бы сказал, что мне нравится просто гулять вечером. Иногда такие обычные моменты почему-то запоминаются сильнее всего. Хотя сложно выбрать что-то одно.",


"Интересный вопрос. Думаю, я бы не стал всё менять сразу, потому что неизвестно к чему это приведёт. Наверное, начал бы с маленьких вещей.",


"Я часто замечаю, что самые простые вещи делают настроение лучше. Например, хороший разговор или случайная смешная ситуация."


];


return answers[
Math.floor(
Math.random()*answers.length
)
];


}







console.log(
"🤖 Groq API loaded"
);
