// ============================================================
// GROQ API
// NOT A HUMAN
// Генерация вопросов
// ============================================================


function getApiKey() {

    const saved =
        localStorage.getItem(
            "groq_api_key"
        );


    return saved || "";

}




function saveApiKey(key) {

    if(key){

        localStorage.setItem(
            "groq_api_key",
            key
        );

    }

}





// Генерация вопроса

async function generateQuestion(){


    const apiKey =
        getApiKey();



    if(!apiKey){

        return "Расскажи что-нибудь о себе, что мало кто знает";

    }



    const prompt = `

Ты ведущий игры "Not a Human".

Придумай один интересный вопрос,
по которому можно понять человека.

Правила:

- вопрос должен быть открытым;
- нельзя отвечать одним словом;
- ответ должен раскрывать личность;
- вопрос должен подходить для игры, где человек притворяется ИИ;
- не задавай слишком личные вопросы;
- не спрашивай про паспорт, адрес, здоровье.

Верни только текст вопроса.
Без кавычек.
Без объяснений.

`;



    try {


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
                            "Ты генератор вопросов для игры."

                        },


                        {

                            role:"user",

                            content:
                            prompt

                        }

                    ],


                    temperature:0.9,


                    max_tokens:100


                })

            });



        if(!response.ok){

            throw new Error(
                "Ошибка Groq"
            );

        }



        const data =
            await response.json();



        const question =
            data
            .choices[0]
            .message
            .content
            .trim();



        return question;



    }

    catch(error){


        console.error(
            error
        );


        const fallback = [

            "Какой момент из жизни ты никогда не забудешь?",

            "Какую суперспособность ты бы выбрал?",

            "Что тебе нравится, но ты редко рассказываешь другим?",

            "Какой совет ты бы дал себе в прошлом?"

        ];



        return fallback[
            Math.floor(
                Math.random() *
                fallback.length
            )
        ];


    }


}




console.log(
    "🤖 Groq API загружен"
);
