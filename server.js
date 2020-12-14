const express = require("express")
const mysql = require("mysql")
const fast_csv = require('fast-csv')
const csv = require('csv-parser');
const fs = require('fs')
const bodyParser = require("body-parser")
const app = express()
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
const port = 3001
var pageName;


/*Import CSV Data to MySQL database
importCsvData2MySQL('C:\\Users\\yitzi\\Desktop\\סדנה במסדי נתונים\\project tables\\final\\airbnb_ny.csv');

function importCsvData2MySQL(filename) {
    let stream = fs.createReadStream(filename);
    let csvData = [];
    let csvStream = fast_csv
        .parse()
        .on("data", function (data) {
            csvData.push(data);
        })
        .on("end", function () {
            // Remove Header ROW
            csvData.shift();

            // Create a connection to the database
            const connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'matthews34',
                database: `nyculinarytrip`
            });

            // Open the MySQL connection
            connection.connect((error) => {
                if (error) {
                    console.error(error);
                } else {
                    let query = "INSERT INTO airbnb_ny VALUES ?";
                    connection.query(query, [csvData], (error, response) => {
                        //console.log(error || response);
                    });
                }
            });
        });
    stream.pipe(csvStream);
}
*/


//Create connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'matthews34',
    database: 'nyculinarytrip'
})

//Connect to MySQL
db.connect(err => {
    if (err) {
        throw err
    }
    console.log('Connected!')
})


//random query
let sql = 'SELECT * FROM restaurants WHERE Restaurant_Id = 40511702'
db.query(sql, (err,results) => {
    if (err) {
        throw err
    } else console.log(results[0]['boro'])
})
/*Create Database
app.get('/createdb', (req, res) => {
    let sql = 'CREATE DATABASE NYCulinaryTrip'
    db.query(sql, err => {
        if (err) {
            throw err
        }
        res.send('Database Created!')
    })

 */
/*
//Create Database
let sql = 'CREATE DATABASE NYCulinaryTrip'
db.query(sql, err => {
    if (err) {
        throw err
    } else console.log('NYCulinaryTrip Database Created!')
})


// Import CSV Data to MySQL database
let path = 'C:\\Users\\yitzi\\Desktop\\סדנה במסדי נתונים\\project tables\\final'
const dir = fs.opendirSync(path)
let csvFile
while ((csvFile = dir.readSync()) !== null) {
    console.log(csvFile.name)
    let csvData = []
    let first = true
    let headers
    fs.createReadStream(path + '\\' + csvFile.name)
        .pipe(csv())
        .on('data', (row) => {
            if (first) {
                //console.log(row)
                //console.log(Object.keys(row))
                headers = Object.keys(row).toString()
                first = false
            }
            csvData.push(row)
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
            console.log(csvData)
            let sqlNewTable = 'CREATE TABLE ' + csvFile.name + '(' + headers + ') VALUES ?'
            db.query(sqlNewTable, [csvData], (error, response) => {
                console.log(error || response);
            });
            dir.closeSync()
        })
}


            /*Create Database
            app.get('/createdb', (req, res) => {
                let sql = 'CREATE DATABASE NYCulinaryTrip'
                db.query(sql, err => {
                    if (err) {
                        throw err
                    }
                    res.send('Database Created!')
                })
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

