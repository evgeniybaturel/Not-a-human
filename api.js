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

Игроки будут отвечать как люди.
Нет правильного ответа.

Требования:

- вопрос открытый;
- нельзя спрашивать личные данные;
- ответ должен позволять проявить характер и стиль мышления;
- ответ должен быть примерно 3-5 предложений.

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
"Ты создаёшь вопросы для игры Not a Human."

},


{

role:"user",

content:
prompt

}

],


temperature:
0.8,


max_tokens:
80


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
catch(error){


console.error(
"Question error:",
error
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

Ты третий игрок.

Очень важно:

Ты НЕ знаешь ответы других игроков.
Не анализируй их.
Не копируй чужой стиль.

Придумай полностью самостоятельный ответ.

Ответ должен выглядеть как сообщение обычного человека в чате.


Вопрос:

${question}


Правила:

- писать от первого лица;
- 2-3 коротких предложения;
- максимум 350 символов;
- без списков;
- без философских рассуждений;
- без слов "как ИИ";
- можно добавить маленькую бытовую деталь;
- допускай небольшую неидеальность.


Только готовый ответ игрока.

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

"Ты обычный человек, который участвует в игре. Ты не знаешь ответы других игроков."

},


{

role:"user",

content:
prompt

}


],



temperature:
0.9,


max_tokens:
70



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






let answer =
data
.choices[0]
.message
.content
.trim();






// дополнительная обрезка

if(answer.length>350){


answer =
answer.substring(
0,
350
);


}





return answer;





}
catch(error){


console.error(
"AI answer error:",
error
);


return fakeHumanAnswer();


}



}









// ============================================================
// FALLBACK
// ============================================================


function randomQuestion(){


const questions=[


"Какое простое событие может неожиданно улучшить твой день?",


"Что люди часто недооценивают в обычной жизни?",


"Какой совет ты считаешь действительно полезным?",


"Что бы ты хотел изменить в мире вокруг себя?",


"Какая привычка делает жизнь удобнее?"


];


return questions[
Math.floor(
Math.random()*questions.length
)
];


}








function fakeHumanAnswer(){


const answers=[


"Наверное, мне больше всего нравятся спокойные вечера дома. Иногда обычный разговор может сделать день намного лучше.",


"Думаю, маленькие вещи часто важнее больших планов. Например, хорошая музыка или случайная встреча.",


"Я бы сказал, что люди часто забывают отдыхать. Иногда нужно просто остановиться и немного переключиться."


];


return answers[
Math.floor(
Math.random()*answers.length
)
];


}









console.log(
"🤖 Stable Groq API loaded"
);
