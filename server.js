const express = require("express")
const bodyParser = require("body-parser")
const app = express()
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
const port = 3001
var pageName;


// GET functions
app.get('/', (req, res) => {
    pageName = "home page";

    res.render("index", {pageName: pageName});
})

app.get('/search', (req, res) => {
    pageName = "search page";

    res.render("index", {pageName: pageName});
})

app.get('/update', (req, res) => {
    pageName = "update page";

    res.render("index", {pageName: pageName});
})

app.get('/delete', (req, res) => {
    pageName = "delete page";

    res.render("index", {pageName: pageName});
})

app.get('/thanks', (req, res) => {
    pageName = "thanks page";

    res.render("index", {pageName: pageName});
})


//POST functions
app.post("/search", function (req, res) {

    res.redirect("/thanks");

})

app.post("/update", function (req, res) {

    res.redirect("/thanks");

})


app.post("/delete", function (req, res) {
    var placeSort = req.body.place;
    var id = req.body.id;
    console.log(placeSort);
    console.log(id);
    res.redirect("/thanks");
})


app.listen(process.env.PORT | port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

