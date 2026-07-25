// ============================================================
// FIREBASE CONNECTION
// NOT A HUMAN
// ============================================================


// Конфигурация Firebase

const firebaseConfig = {

    apiKey: "AIzaSyAUA65cW3VJrmfwHjKKxlUHKJVgYYEDjWo",

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



// Инициализация Firebase

firebase.initializeApp(firebaseConfig);



// Подключаем Realtime Database

const database = firebase.database();



// Делаем доступным для других файлов

window.database = database;



console.log("🔥 Firebase подключен");
