// ============================================================
// FIREBASE CONFIG
// Кто здесь ИИ?
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


// Запуск Firebase

firebase.initializeApp(firebaseConfig);


// Подключение базы

const database = firebase.database();


// Экспортируем глобально

window.firebaseDatabase = database;


console.log("🔥 Firebase подключен");
