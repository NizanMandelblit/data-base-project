function showHide() {

//create an object reference to the div containing images
    var oimageDiv = document.getElementById('loadingbtn')
//set display to inline if currently none, otherwise to none
    if (document.getElementById("requirelist").selectedIndex >= 0) {
        oimageDiv.style.display = 'inline'
        setTimeout(function () {
            oimageDiv.innerText = "please fill in the required fields!"
        }, 1000)
        //  document.getElementById("sumbitbtn").style.display = 'none'

    }
}


function showHiderglr() {
//create an object reference to the div containing images
    var oimageDiv = document.getElementById('loadingbtn')
//set display to inline if currently none, otherwise to none
    oimageDiv.style.display = 'inline'
    setTimeout(function () {
        oimageDiv.innerText = "please fill in the required fields!"
    }, 1000)
    //document.getElementById("sumbitbtn").style.display = 'none'
}
