const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const mysql = require("mysql")
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
const port = 3001
var pageName;

var pass=''
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
app.get('/output', (req, res) => {
    pageName = "output page";

    res.render("index", {pageName: pageName});
})

//POST functions
app.post("/search", function (req, res) {
    var style = req.body.style;
    var distance = req.body.distance;
    var maxRateRestaurant = req.body.maxRateRestaurant;
    var minRateRestaurant = req.body.minRateRestaurant;
    var maxNightCost = req.body.maxNightCost;
    var minNightCost = req.body.minNightCost;
    var maxRateHA = req.body.maxRateHA;
    var minRateHA = req.body.minRateHA;
    var critical = req.body.critical;
    console.log(style);
    console.log(distance);
    console.log(maxRateRestaurant);
    console.log(minRateRestaurant);
    console.log(maxNightCost);
    console.log(minNightCost);
    console.log(maxRateHA);
    console.log(minRateHA);
    console.log(critical);
    if (critical) {
        console.log("!!!!!!!!!");
    } else {
        console.log("??????????");
    }
    res.redirect("/output");
})

app.post("/update", function (req, res) {
    var id = req.body.id;
    var placeSort = req.body.place;
    var FirstName = req.body.FirstName;
    var LastName = req.body.LastName;
    var grade = req.body.grade;
    var comment = req.body.comment;
    console.log(id);
    console.log(placeSort);
    console.log(FirstName);
    console.log(LastName);
    console.log(grade);
    console.log(comment);
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


//Create connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: pass,
    database: 'newyorktrip'
})

//Connect to MySQL
db.connect(err => {
    if (err) {
        throw err
    }
    console.log('Connected!')
})


 // //Create Database
 // app.get('/createdb', (req, res) => {
 //    let sql = 'CREATE DATABASE NYCulinaryTrip'
 //     db.query(sql, err => {
 //        if (err) {
 //            throw err
 //        )}
 //         res.send('Database Created!')
 //    })
 //
