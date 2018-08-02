

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

    // 60 second Timer
    var clockTimer = setInterval(function () {
        let curTime = moment().format("hh:mm:ss A");
        $("#currentTime").text(curTime);
        database.ref().on("value", function (snapshot) {
            trainObj = snapshot.val();
            updateTable(trainObj);
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    }, 60000)


    // function to update table
    function updateTable(snapshotObj) {
        // clear tbody
        $("#trainSchedule > tbody").empty();

        for (key in snapshotObj) {
            // extract values
            var name = snapshotObj[key].trainNameDB;
            var dest = snapshotObj[key].trainDestnDB;
            var freq = snapshotObj[key].trainFrequencyDB;
            var start = snapshotObj[key].trainStartDB;

            // newObject to pass to drawTable
            newObject = {
                trainNameDB: name,
                trainDestnDB: dest,
                trainFrequencyDB: freq,
                trainStartDB: start
            }

            updateRows(newObject);

        }
        console.log("done!!");

    }
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


    // initialize Time
    $("#currentTime").text(moment().format("hh:mm:ss A"));

    // Database child handler, add row for every new addition detected
    database.ref().on("child_added", function (childSnapshot) {
        console.log(childSnapshot.val());

        // store values in varaibe
        var name = childSnapshot.val().trainNameDB;
        var dest = childSnapshot.val().trainDestnDB;
        var freq = childSnapshot.val().trainFrequencyDB;
        var start = childSnapshot.val().trainStartDB;

        // newObject to pass to drawTable
        newObject = {
            trainNameDB: name,
            trainDestnDB: dest,
            trainFrequencyDB: freq,
            trainStartDB: start
        }

        // updateRows
        updateRows(newObject);

        // re-enable button
        $("#addTrainBtn").text("Submit");
        $("#addTrainBtn").removeAttr("disabled");

    })


    // update rows to Table
    function updateRows(trainData) {
        // extract values
        var name = trainData.trainNameDB;
        var dest = trainData.trainDestnDB;
        var freq = trainData.trainFrequencyDB;
        var start = trainData.trainStartDB;
        //////////////
        // fancy math stuff
        //////////////
        // use moment to convert starttime and currentTime to epoch format in secons
        // so it's easier to calculate
        var startTime = parseInt(start);
        var currentTime = parseInt(moment().format("X"));

        // do rest of calculations using integer math
        // formula is ( currentTime - starttime ) % freq = remainder 
        var testTime = (currentTime - startTime) % (parseInt(freq) * 60);
        var secsSoFar = 0;

        // if start time < current time of day.  assuem we are referring to the train schedule that started yesterday
        // eg. if start time is 12:50PM   and current time is 11:30AM, that means that current time is 11:30AM 8/1 and
        //  and the start time is day before 7/31 at 12:50PM.  so one day = 86400 seconds

        if (testTime < 0) {
            secsSoFar = (currentTime - startTime + 86400) % (parseInt(freq) * 60);
        } else {
            secsSoFar = testTime;
        }

        // minutes away = frequency - reminder (1 min = 60 secods)
        var secsAway = parseInt(freq) * 60 - secsSoFar;
        var minsAway = parseInt(secsAway / 60);  // this will change from floating to integer

        console.log("minutes away: ", minsAway);

        // Next Arrival = currentTime + seconds away
        var nextArrival = currentTime + secsAway;  // this is in epoch


        console.log("Current Time: ", currentTime);

        // prettyup seconds using moment.js  
        var startTimeDisp = moment(start, "X").format("HH:mm");
        var nextArrivalDisp = moment(nextArrival, "X").format("hh:mm A");
        //////////////////

        // mark red is arrival in less than 5 minutes
        if (minsAway < 5) {
            // Create the new row with new values. 
            var newRow = $("<tr>").append(
                $("<td>").text(name).addClass("makeRed"),
                $("<td>").text(dest).addClass("makeRed"),
                $("<td>").text(freq).addClass("makeRed"),
                $("<td>").text(nextArrivalDisp).addClass("makeRed"),
                $("<td>").text(minsAway).addClass("makeRed"),
            );

            // add to existing tbody
            $("#trainSchedule > tbody").append(newRow);

        } else {

            // Create the new row with new values. 
            var newRow = $("<tr>").append(
                $("<td>").text(name),
                $("<td>").text(dest),
                $("<td>").text(freq),
                $("<td>").text(nextArrivalDisp),
                $("<td>").text(minsAway)
            );

            // add to existing tbody
            $("#trainSchedule > tbody").append(newRow);
        }
    }

});











