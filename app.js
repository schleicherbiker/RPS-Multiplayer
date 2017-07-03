$(document).ready(function() {

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
const database = firebase.database();

// Handle New Players
var player = 0;
$("#submit").click(function() {

    // Check for valid input and player spots
    var playerName = $("input").val();
    database.ref("players").once('value', function(snapshot) {

        // If No Active Player 1...
        if (snapshot.val()["1"] === undefined && playerName.trim() !== "") {

            // Clear Rules and Signup / Show Game
            $("#rules").addClass("hidden");
            $("#signup").addClass("hidden");
            $(".playerbox").removeClass("hidden");
            $("#statusText").removeClass("hidden");
        
            // Write to DB
            player = 1;
            database.ref("players/1").set({
                name: playerName.trim(),
                wins: 0,
                losses: 0
            });
            database.ref("players/1").onDisconnect().set({
                1: null
            });

        // Else If No Active Player 2...
        } else if (snapshot.val()["2"] === undefined && playerName.trim() !== "") {
        
            // Clear Rules and Signup
            $("#rules").addClass("hidden");
            $("#signup").addClass("hidden");
            $(".playerbox").removeClass("hidden");
            $("#statusText").removeClass("hidden");
            
            // Write to DB
            player = 2;
            database.ref("players/2").set({
                name: playerName.trim(),
                wins: 0,
                losses: 0
            });
            database.ref("players/2").onDisconnect().set({
                2: null
            });
        }
    })
});

// Update Player 1 HTML on DB Value Change...
database.ref("players/1").on('value', function(snapshot) {

    if (snapshot.val() !== null) {
        var name = snapshot.val().name;
        var losses = snapshot.val().losses;
        var wins = snapshot.val().wins;
        $("#player1header").html(name);
        if (player === 1) {
            $("#player1").html("Hi " + name + "! You are Player 1!");
        } else {
            $("#player1").html("");
        }
        $("#player1footer").html("Wins: " + wins + " | Losses: " + losses);
    } else {
        var name = "Player 1";
        var losses = "NA";
        var wins = "NA";
        $("#player1header").html(name);
        $("#player1").html("Waiting on " + name + ".");
        $("#player1footer").html("Wins: " + wins + " | Losses: " + losses);
    }
})  

// Update Player 2 HTML on DB Value Change...
database.ref("players/2").on('value', function(snapshot) {

    if (snapshot.val() !== null) {
        var name = snapshot.val().name;
        var losses = snapshot.val().losses;
        var wins = snapshot.val().wins;
        $("#player2header").html(name);
        if (player === 2) {
            $("#player2").html("Hi " + name + "! You are Player 2!");
        } else {
            $("#player2").html("");
        }
        $("#player2footer").html("Wins: " + wins + " | Losses: " + losses);
    } else {
        var name = "Player 2";
        var losses = "NA";
        var wins = "NA";
        $("#player2header").html(name);
        $("#player2").html("Waiting on " + name + ".");
        $("#player2footer").html("Wins: " + wins + " | Losses: " + losses);
    }
})

// Check for Full Lobby (2 Players)
database.ref("players").on('value', function(snapshot) {
    
    // If two players are in a game
    if (snapshot.val()["1"] !== undefined && snapshot.val()["2"] !== undefined) {

        // If both of them haven't made choices...
        if (snapshot.val()["1"]["choice"] === undefined && snapshot.val()["2"]["choice"] === undefined) {
            console.log("here");
            $("#statusText").html("Choose an element!");

            // Make buttons and text
            var text = $("<div>Choose an element!</div>");
            var fire = $("<button id='fire'><span class='glyphicon glyphicon-fire'></span></button>");
            fire.addClass("btn btn-danger");
            var nature = $("<button id='nature'><span class='glyphicon glyphicon-leaf'></span></button>");
            nature.addClass("btn btn-success");
            var water = $("<button id='water'><span class='glyphicon glyphicon-tint'></span></button>");
            water.addClass("btn btn-primary");
            var buttons = $("<div>");
            buttons.append(fire, nature, water);

            var otherPlayer = JSON.stringify(Math.abs(player-3));

            // Add click handlers
            fire.click(function() {

                // Update DB
                database.ref("players/" + player).update({
                    choice: $(this).attr("id")
                })

                // Update HTML
                $("#player" + player).html(fire);
                $("#statusText").html("Waiting on " + snapshot.val()[otherPlayer]["name"]);

            })
            nature.click(function() {

                // Update DB
                database.ref("players/" + player).update({
                    choice: $(this).attr("id")
                })
                
                // Update HTML
                $("#player" + player).html(nature);
                $("#statusText").html("Waiting on " + snapshot.val()[otherPlayer]["name"]);

            })
            water.click(function() {

                // Update DB
                database.ref("players/" + player).update({
                    choice: $(this).attr("id")
                })
                
                // Update HTML
                $("#player" + player).html(water);
                $("#statusText").html("Waiting on " + snapshot.val()[otherPlayer]["name"]);

            })

            // Append buttons
            if (player === 1) {
                $("#player1").html(buttons);
            } else if (player === 2) {
                $("#player2").html(buttons);
            }
        
        // Else if both players have made choices...
        } else if (snapshot.val()["1"]["choice"] !== undefined && snapshot.val()["2"]["choice"] !== undefined) {
            var winner = gameResult(snapshot.val()["1"]["choice"], snapshot.val()["2"]["choice"]);
            var loser = Math.abs(parseInt(winner) - 3);
            $("#statusText").html(snapshot.val()[winner]["name"] + " wins!");
            database.ref("players/" + winner).update({
                wins: snapshot.val()[winner]["wins"] + 1,
                choice: null
            })
            database.ref("players/" + loser).update({
                losses: snapshot.val()[loser]["losses"] + 1,
                choice: null
            })


        } else {
            console.log("There has been some lapse in my logic");
        }
    }
})

})

function gameResult(p1Choice, p2Choice) {
    if (p1Choice === p2Choice) {
        return -1;
    } else if (p1Choice === "fire") {
        if (p2Choice === "nature") { 
            return 1;
        } else {
            return 2;
        }
    } else if (p1Choice === "nature") {
        if (p2Choice === "water") { 
            return 1;
        } else {
            return 2;
        }
    } else {
        if (p2Choice === "fire") { 
            return 1;
        } else {
            return 2;
        }
    }
}

function displayWinner(name) {
    setTimeout(function() {
        $("#statusText").html(name + " wins!")
    }, 3000);
    console.log("i made it here");
}

