$(document).ready(function () {

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


    // Initialize instance of github provider object
    var provider = new firebase.auth.GithubAuthProvider();

    
    // check if user is logged, if not, redirect to login page
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log("user is logged in: ", user);
            console.log("-----------------------------------");
        } else {
            console.log("user is not logged in!");
            firebase.auth().signInWithRedirect(provider);
        }
    });
    
/*
    // click handler to logout
    $("body").on("click", "#logoutBtn", function () {
        console.log("Did I click Logout?");
        firebase.auth().signOut().then(function () {
            console.log("Successful Logout");
        }, function (error) {
            console.log("Failed! ",error);
        });
    });
*/

    // initialize Time for banner, add train, and modals.  
    localTime = moment();
    $("#currentTime").text(localTime.format("MM/DD/YYYY hh:mm A"));
    $('#startTrainDate').val(localTime.format("MM/DD/YYYY"));
    $('#startTrainTime').val(localTime.format("HH:mm"));


    // initialize Fields for Datepicker library found on web
    // https://gijgo.com/datepicker/example/bootstrap-4
    $("#startTrainDate").datepicker({ uiLibrary: 'bootstrap4' });  // this is to add a train
    $("#updateTrainDate").datepicker({ uiLibrary: 'bootstrap4' });  // this is to update an existing train




    // click handler to open bootstrap popup/Modal for updating Train
    $("body").on("click", ".editTrain", function () {
        let dbkey = $(this).attr("databaseid");
        console.log("open modal for: ", dbkey);

        // load values of object key from database and prefill modal form
        database.ref(dbkey).on("value", function (snapshot) {

            // empty previous modal message 
            $('.updateMsg').empty();

            // load database
            updateValObj = snapshot.val();
            console.log("updateObj: ", updateValObj);

            // pretty display for trainStartTime, stored in epoch time (secs)
            let trainStartDisp = moment(updateValObj.trainStartDB, "X").format("HH:mm");
            console.log(updateValObj.trainStartDB, trainStartDisp);
            let trainStartTimeDisp = moment(updateValObj.trainStartDB, "X").format("HH:mm");
            let trainStartDateDisp = moment(updateValObj.trainStartDB, "X").format("MM/DD/YYYY");

            // prepopulate values
            $("#updateDBID").val(dbkey);
            $("#updateName").val(updateValObj.trainNameDB);
            $("#updateDestn").val(updateValObj.trainDestnDB);
            // $("#updateStart").val(trainStartDisp);
            $("#updateTrainDate").val(trainStartDateDisp);
            $("#updateTrainTime").val(trainStartTimeDisp);
            $("#updateFrequency").val(updateValObj.trainFrequencyDB);
            $("#updateTrainBTN").removeAttr("disabled");  // in case it was disabled before

            // activate modal to show
            $("#updateTrainPrompt").modal("show");

        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);

        });

    });


    // click handler to update values
    $("body").on("click", "#updateTrainBTN", function () {
        // disable button
        $("#updateTrainBTN").attr("disabled", "disabled");

        // grab text info
        var dbid = $("#updateDBID").val();
        var updateName = $("#updateName").val();
        var updateDestn = $("#updateDestn").val();
        var updateStart = $("#updateStart").val();
        var updateFrequency = $("#updateFrequency").val();

        // grab date time test strings
        var updateTrainDate = $('#updateTrainDate').val().trim();
        var updateTrainTime = $('#updateTrainTime').val().trim();

        // combine strings to nicer format
        var dateTimeString = updateTrainDate + " " + updateTrainTime;

        // use moment to transform it to epoch Time (secs) for storage
        var updateStartEpochObj = moment(dateTimeString, "MM/DD/YYYY HH:mm");
        var updateStartEpoch = updateStartEpochObj.format("X");
        console.log("Any Luckwith update?", dateTimeString, updateStartEpoch);

        // place values into Object
        var updatedInfo = {
            trainNameDB: updateName,
            trainDestnDB: updateDestn,
            trainStartDB: updateStartEpoch,
            trainFrequencyDB: updateFrequency
        }
        console.log(dbid, updateName, updateDestn, updateStartEpoch, updateFrequency);

        // update the values on database
        database.ref(dbid).update(updatedInfo);

        // print success
        $('.updateMsg').html("<p class='text-success'>Successfully Updated!!!");
        console.log("--------->success with updating!");

        // hide modal after 1 second of displaying success!
        var temp = setTimeout(function () {
            $('#updateTrainPrompt').modal('hide');
            console.log("I tried to toggle!");
        }, 1000);
    });


    // click handler to add train
    $("body").on("click", "#addTrainBtn", function () {
        // disable click while handling click event
        $("#addTrainBtn").attr("disabled", "disabled");
        $("#addTrainBtn").text("Updating...");
        newTrain = {
            trainNameDB: $("#trainName").val().trim(),
            trainDestnDB: $("#trainDestn").val().trim(),
            trainStartDB: "",
            trainFrequencyDB: $("#trainFrequency").val().trim()
        }
        console.log("----->> add train handler?")

        // grab date time test strings
        var startTrainDate = $('#startTrainDate').val().trim();
        var startTrainTime = $('#startTrainTime').val().trim();

        // combine strings to nicer format
        var dateTimeString = startTrainDate + " " + startTrainTime;

        // use moment to transform it to epoch Time (secs) for storage
        var updateStartEpochObj = moment(dateTimeString, "MM/DD/YYYY HH:mm");
        var updateStartEpoch = updateStartEpochObj.format("X");
        console.log("Any Luck?", dateTimeString, epochTime);

        // basic input validations
        console.log


        // update vaue to epochTime
        newTrain['trainStartDB'] = epochTime;

        // log event
        console.log("recevied input: ", newTrain);

        // // add to DB
        var newTrain = database.ref().push(newTrain);
    })


    // click function to delete item
    $("body").on("click", ".deleteTrain", function () {
        let testid = $(this).attr("databaseid");
        console.log(testid);
        var remTrain = database.ref().child(testid).remove();
    });



    // 60 second interval Timer to update values
    var clockTimer = setInterval(function () {
        let curTime = moment().format("hh:mm A");
        $("#currentTime").text(curTime);
        database.ref().on("value", function (snapshot) {
            trainObj = snapshot.val();
            updateTable(trainObj);
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    }, 60000)


    // function to update table, called by 60 second timer, child removed, child changed handler
    function updateTable(snapshotObj) {
        // clear tbody
        $("#trainSchedule > tbody").empty();

        for (key in snapshotObj) {
            // extract values
            var name = snapshotObj[key].trainNameDB;
            var dest = snapshotObj[key].trainDestnDB;
            var freq = snapshotObj[key].trainFrequencyDB;
            var start = snapshotObj[key].trainStartDB;
            var primKey = key;

            // newObject to pass to drawTable
            newObject = {
                trainNameDB: name,
                trainDestnDB: dest,
                trainFrequencyDB: freq,
                trainStartDB: start,
                primKeyDB: primKey
            }
            // update rows
            updateRows(newObject);

        }
        console.log("done!!");

    }


    // Database child removed handler, redraw table when child is removed from DB
    database.ref().on("child_removed", function () {
        database.ref().on("value", function (snapshot) {
            trainObj = snapshot.val();
            updateTable(trainObj);
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    })

    // Database child changed handler, redraw table when child is updated/changed
    database.ref().on("child_changed", function () {
        database.ref().on("value", function (snapshot) {
            trainObj = snapshot.val();
            updateTable(trainObj);
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    })



    // Database child added handler, add table row for every new addition detected
    database.ref().on("child_added", function (childSnapshot) {
        console.log("snapshot", childSnapshot.val());


        // store values in varaibe
        var name = childSnapshot.val().trainNameDB;
        var dest = childSnapshot.val().trainDestnDB;
        var freq = childSnapshot.val().trainFrequencyDB;
        var start = childSnapshot.val().trainStartDB;
        var primKey = childSnapshot.key;

        // log key?
        console.log("new key: ", name, " : ", childSnapshot.key);

        // newObject to pass to drawTable
        newObject = {
            trainNameDB: name,
            trainDestnDB: dest,
            trainFrequencyDB: freq,
            trainStartDB: start,
            primKeyDB: primKey
        }

        // updateRows
        updateRows(newObject);

        // re-enable button
        $("#addTrainBtn").text("Submit");
        $("#addTrainBtn").removeAttr("disabled");

    })


    // update rows to Table, honoring the DRY principle, almost everything will call this part to update the table 
    // rows 
    function updateRows(trainData) {
        // extract values
        var name = trainData.trainNameDB;
        var dest = trainData.trainDestnDB;
        var freq = trainData.trainFrequencyDB;
        var start = trainData.trainStartDB;
        var primKey = trainData.primKeyDB;

        //console.log("updateRows: ", trainData);
        //////////////
        // fancy math stuff
        //////////////
        // use moment to convert starttime and currentTime to epoch format in secons
        // so it's easier to calculate 
        var startTime = parseInt(start);
        var currentTime = parseInt(moment().format("X"));

        // do rest of calculations using integer math (seconds)
        // formula is ( currentTime - starttime ) % freq = remainder 
        var testTime = (currentTime - startTime) % (parseInt(freq) * 60);
        var secsSoFar = 0;   // initialize secs to wait for next train
        var minsAway = 0;  // initialize mins away
        var nextArrival = 0;  // initailize nextArrival

        // if start time < current time of day.  then train hasn't started to run yet,
        //  so secsSoFar 
        if (testTime < 0) {
            secsSoFar = startTime - currentTime; // if train hasn't started yet, then wait for train to start running
            console.log(name, " calculated: ", secsSoFar);
            minsAway = parseInt(secsSoFar / 60); // change from floating to integer
            nextArrival = startTime;  /// arrival Time is the start time
        } else {
            secsSoFar = testTime;  // otherwise start Time is accurate

            // minutes away = frequency - reminder (1 min = 60 secods)
            secsAway = parseInt(freq) * 60 - secsSoFar;
            minsAway = parseInt(secsAway / 60);  // this will change from floating to integer

            // Next Arrival = currentTime + seconds away
            nextArrival = currentTime + secsAway;  // this is in epoch

        }

        //console.log("Current Time: ", currentTime);

        // prettyup seconds using moment.js  
        var startTimeDisp = moment(start, "X").format("HH:mm");
        var nextArrivalDisp = moment(nextArrival, "X").format("hh:mm A");
        //////////////////


        // create icon for trash and associate key to it
        var actionTD = $("<td>");
        var trashHTML = '<i class="fas fa-trash-alt deleteTrain" databaseID = "' + primKey + '"></i>';

        var editHTML = '<i class="fas fa-pencil-alt editTrain" databaseID = "' + primKey + '"></i>';
        actionTD.html(trashHTML + editHTML);

        // mark red is arrival in less than 5 minutes
        if (minsAway < 5) {
            // Create the new row with new values. 
            var newRow = $("<tr>").append(
                actionTD,
                $("<td>").text(name).addClass("makeRed"),
                $("<td>").text(dest).addClass("makeRed"),
                $("<td>").text(freq).addClass("makeRed"),
                $("<td>").text(nextArrivalDisp).addClass("makeRed"),
                $("<td>").text(minsAway).addClass("makeRed"),
            );
            newRow.addClass("selectRow");

            // add to existing tbody
            $("#trainSchedule > tbody").append(newRow);

        } else {

            // Create the new row with new values. 
            var newRow = $("<tr>").append(
                actionTD,
                $("<td>").text(name),
                $("<td>").text(dest),
                $("<td>").text(freq),
                $("<td>").text(nextArrivalDisp),
                $("<td>").text(minsAway)
            );
            newRow.addClass("selectRow");

            // add to existing tbody
            $("#trainSchedule > tbody").append(newRow);
        }
    }

});











