// ============================================================
// GROQ API
// NOT A HUMAN
// AI PLAYER ENGINE
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
- ответ должен позволять проявить стиль мышления;
- вопрос должен быть интересным для обсуждения.

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



temperature:1,


max_tokens:80


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

Ты участвуешь в игре Not a Human.

Ты обычный человек в чате.

Твоя задача — написать ответ на вопрос так,
чтобы другие игроки не поняли, что ты ИИ.

Вопрос:

"${question}"


ВАЖНЫЕ ПРАВИЛА:

- НЕ анализируй вопрос;
- НЕ объясняй свои рассуждения;
- НЕ пиши как эксперт;
- НЕ используй сложные философские размышления;
- НЕ упоминай искусственный интеллект;
- НЕ копируй возможные ответы других игроков;
- придумай совершенно свою мысль;
- пиши как обычный человек.

Формат:

2-4 коротких предложения.

Добавь немного человеческой особенности:
сомнение, бытовую деталь, личное мнение.

Ответ должен выглядеть как сообщение в обычном чате.

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
"Ты играешь роль человека в тесте Тьюринга."

},


{

role:"user",

content:prompt

}


],



temperature:0.8,


max_tokens:90


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





// дополнительная защита длины

const sentences =
answer.split(/(?<=[.!?])\s+/);



if(sentences.length>4){

answer =
sentences
.slice(0,4)
.join(" ");

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


"Что маленькое всегда улучшает твоё настроение?",


"Какое изобретение сильнее всего изменило людей?",


"Что люди часто недооценивают?",


"Какой совет ты бы дал самому себе в прошлом?"


];



return questions[
Math.floor(
Math.random()*questions.length
)
];


}









function fakeHumanAnswer(){


const answers=[


"Наверное, я бы сказал, что мне помогает планировать день заранее. Хотя иногда всё равно отклоняюсь от планов, потому что так даже интереснее.",


"Я думаю, что самые простые вещи часто делают день лучше. Например, спокойный вечер или хороший разговор с кем-то.",


"Мне кажется, что удобнее всего становятся привычки, которые экономят время. Но иногда я сам забываю ими пользоваться."

];


return answers[
Math.floor(
Math.random()*answers.length
)
];


}








console.log(
"🤖 Stable AI engine loaded"
);
