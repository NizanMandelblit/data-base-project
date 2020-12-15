const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const mysql = require("mysql")
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
const fs = require('fs');
const port = 3001
var pageName;

var pass = '9096373'


var counter = 2;
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
    let rawdata = fs.readFileSync('jsondata.json');
    let student = JSON.parse(rawdata);

    res.render("index", {pageName: pageName, query: student});
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
    let types = ""
    console.log(style);
    console.log(style.length);
    if (typeof style === 'string') {
        types = types + "'" + style + "'";
    } else {
        for (var i = 0; i < style.length; i++) {
            types = types + "'" + style[i] + "'";
            if (i < style.length - 1) {
                types += ",";
            }
        }
    }
    console.log(types);
    console.log(distance);
    console.log(maxRateRestaurant);
    console.log(minRateRestaurant);
    console.log(maxNightCost);
    console.log(minNightCost);
    console.log(maxRateHA);
    console.log(minRateHA);
    console.log(critical);
    minRateHA = 90
    maxNightCost = 670
    //let types=""
    let sql = "SELECT hotels.id,hotels.name,hotels.rating,hotels.low_price AS price,COUNT(restaurants.id) AS counter FROM hotels JOIN restaurants WHERE hotels.rating>" + minRateHA + " AND hotels.high_price<" + maxNightCost + " GROUP BY hotels.id ORDER BY counter DESC,hotels.rating DESC,hotels.low_price ASC;"
    let sql2 = "SELECT name,type FROM restaurants WHERE type IN(" + types + ");"
    db.query(sql, (err, results) => {
        if (err) {
            throw err
        } else {
            let data = JSON.stringify(results);
            fs.writeFileSync("jsondata.json", data)

        }
    })


    setTimeout(function () {
        res.redirect("/output");
    }, 1000);
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
    var cur = 90;

    let sql0 = "SELECT * FROM " + placeSort + " WHERE id=" + id;
    db.query(sql0, (err, results) => {
        if (err) {
            console.log("bad results")
            throw err
        } else {
            console.log("good" + results[0]['rating'])
            cur = results[0]['rating']
            console.log(cur)
            var value = ((grade - cur) / 10) + cur;
            console.log(value)
            let sql = "UPDATE " + placeSort + " SET rating = " + value + " WHERE id=" + id;
            db.query(sql, (err, results) => {
                if (err) {
                    throw err
                } else console.log("updated table")
            })
        }
    })
    var finalname = FirstName + " " + LastName
    let sql2 = "INSERT INTO " + placeSort + "_reviews (" + placeSort + "_id, guest_name,grade,comment) VALUES (" + id + ",'" + finalname + "'," + grade + ",'" + comment + "');"
    db.query(sql2, (err, results) => {
        if (err) {
            throw err
        } else console.log("inserted table")
    })

    setTimeout(function () {
        res.redirect("/thanks");
    }, 1000);
})


app.post("/delete", function (req, res) {
    var placeSort = req.body.place;
    var id = req.body.id;
    console.log(placeSort);
    console.log(id);
    let sql = "DELETE FROM " + placeSort + " WHERE id=" + id;
    db.query(sql, (err, results) => {
        if (err) {
            throw err
        } else console.log("deleted table")
    })

    setTimeout(function (){
        //must add other tabels like reviews
        res.redirect("/thanks");
    },1000);
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
