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

    // no need for !== null as null will act the same as false here
    if (snapshot.val()) {
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

    // same as above
    if (snapshot.val()) {
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
    // undefined will actually work as false here
    if (snapshot.val()["1"] && snapshot.val()["2"]) {

        // If both of them haven't made choices...
        if (!snapshot.val()["1"]["choice"] && !snapshot.val()["2"]["choice"]) {
            console.log("both have not made choices");
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

                // Update HTML
                $("#player" + player).html(fire);
                if (snapshot.val()[Math.abs(parseInt(player) - 3)]["choice"] === undefined)
                    $("#statusText").html("Waiting on " + snapshot.val()[otherPlayer]["name"]);

                // Update DB
                database.ref("players/" + player).update({
                    choice: $(this).attr("id")
                })
            })
            nature.click(function() {

                // Update HTML
                $("#player" + player).html(nature);
                if (snapshot.val()[Math.abs(parseInt(player) - 3)]["choice"] === undefined)
                    $("#statusText").html("Waiting on " + snapshot.val()[otherPlayer]["name"]);

                // Update DB
                database.ref("players/" + player).update({
                    choice: $(this).attr("id")
                })
            
            })
            water.click(function() {

                // Update HTML
                $("#player" + player).html(water);
                if (snapshot.val()[Math.abs(parseInt(player) - 3)]["choice"] === undefined)
                    $("#statusText").html("Waiting on " + snapshot.val()[otherPlayer]["name"]);

                // Update DB
                database.ref("players/" + player).update({
                    choice: $(this).attr("id")
                })

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

            // Show winner
            if (winner === -1) {
                $("#statusText").html("Tie game!")  
            } else {
                $("#statusText").html(snapshot.val()[winner]["name"] + " wins!")
            }

            // Show choices
            var fire = $("<button class='btn btn-danger' id='fire'><span class='glyphicon glyphicon-fire'></span></button>");
            var nature = $("<button class='btn btn-success' id='nature'><span class='glyphicon glyphicon-leaf'></span></button>");
            var water = $("<button class='btn btn-primary' id='water'><span class='glyphicon glyphicon-tint'></span></button>");
            if (snapshot.val()[player]["choice"] === "fire")
                 $("#player" + player).html(fire);
            if (snapshot.val()[player]["choice"] === "nature")
                 $("#player" + player).html(nature);
            if (snapshot.val()[player]["choice"] === "water")
                 $("#player" + player).html(water);


            // Update Wins and Losses if not a tie...
            setTimeout(function() {

                if (winner !== -1) {
                    database.ref("players/" + winner).update({
                        wins: snapshot.val()[winner]["wins"] + 1,
                    })
                    database.ref("players/" + loser).update({
                        losses: snapshot.val()[loser]["losses"] + 1,
                    })
                }

                // Reset Choices
                database.ref("players/1").update({
                    choice: null
                })
                database.ref("players/2").update({
                    choice: null
                })

            }, 6000);
        
        // No need for the empty else block, nothing will happen if the above conditions aren't met
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
