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
    var openSit
    firebase.initializeApp(config);
    var database = firebase.database();
    /**
     * This always listens
     * Get the lenght of the WHOLE db. //FOR FUN
     * Determine which session is open and put it on openSession
     */
    database.ref().on("value",function(snapshot) {
       // var sessions = Object.keys(snapshot.val()).length ? Object.keys(snapshot.val()).length : null
       console.log("listening:", snapshot.val())
        for (session in snapshot.val()) {
            if (openSession(session) ) {
                openSit =openSession(session)  // Get each hash representing a session
                break
            }
        }
    }, function(errorObject){
        console.log("error",errorObject)
    });

    database.ref(openSit).on("child_added",function(data){
        if(data.val()[1]){
            $("#player1").html(data.val()[1].name)
        }
    })


    database.ref(openSit).on("child_changed",function(data){
        if(data.val()[2]){
            $("#player2").html(data.val()[2].name)
        }
        console.log("TURN", data.val().turn)
        //SHOW RPS

        //database.ref().child(openSit).update({"turn":changeTurn(data.val().turn)})
    })



    /**
     * Change who's turn is it
     * @param turn
     */

    function changeTurn(turn){
        var turn_to
        if(turn == 1){
            return 2
        }else {
            return 1
        }
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
    /**
     * Grab the player name
     */
    $("#submit-player").on("click",function(){
        var playerName =$("#player-name").val().trim()
        var obj
        // ASSIGN PLAYER 1
        if (openSit === undefined && playerName){
            obj = {1: {"wins":0, "loses":0, "name":playerName,"choice":""}}
            database.ref().push(obj)
            $(".player-input").hide()
        }
        // ASSIGN PLAYER 2
        else if( playerName ){
            obj ={"wins":0,"loses":0,"name":playerName,"choice":""}
            database.ref(openSit+"/"+2).set(obj)
            database.ref(openSit+"/turn").set(1)
            $(".player-input").hide()
        }
    })
});
