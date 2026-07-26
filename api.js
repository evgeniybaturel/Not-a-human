// ============================================================
// GROQ API
// NOT A HUMAN
// Question generator + AI player
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

Люди должны отвечать на него так,
чтобы было сложно понять человек они или ИИ.

Требования:

- открытый вопрос;
- нет правильного ответа;
- нельзя спрашивать личные данные;
- ответ должен позволять человеку выразить мнение;
- вопрос должен быть интересным для разговора.

Верни только текст вопроса.

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


temperature:1.3,

max_tokens:120


})

}

);





const data =
await response.json();




if(
!data.choices ||
!data.choices[0]
){

return randomQuestion();

}



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







const styles=[


"ответь спокойно и немного неуверенно",

"ответь как обычный человек в переписке",

"добавь маленькую бытовую деталь",

"ответь просто, без умных формулировок",

"покажи личное мнение"



];



const randomStyle =
styles[
Math.floor(
Math.random()*styles.length
)
];







const prompt = `


Ты играешь роль человека в игре Not a Human.


Твоя задача:
обмануть других игроков,
чтобы они подумали,
что ты настоящий человек.


Вопрос:

"${question}"


ВАЖНЫЕ ПРАВИЛА:


1.
Не смотри на ответы других игроков.
Их не существует.


2.
Создай полностью новый ответ,
основанный только на вопросе.


3.
Не используй стандартные фразы ИИ.


4.
Не объясняй свои рассуждения.


5.
Пиши как сообщение обычного человека.


6.
Не делай идеальный философский ответ.


7.
Разрешены:
- сомнения;
- маленькие ошибки;
- личное мнение;
- простые слова.


Стиль:

${randomStyle}



Длина:
2-5 предложений.


Ответь только текстом ответа.


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
"Ты обычный человек, участвующий в тесте Тьюринга."

},


{

role:"user",

content:
prompt

}


],


temperature:1.5,


max_tokens:180


})

}

);





const data =
await response.json();





if(
!data.choices ||
!data.choices[0]
){

return fakeHumanAnswer();

}




return data
.choices[0]
.message
.content
.trim();




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


"Какое решение ты считаешь самым недооценённым в повседневной жизни?",


"Что делает обычный день неожиданно хорошим?",


"Какой совет ты считаешь действительно полезным?",


"Что люди часто понимают слишком поздно?",


"Какую привычку ты бы хотел изменить у большинства людей?"

];


return questions[
Math.floor(
Math.random()*questions.length
)
];


}








function fakeHumanAnswer(){


const answers=[


"Наверное, мне больше всего нравятся обычные спокойные моменты. Иногда простой вечер дома запоминается сильнее каких-то больших событий.",


"Сложно ответить однозначно. Думаю, многое зависит от ситуации, но маленькие вещи часто влияют больше, чем кажется.",


"Я бы сказал, что люди слишком часто торопятся. Иногда полезно просто остановиться и посмотреть вокруг."


];



return answers[
Math.floor(
Math.random()*answers.length
)
];


}







console.log(
"🤖 Improved Groq API loaded"
);
