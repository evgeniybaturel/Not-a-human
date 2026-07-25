// ============================================================
// ROOM SYSTEM
// NOT A HUMAN
// Комнаты: 2 человека + скрытый ИИ
// ============================================================


let currentRoomId = null;

let myPlayerId = null;

let myRole = null;



// ============================================================
// СОЗДАНИЕ ID
// ============================================================


function createPlayerId(){


    return "player_" +
        Math.random()
        .toString(36)
        .substring(2,10);


}






// ============================================================
// КОД КОМНАТЫ
// ============================================================


function generateRoomCode(){


    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let result = "";



    for(let i = 0; i < 6; i++){


        result +=
        chars[
            Math.floor(
                Math.random()
                *
                chars.length
            )
        ];


    }



    return result;


}








// ============================================================
// СОЗДАТЬ КОМНАТУ
// ============================================================


async function createRoom(){



    myPlayerId =
        createPlayerId();



    myRole =
        "player1";



    const code =
        generateRoomCode();



    currentRoomId =
        code;





    await database
    .ref(
        "rooms/" + code
    )
    .set({



        created:
        Date.now(),




        status:
        "waiting",




        players:{



            player1:{


                id:
                myPlayerId,


                score:
                0


            },



            player2:null


        },





        ai:{


            active:true,


            type:
            "hidden"


        },





        game:null




    });






    showCreatedRoom(code);


    openLobby();


    listenRoom();



}








// ============================================================
// ВХОД В КОМНАТУ
// ============================================================


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






    if(
        room.players &&
        room.players.player2
    ){


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
        "rooms/" +
        code +
        "/players/player2"
    )
    .set({



        id:
        myPlayerId,


        score:
        0



    });








    await database
    .ref(
        "rooms/" +
        code +
        "/status"
    )
    .set(
        "ready"
    );






    openLobby();


    listenRoom();



}









// ============================================================
// СЛУШАЕМ КОМНАТУ
// ============================================================


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

                room.players.player1
                &&
                room.players.player2
                &&
                room.status === "ready"

            ){



                showRoomReady();




                setTimeout(()=>{


                    startGame();


                },1500);



            }





        }
    );



}









// ============================================================
// UI
// ============================================================


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
        "✅ Второй участник подключился. Запуск эксперимента...";


    }



}









// ============================================================
// КНОПКИ
// ============================================================


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
