$(document).ready(function(){
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDzKCP5UzFSGIdmSq74yBdYUI3_CY-rSGo",
        authDomain: "goosetaculous.firebaseapp.com",
        databaseURL: "https://goosetaculous.firebaseio.com",
        projectId: "goosetaculous",
        storageBucket: "goosetaculous.appspot.com",
        messagingSenderId: "325415828804"
    };
    var openSit,choice1,choice2,winner
    var name1,name2
    var p1wins=0,p1lose=0
    var p2wins=0,p2lose=0

    firebase.initializeApp(config);
    var database = firebase.database();
    /**
     * This always listens
     * Get the lenght of the WHOLE db. //FOR FUN
     * Determine which session is open and put it on openSit
     */
    database.ref().on("value",function(snapshot) {
       // var sessions = Object.keys(snapshot.val()).length ? Object.keys(snapshot.val()).length : null
        if(openSit){
            database.ref(openSit+"/1/msg").on("value",function (chat) {
                var conversation = $("#talk-shit").val().trim() + "\n"
                $("#talk-shit").text(conversation + chat.val()+ " <--" + name1)
                scrollBottom()
            })

            database.ref(openSit+"/2/msg").on("value",function (chat) {
                var conversation = $("#talk-shit").val().trim() + "\n"
                $("#talk-shit").text(conversation + chat.val() + " <--" + name2)
                scrollBottom()

            })


            database.ref(openSit+"/1/wins").once("value",function(data){
                $("#p1-wins").html(data.val())
            })
            database.ref(openSit+"/1/loses").once("value",function(data){
                $("#p1-losses").html(data.val())
            })

            database.ref(openSit+"/2/wins").once("value",function(data){
                $("#p2-wins").html(data.val())
            })
            database.ref(openSit+"/2/loses").once("value",function(data){
                $("#p2-losses").html(data.val())
            })


            database.ref(openSit+"/turn").once("value",function (data) {
                turn = data.val()
            })
            database.ref(openSit+"/1/choice").once("value",function(c1){
               choice1 = c1.val()
            })
            database.ref(openSit+"/2/choice").once("value",function(c2){
                choice2 = c2.val()
            })
            if (choice1 && choice2 && turn == 1){
                winner = eveluateWinner(choice1,choice2)

                $(".rps1").hide()
                setTimeout( clearResults,2000,winner)

            }


        }
        for (session in snapshot.val()) {
            if (openSession(session) ) {
                openSit =openSession(session)  // Get each hash representing a session
                break
            }
        }
    }, function(errorObject){
        console.log("error",errorObject)
    });

    function scrollBottom(){
        $("#talk-shit").animate({
            scrollTop:$("#talk-shit")[0].scrollHeight - $("#talk-shit").height()
        },200)
    }


    /**
     * Clear the choices after 3 seconds
     */
    function clearResults(winner) {
        database.ref(openSit + "/1/choice").set("")
        database.ref(openSit + "/2/choice").set("")
        $(".game-result").html("")
        if (sessionStorage.getItem("player") == 1) {
            $(".rps1").show()
        }
        if(winner ==1){
            p1wins++
            p2lose++
        }else {
            p2wins++
            p1lose++
        }
        console.log(p1wins,p1lose)
        console.log(p2wins,p2lose)
        database.ref(openSit+"/1/wins").set(p1wins)
        database.ref(openSit+"/1/loses").set(p1lose)
        database.ref(openSit+"/2/wins").set(p2wins)
        database.ref(openSit+"/2/loses").set(p2lose)
    }





    /**
     * Populate Player 1 Name
     */
    database.ref(openSit).on("child_added",function(data){
        if(data.val()[1]){
            $("#player1").html(data.val()[1].name)
            name1=data.val()[1].name
        }
    })
    /**
     * Populate Player 2 Name
     */
    database.ref(openSit).on("child_changed",function(data){
        if(data.val()[2]){
            $("#player2").html(data.val()[2].name)
            name2=data.val()[2].name
        }
    })
    /**
     *Set player 1 choice
     */
    $(".rps1").on("click","button",function(){
        database.ref(openSit+"/1/choice").set($(this).attr("val"))
        changeTurn()
    })
    /**
     *Set player 2 choice
     */
    $(".rps2").on("click","button",function(){
        database.ref(openSit+"/2/choice").set($(this).attr("val"))
        changeTurn()
    })
    /**
     * Change the Player turn
     */
    function changeTurn(){
        database.ref(openSit+"/turn").once("value", function(data){
            if(  data.val() === 1){
                database.ref(openSit+"/turn").set(2)
            }else{
                database.ref(openSit+"/turn").set(1)
            }
        })
    }
    /**
     * Evaluate Winner
     */
    function eveluateWinner(choice1,choice2){
        var gameResult,winner
        if( choice1 == choice2){
            gameResult = "tied"
        }
        else if ((choice1 - choice2 + 3) % 3 == 1){
            database.ref(openSit+"/1/name").once("value", function(player){
                gameResult = player.val() + " wins"
            })
            winner = 1
        }
        else {
            database.ref(openSit+"/2/name").once("value", function(player){
                gameResult = player.val() + " wins"
            })
            winner = 2
        }
        $(".game-result").html(gameResult)
        return winner
    }
    /**
     * Return the session that is open
     * @param session_key
     * @returns session that is open
     */
    function openSession(session_key){
        var ct =  database.ref().child(session_key)
        var session
        var ctr=0
        ct.on("value", function(count){
            for(key2 in count.val()){
                ctr++
            }
            if(ctr <2 ){
                session = session_key
            }
        })
        return session
    }

    $("#send_msg").on("click",function(){
        var chat_msg = $(".msg").val().trim()

        database.ref(openSit+"/"+sessionStorage.getItem("player")+"msg").set(chat_msg)
        $(".msg").val("")



        alert(chat_msg)
    })


    /**
     * Grab the player name
     */
    $("#submit-player").on("click",function(){
        var playerName =$("#player-name").val().trim()
        var obj
        // ASSIGN PLAYER 1
        if (openSit === undefined && playerName){

            sessionStorage.setItem("player",1)
            obj = {1: {"wins":0, "loses":0, "name":playerName,"choice":"","msg":""}}
            database.ref().push(obj)
            $(".player-input").hide()
        }
        // ASSIGN PLAYER 2
        else if( playerName ){

            sessionStorage.setItem("player",2)
            obj ={"wins":0,"loses":0,"name":playerName,"choice":"","msg":""}
            database.ref(openSit+"/"+2).set(obj)
            database.ref(openSit+"/turn").set(1)
            $(".player-input").hide()
        }
        database.ref(openSit+"/turn").on("value", function(data){
            if(data.val() == 1 && sessionStorage.getItem("player") == 1){
                $(".rps1").show()
                $(".rps2").hide()
            }
            if(data.val() == 2 && sessionStorage.getItem("player") == 1){
                $(".rps1").hide()
            }
            if(data.val() == 1 && sessionStorage.getItem("player") == 2){
                $(".rps2").hide()
            }
            if(data.val() == 2 && sessionStorage.getItem("player") == 2 ){
                $(".rps2").show()
                $(".rps1").hide()
            }
        })
    })
});

