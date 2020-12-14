const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const fs=require('fs')
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
    let rawdata = fs.readFileSync('jsondata.json');
    let student = JSON.parse(rawdata);

    res.render("index", {pageName: pageName,query:student});
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
    var superhost = req.body.super;
    if(superhost){
        console.log("!!!!!!!!!!!!1")
    }
    let types=""
    console.log(style);
    console.log(style.length);
    if (typeof style === 'string')
    {
        types=types+"'"+style+"'";
    }else{
        for (var i=0;i<style.length;i++){
            types=types+"'"+style[i]+"'";
            if(i<style.length-1){
                types+=",";
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

    maxRateRestaurant=100;
    minRateRestaurant=20;
    minRateHA=60
    maxRateHA=70
    maxNightCost=200
    minNightCost=50
    //var distance_hotels= "(hotels.latitude-restaurants.latitude)+(hotels.longitude-restaurants.longitude)"
    var output_hotel="SELECT hotels.id,hotels.name,hotels.rating,hotels.low_price AS price,COUNT(restaurants.id) AS counter "
    var tabels_hotel="FROM hotels JOIN restaurants"
    var conditions_hotel=" WHERE restaurants.rating BETWEEN "+minRateRestaurant+" AND "+maxRateRestaurant+" AND hotels.rating BETWEEN "+minRateHA+" AND "+maxRateHA+" AND hotels.low_price BETWEEN "+minNightCost+" AND "+maxNightCost+" AND type IN("+types+") "
    var critical_hotel="AND restaurants.id IN(SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE restaurant_id NOT IN (SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE violation_id IN (SELECT violation_id FROM inspections WHERE critical=1))) "
    //maxNightCost<=max_price AND minNightCost>=min_price AND rating BETWEEN minRateHA AND maxRateHA
    var end_hotel="GROUP BY hotels.id ORDER BY counter DESC,hotels.rating DESC,hotels.low_price ASC;"

    let sql1=output_hotel+tabels_hotel+conditions_hotel;
    if(critical){
        sql1+=critical_hotel;
    }
    sql1+=end_hotel;
    var output_airbnb="SELECT airbnb.id,airbnb.name,airbnb.rating,airbnb.price AS price,COUNT(restaurants.id) AS counter"
    var tabels_airbnb="FROM airbnb JOIN restaurants"
    var conditions_airbnb="WHERE restaurants.rating BETWEEN "+minRateRestaurant+" AND "+maxRateRestaurant+" AND airbnb.rating BETWEEN "+minRateHA+" AND "+maxRateHA+" AND airbnb.price BETWEEN "+minNightCost+" AND "+maxNightCost+" AND type IN("+types+")"
    var critical_airbnb="AND restaurants.id IN(SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE restaurant_id NOT IN (SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE violation_id IN (SELECT violation_id FROM inspections WHERE critical=1)))"
    var superhost_airbnb="AND airbnb.id IN(SELECT id FROM airbnb WHERE host_id IN (SELECT DISTINCT host_id FROM airbnb_hosts WHERE superhost=1))"
    var end_airbnb=" GROUP BY airbnb.id ORDER BY counter DESC,airbnb.rating DESC,airbnb.price ASC;"

    let sql2=output_airbnb+" "+tabels_airbnb+" "+conditions_airbnb;
    if(critical){
        sql2+=" "+critical_airbnb;
    }
    if(superhost){
        sql2+=" "+superhost_airbnb;
    }
    sql2+=" "+end_airbnb;
    //let sql=output_hotel+tabels_hotel+conditions_hotel+end_hotel;
    console.log(sql2);
    db.query(sql2, (err, results) => {
         if (err) {
             throw err
         } else {
             console.log(results);
             let data = JSON.stringify(results);
             fs.writeFileSync("jsondata.json", data)
         }
     })
    /*
    console.log(sql);
    db.query(sql, (err, results) => {
        if (err) {
            throw err
        } else {
            console.log(results);
            let data = JSON.stringify(results);
            fs.writeFileSync("jsondata.json", data)
        }
    })*/



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
        } else console.log("deleted table")
    })
    //must add other tabels like reviews
    res.redirect("/thanks");
})





app.listen(process.env.PORT | port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
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
