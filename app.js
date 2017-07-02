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

var player;

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
            player = "player1";
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
            player = "player2";
        }
    })
});

// Update HTML on DB Value Change...
database.ref("players/1").on('value', function(snapshot) { updatePlayer(snapshot, "1"); })  
//database.ref("players/2").on('value', function(snapshot) { updatePlayer(snapshot, "2"); })

// Clear Player on DC
if (player !== undefined)
    database.ref("players/"+player).onDisconnect().set("");


function updatePlayer(snapshot, num) {
    var player = $("<div>Player 1<div>");
    var name = $("<div>" + snapshot.val()[num].name + "</div>");
    var losses = $("<div>" + snapshot.val()[num].losses + "</div>");
    var wins = $("<div>" + snapshot.val()[num].wins + "</div>");
    $("#player"+num).empty();
    $("#player"+num).append(player, name, losses, wins);
}