// ============================================================
// ROOM SYSTEM
// NOT A HUMAN
// Создание и подключение комнат
// ============================================================


let currentRoomId = null;

let myPlayerId = null;

let myRole = null;



// Генерация ID игрока

function createPlayerId(){

    return "player_" +
        Math.random()
        .toString(36)
        .substring(2,10);

}



// Генерация кода комнаты

function generateRoomCode(){

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let result = "";


    for(let i = 0; i < 6; i++){

        result +=
            chars[
                Math.floor(
                    Math.random() *
                    chars.length
                )
            ];

    }


    return result;

}




// Создать комнату

async function createRoom(){


    myPlayerId =
        createPlayerId();


    myRole =
        "player1";



    const roomCode =
        generateRoomCode();



    currentRoomId =
        roomCode;



    await database
        .ref(
            "rooms/" + roomCode
        )
        .set({

            created:
                Date.now(),


            status:
                "waiting",


            player1:{

                id:
                    myPlayerId,


                score:
                    0

            },


            player2:null,


            game:null


        });



    showCreatedRoom(
        roomCode
    );



    openLobby();



    listenRoom();

}




// Подключиться к комнате

async function joinRoom(){



    const input =
        document.getElementById(
            "room-input"
        );


    const code =
        input.value
        .trim()
        .toUpperCase();



    if(!code){

        alert(
            "Введите код комнаты"
        );

        return;

    }




    const snapshot =
        await database
        .ref(
            "rooms/" + code
        )
        .once(
            "value"
        );



    if(!snapshot.exists()){

        alert(
            "Комната не найдена"
        );

        return;

    }




    const room =
        snapshot.val();



    if(room.player2){

        alert(
            "Комната уже заполнена"
        );

        return;

    }




    myPlayerId =
        createPlayerId();



    myRole =
        "player2";



    currentRoomId =
        code;




    await database
    .ref(
        "rooms/" + code + "/player2"
    )
    .set({

        id:
            myPlayerId,


        score:
            0

    });




    await database
    .ref(
        "rooms/" + code + "/status"
    )
    .set(
        "ready"
    );



    openLobby();



    listenRoom();

}





// Слушаем комнату

function listenRoom(){


    if(!currentRoomId)
        return;



    database
    .ref(
        "rooms/" +
        currentRoomId
    )
    .on(
        "value",
        snapshot=>{


            const room =
                snapshot.val();



            if(!room)
                return;




            if(
                room.player1 &&
                room.player2
            ){


                showRoomReady();


                setTimeout(
                    ()=>{

                        startGame();

                    },
                    1000
                );


            }


        }
    );

}





// Показываем код создателю

function showCreatedRoom(code){


    const el =
        document.getElementById(
            "created-room"
        );


    if(el){

        el.textContent =
            "Код: " + code;

    }

}





// Открываем экран ожидания

function openLobby(){


    document
    .getElementById(
        "start-screen"
    )
    .classList
    .add(
        "hidden"
    );



    document
    .getElementById(
        "lobby-screen"
    )
    .classList
    .remove(
        "hidden"
    );



    const display =
        document.getElementById(
            "room-display"
        );


    if(display){

        display.textContent =
            currentRoomId;

    }

}





function showRoomReady(){


    const wait =
        document.querySelector(
            ".waiting"
        );


    if(wait){

        wait.textContent =
            "✅ Игрок найден";

    }

}




// Кнопки

document.addEventListener(
"DOMContentLoaded",
()=>{


    document
    .getElementById(
        "create-room-btn"
    )
    ?.addEventListener(
        "click",
        createRoom
    );



    document
    .getElementById(
        "join-room-btn"
    )
    ?.addEventListener(
        "click",
        joinRoom
    );


});



console.log(
    "🏠 Room system loaded"
);
