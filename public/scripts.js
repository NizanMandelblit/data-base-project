$(document).keypress(function(event){
    var ew = event.which;
    if(ew == 32)
        return true;
    if(48 <= ew && ew <= 57)
        return true;
    if(65 <= ew && ew <= 90)
        return true;
    if(97 <= ew && ew <= 122)
        return true;
    return false;
});


$(document).ready(function () {
    $("#my-form").on("submit", function () {
        $("#loadingbtn").show()
        $("#sumbitbtn").hide()
    });//submit
});//dom ready


$(document).ready(function () {
    $("#myInput").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#myTable tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    $("#myInputtwo").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#myTabletwo tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

});


function onReady(callback) {
    var intervalId = window.setInterval(function () {
        if (document.getElementsByTagName('body')[0] !== undefined) {
            window.clearInterval(intervalId);
            callback.call(this);
        }
    }, 1000);
}

function setVisible(selector, visible) {
    document.querySelector(selector).style.display = visible ? 'block' : 'none';
}

onReady(function () {
    setVisible('.page', true);
    setVisible('#loading', false);

});

function limit() {
    document.getElementsByName("minRateRestaurant")[0].setAttribute("max", document.getElementsByName("maxRateRestaurant")[0].value);
    document.getElementsByName("minNightCost")[0].setAttribute("max", document.getElementsByName("maxNightCost")[0].value);
    document.getElementsByName("minRateHA")[0].setAttribute("max", document.getElementsByName("maxRateHA")[0].value);
}


function airbnbsend(queryairbnb) {
    console.log(queryairbnb)
}