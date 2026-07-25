// ============================================================
// GROQ API
// NOT A HUMAN
// AI PLAYER GENERATOR
// ============================================================



function getApiKey(){

    // Пока оставляем ключ как был
    // Позже вынесем безопасно

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

Придумай вопрос для игры "Not a Human".

Игроки должны отвечать так,
чтобы было сложно понять,
человек это или искусственный интеллект.

Правила:

- вопрос открытый;
- нельзя ответить одним словом;
- не спрашивай личные данные;
- не спрашивай про здоровье, адрес или деньги;
- вопрос должен раскрывать характер человека.

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


                temperature:
                1,


                max_tokens:
                80


            })


        });



        const data =
        await response.json();




        return data
        .choices[0]
        .message
        .content
        .trim();




    }
    catch(e){


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


        return "Наверное, я бы просто попробовал сделать что-то удобное для людей. Не уверен, что есть один правильный ответ.";


    }






const prompt = `


Ты играешь в игру "Not a Human".

Твоя задача:
выдать себя за обычного человека.

Ответь на вопрос:

${question}



Правила ответа:

- 2-4 предложения;
- пиши простыми словами;
- не используй списки;
- не объясняй слишком подробно;
- не звучишь как эксперт;
- не используй фразы вроде "важно отметить", "комплексный подход", "это требует";
- допускай небольшую неидеальность;
- можно использовать "думаю", "наверное", "мне кажется";
- ответ должен выглядеть как сообщение обычного человека.


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
"Ты человек, который пытается выглядеть как ИИ, но не палится."

},


{

role:"user",

content:
prompt

}


],


temperature:
1.3,


max_tokens:
90


})


});





const data =
await response.json();




let answer =
data
.choices[0]
.message
.content
.trim();




return limitSentences(answer);





}
catch(e){


return "Мне кажется, тут нет одного правильного ответа. Я бы сначала попробовал разобраться в ситуации.";


}



}









// ============================================================
// LIMIT RESPONSE
// ============================================================


function limitSentences(text){



    let sentences =
    text.match(
        /[^.!?]+[.!?]+/g
    );



    if(!sentences)
        return text;



    return sentences
    .slice(0,4)
    .join(" ")
    .trim();


}









// ============================================================
// FALLBACK QUESTIONS
// ============================================================


function randomQuestion(){



const list=[


"Какой момент из жизни ты часто вспоминаешь?",


"Что тебе нравится делать, когда никто не мешает?",


"Какой совет ты бы дал себе несколько лет назад?",


"Что для тебя делает день хорошим?",


"Какую вещь ты считаешь недооценённой?"


];



return list[
Math.floor(
Math.random()*list.length
)
];


}







console.log(
"🤖 AI engine loaded"
);
