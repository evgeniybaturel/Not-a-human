// ============================================================
// FIREBASE CONNECTION
// NOT A HUMAN
// ============================================================


// ============================================================
// CONFIG
// ============================================================


const firebaseConfig = {


    apiKey:
    "AIzaSyAUA65cW3VJrmfwHjKKxlUHKJVgYYEDjWo",


    authDomain:
    "not-a-human.firebaseapp.com",


    databaseURL:
    "https://not-a-human-default-rtdb.firebaseio.com",


    projectId:
    "not-a-human",


    storageBucket:
    "not-a-human.firebasestorage.app",


    messagingSenderId:
    "180222999417",


    appId:
    "1:180222999417:web:b3650309fafe629edf0da8"


};









// ============================================================
// INIT FIREBASE
// ============================================================


if(!firebase.apps.length){


    firebase.initializeApp(
        firebaseConfig
    );


}
else{


    firebase.app();


}









// ============================================================
// DATABASE
// ============================================================


const database =
firebase.database();




window.database =
database;









// ============================================================
// CONNECTION STATUS
// ============================================================


const connectedRef =
database.ref(".info/connected");



connectedRef.on(
"value",
snapshot=>{


if(snapshot.val() === true){


console.log(
"🟢 Firebase connected"
);


}
else{


console.log(
"🔴 Firebase disconnected"
);


}


});









// ============================================================
// ROOM CLEANUP SUPPORT
// ============================================================


function setupDisconnectCleanup(path){


if(!path)
return;



const ref =
database.ref(path);



ref.onDisconnect()
.update({

online:false,

lastSeen:
Date.now()


});



}






window.setupDisconnectCleanup =
setupDisconnectCleanup;









console.log(
"🔥 Firebase loaded"
);
