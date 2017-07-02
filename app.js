// Initialize Firebase
var config = {
    apiKey: "AIzaSyA-swMEXjygwuzzOqvGBLzQVOuegR1s_5Q",
    authDomain: "rps-multiplayer-3e206.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-3e206.firebaseio.com",
    projectId: "rps-multiplayer-3e206",
    storageBucket: "",
    messagingSenderId: "17264456920"
};
firebase.initializeApp(config);

// Reference Database
const database = firebase.database();

var player = 0;

// Player Join
$("#submit").click(function() {
 
    var playerName = $("input").val();

    // If No Active Player 1...
    database.ref("players").once('value', function(snapshot) {
        if (snapshot.val()["1"] === undefined) {
            // Write to DB
            if (playerName !== "") {
                database.ref("players/1").set({
                    name: playerName.trim(),
                    wins: 0,
                    losses: 0
                });
                database.ref("players/1").onDisconnect().set({
                    1: null
                });
            }
            player = 1;
        } else if (snapshot.val()["2"] === undefined) {
            // Write to DB
            if (playerName !== "") {
                database.ref("players/2").set({
                    name: playerName.trim(),
                    wins: 0,
                    losses: 0
                });
                database.ref("players/2").onDisconnect().set({
                    2: null
                });
            }
            player = 2;
        }
    })
});

// Update HTML on DB Value Change...
database.ref("players/1").on('value', function(snapshot) {
    var name = snapshot.val().name;
    var losses = snapshot.val().losses;
    var wins = snapshot.val().wins;
    $("#player1header").html(name);
    if (player !== 0)
        $("#player1").html("Hi " + name + "! You are Player 1!");
    $("#player1footer").html("Wins: " + wins + " | Losses: " + losses);
})  
database.ref("players/2").on('value', function(snapshot) {
    var name = snapshot.val().name;
    var losses = snapshot.val().losses;
    var wins = snapshot.val().wins;
    $("#player2header").html(name);
    if (player !== 0)
        $("#player2").html("Hi " + name + "! You are Player 2!");
    $("#player2footer").html("Wins: " + wins + " | Losses: " + losses);
})

// Clear Player on DC
if (player !== undefined) {
    database.ref("players/"+player).onDisconnect().set("");
}
