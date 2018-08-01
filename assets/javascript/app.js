

$(document).ready(function () {
    console.log("ready!");

    // click handler
    $("body").on("click", "#addTrainBtn", function () {
        // disable click while handling click event
        $("#addTrainBtn").attr("disabled", "disabled");
        $("#addTrainBtn").text("Updating...");
        newTrain = {
            trainNameDB: $("#trainName").val().trim(),
            trainDestnDB: $("#trainDestn").val().trim(),
            trainStartDB: $("#trainStart").val().trim(),
            trainFrequencyDB: $("#trainFrequency").val().trim()
        }

        // translate to epochTime
        var epochTime = moment(newTrain.trainStartDB, "HH:mm").format("X");

        // update vaue to epochTime
        newTrain['trainStartDB'] = epochTime;
        
        // log event
        console.log("recevied input: ", newTrain);

        // // add to DB
        var newTrain = database.ref().push(newTrain);
    })

});



// Initialize Firebase
var config = {
    apiKey: "AIzaSyCrBnxCgKz59rYQ4kBshrnsfJj7oGTU__c",
    authDomain: "trainschedule-f9baf.firebaseapp.com",
    databaseURL: "https://trainschedule-f9baf.firebaseio.com",
    projectId: "trainschedule-f9baf",
    storageBucket: "trainschedule-f9baf.appspot.com",
    messagingSenderId: "231413435432"
};


firebase.initializeApp(config);

var database = firebase.database();




// Database child handler
database.ref().on("child_added", function (childSnapshot) {
    console.log(childSnapshot.val());

    // store values in varaibe
    var name = childSnapshot.val().trainNameDB;
    var dest = childSnapshot.val().trainDestnDB;
    var freq = childSnapshot.val().trainFrequencyDB;
    var start = childSnapshot.val().trainStartDB;

    //////////////
    // fancy math stuff
    //////////////
    // use moment to convert starttime and currentTime to epoch format in secons
    // so it's easier to calculate
    var startTime = parseInt(start);  
    var currentTime = parseInt(moment().format("X"));  

    // do rest of calculations using integer math
    // formula is ( currentTime - starttime ) % freq = remainder 
    var testTime = (currentTime - startTime) % (parseInt(freq)*60);
    var secsSoFar = 0;

    // if start time < current time of day.  assuem we are referring to the train schedule that started yesterday
    // eg. if start time is 12:50PM   and current time is 11:30AM, that means that current time is 11:30AM 8/1 and
    //  and the start time is day before 7/31 at 12:50PM.  so one day = 86400 seconds

    if (testTime < 0) {
        secsSoFar = (currentTime - startTime + 86400) % (parseInt(freq)*60);
    } else {
        secsSoFar = testTime;
    }

    // minutes away = frequency - reminder (1 min = 60 secods)
    var secsAway = parseInt(freq)*60 - secsSoFar;
    var minsAway = parseInt(secsAway / 60);  // this will change from floating to integer

    console.log("minutes away: ", minsAway);

    // Next Arrival = currentTime + seconds away
    var nextArrival = currentTime + secsAway;  // this is in epoch
    
    
    console.log("Current Time: ",currentTime);

    // prettyup seconds using moment.js  
    var startTimeDisp = moment(start,"X").format("HH:mm");
    var nextArrivalDisp = moment(nextArrival,"X").format("hh:mm A");
    //////////////////
    

    // Create the new row with new values. 
    var newRow = $("<tr>").append(
        $("<td>").text(name),
        $("<td>").text(dest),
        $("<td>").text(freq),
        $("<td>").text(startTimeDisp),
        $("<td>").text(nextArrivalDisp + "---" + minsAway)
    );

    // add to existing tbody
    $("#trainSchedule > tbody").append(newRow);



    // re-enable button
    $("#addTrainBtn").text("Submit");
    $("#addTrainBtn").removeAttr("disabled");

})

