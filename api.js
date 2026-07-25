// ============================================================
// API ENGINE
// NOT A HUMAN
// Groq AI
// ============================================================



function getApiKey() {

    return localStorage.getItem(
        "groq_api_key"
    ) || "";

}




function saveApiKey(key) {

    if(key){

        localStorage.setItem(
            "groq_api_key",
            key
        );

    }

}






// ============================================================
// ГЕНЕРАЦИЯ ВОПРОСА
// ============================================================


async function generateQuestion(){


    const apiKey =
        getApiKey();



    if(!apiKey){

        return getFallbackQuestion();

    }



    const prompt = `

Ты ведущий игры Not a Human.

Придумай интересный вопрос для теста Тьюринга.

Игроки должны ответить так,
чтобы можно было определить:
человек они или искусственный интеллект.

Правила:

- вопрос должен быть открытым;
- нельзя отвечать одним словом;
- не используй слишком личные темы;
- вопрос должен раскрывать стиль мышления человека.

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
                    0.9,


                    max_tokens:
                    120


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


        console.error(e);


        return getFallbackQuestion();


    }


}









// ============================================================
// ГЕНЕРАЦИЯ ОТВЕТА ИИ
// ИИ ПЫТАЕТСЯ БЫТЬ ЧЕЛОВЕКОМ
// ============================================================


async function generateAIAnswer(question){



    const apiKey =
        getApiKey();



    if(!apiKey){

        return fallbackAIAnswer();

    }




    const prompt = `


Ты участвуешь в игре Not a Human.

Ты настоящий искусственный интеллект,
но твоя задача — убедить игроков,
что ты обычный человек.


Ответь на вопрос:

"${question}"


Правила:

- пиши естественно;
- не используй слова "как ИИ";
- не пиши слишком идеально;
- добавь немного человеческой манеры;
- можешь использовать эмоции;
- ответ должен быть 2-5 предложений.


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
                        "Ты человек, который отвечает естественно."


                    },


                    {


                        role:"user",


                        content:
                        prompt


                    }


                ],



                temperature:
                1.1,



                max_tokens:
                200


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
    catch(error){


        console.error(error);


        return fallbackAIAnswer();


    }


}







// ============================================================
// СЛУЧАЙНЫЕ ВОПРОСЫ ЕСЛИ НЕТ API
// ============================================================


function getFallbackQuestion(){


    const questions=[


        "Как бы вы описали свой идеальный день?",


        "Какое решение в жизни оказалось самым неожиданным?",


        "Что делает человека интересным собеседником?",


        "Какой навык вы бы хотели получить мгновенно?",


        "Что вы обычно делаете, когда у вас плохое настроение?"

    ];



    return questions[

        Math.floor(
            Math.random() *
            questions.length
        )

    ];


}






function fallbackAIAnswer(){


    return (

        "Думаю, многое зависит от ситуации. " +
        "Обычно я стараюсь находить баланс между отдыхом и полезными делами. " +
        "Иногда самые простые моменты оказываются самыми приятными."

    );


}







// ============================================================
// ПЕРЕМЕШИВАНИЕ ОТВЕТОВ
// ============================================================


function shuffleAnswers(array){


    return array.sort(
        ()=>Math.random()-0.5
    );


}




console.log(
    "🤖 AI engine loaded"
);
