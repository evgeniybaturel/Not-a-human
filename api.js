// ============================================================
// GROQ API
// Игра "Кто здесь ИИ?"
// ============================================================


function getApiKey() {

    const key =
        localStorage.getItem('groq_api_key') || '';

    return key;
}



// Если ключа нет - просим ввести

function setApiKey() {

    const key = prompt(
        "Введите API ключ Groq"
    );


    if (key && key.trim()) {

        localStorage.setItem(
            'groq_api_key',
            key.trim()
        );

        return true;
    }


    return false;
}



// ============================================================
// ОСНОВНОЙ ЗАПРОС GROQ
// ============================================================


async function askGroq(system, prompt) {


    let apiKey = getApiKey();


    if (!apiKey) {

        if (!setApiKey()) {

            throw new Error(
                "Нет API ключа Groq"
            );
        }


        apiKey = getApiKey();
    }



    const response =
        await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${apiKey}`

                },


                body: JSON.stringify({

                    model:
                        "llama-3.3-70b-versatile",


                    messages: [

                        {
                            role: "system",
                            content: system
                        },


                        {
                            role: "user",
                            content: prompt
                        }

                    ],


                    temperature: 0.9,


                    max_tokens: 300

                })

            }
        );



    if (!response.ok) {


        const error =
            await response.json();


        throw new Error(
            error.error?.message ||
            "Ошибка Groq"
        );

    }



    const data =
        await response.json();


    return (

        data
        .choices[0]
        .message
        .content
        .trim()

    );

}



// ============================================================
// ГЕНЕРАЦИЯ ВОПРОСА
// ============================================================


async function generateQuestion() {


    const system = `

Ты ведущий теста Тьюринга.

Создавай интересные вопросы,
на которые человек и ИИ могут ответить.

Вопрос должен:
- не иметь правильного ответа;
- заставлять раскрывать мнение;
- позволять заметить стиль мышления.

Не задавай слишком личные вопросы.

Ответь только текстом вопроса.

`;



    const prompt = `

Придумай случайный вопрос для игры.

`;



    return await askGroq(
        system,
        prompt
    );

}



// ============================================================
// ГЕНЕРАЦИЯ ОТВЕТА ИИ
// ============================================================


async function generateAIAnswer(question) {


    const system = `

Ты участник игры "Кто здесь ИИ?".

Ты искусственный интеллект,
но пытаешься убедить людей,
что ты настоящий человек.

Отвечай естественно.

Используй:
- эмоции;
- небольшие сомнения;
- обычную речь.

Не говори, что ты ИИ.

Ответ должен быть 2-5 предложений.

`;



    const prompt = `


Вопрос:

${question}


Ответь как человек.


`;



    return await askGroq(
        system,
        prompt
    );

}



// ============================================================
// АНАЛИЗ ПОСЛЕ ИГРЫ (ЗАГОТОВКА)
// ============================================================


async function analyzeGame(answers) {


    const system = `

Ты анализируешь тест Тьюринга.

Определи:
- какой ответ больше похож на ИИ;
- какие признаки выдали участника.

Ответь кратко.

`;



    return await askGroq(
        system,
        JSON.stringify(answers)
    );

}


console.log(
    "🤖 API модуль загружен"
);
