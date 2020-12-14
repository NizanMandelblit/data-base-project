const express = require("express")
const bodyParser = require("body-parser")
const app = express()
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
const port = 3001
var pageName;

const mysql = require("mysql")
//Create connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '54321',
    database: 'new_york_db'
})

//Connect to MySQL
db.connect(err => {
    if (err) {
        throw err
    }
    console.log('Connected!')
})


//random query
/*
let sql = 'SELECT * FROM restaurants WHERE Restaurant_Id = 40511702'
db.query(sql, (err,results) => {
    if (err) {
        throw err
    } else console.log(results[0]['boro'])
})
*/
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


    // let sql="SELECT hotels.id ,hotels.name ,hotels.rating COUNT(DISTINCT restaurants.id) AS counter FROM hotels LEFT JOIN restaurants ON (type="+style+") GROUP BY hotels.id"
    // db.query(sql, (err, results) => {
    //     if (err) {
    //         throw err
    //     } else console.log(results)
    // })



    res.redirect("/output");
})

app.post("/update", function (req, res) {
    var id = req.body.id;
    var placeSort=req.body.place;
    var FirstName=req.body.FirstName;
    var LastName=req.body.LastName;
    var grade=req.body.grade;
    var comment=req.body.comment;
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
    res.redirect("/thanks");
})





app.post("/delete", function (req, res) {
    var placeSort=req.body.place;
    var id = req.body.id;
    console.log(placeSort);
    console.log(id);
    let sql = "DELETE FROM " + placeSort + " WHERE id=" + id;
    db.query(sql, (err, results) => {
        if (err) {
            throw err
        } else console.log("deleted table1")
    })
    let sql1 = "DELETE FROM " + placeSort +"_reviews WHERE id=" + id;
    db.query(sql1, (err, results) => {
        if (err) {
            throw err
        } else console.log("deleted table2")
    })
    if (placeSort.localeCompare("restaurants")===0){
        let sql2 = "DELETE FROM restaurant_inspections_connection_table WHERE resaurant_id=" + id;
        db.query(sql2, (err, results) => {
            if (err) {
                throw err
            } else console.log("deleted table2")
        })
    }
    //must add other tabels like reviews
    res.redirect("/thanks");
})





app.listen(process.env.PORT | port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

