const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const fs = require('fs')
const mysql = require("mysql")
const res = require("express");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
const port = 3001
let pageName, style, distance, maxRateRestaurant, minRateRestaurant, maxNightCost, minNightCost, maxRateHA, minRateHA,
    critical, superhost, types, kindOfRequestedPlace = "rr", selection = "ee", idd;
var ff, gg, upid, upps;

// GET functions
app.get('/error3', (req, res) => {
    pageName = "error page3";
    res.render("index", {pageName: pageName});
})

app.get('/error2', (req, res) => {
    pageName = "error page2";
    res.render("index", {pageName: pageName});
})

app.get('/', (req, res) => {
    pageName = "home page";

    res.render("index", {pageName: pageName});
})

app.get('/search', (req, res) => {
    pageName = "search page";
    const airbnbid = req.query.airbnbid;
    const hotelid = req.query.hotelid;
    let empty = 0
    //
    if (airbnbid != null) {
        var output_airbnb = "SELECT restaurants.id,restaurants.name,restaurants.rating,restaurants.type,ST_Distance_Sphere(point(airbnb.latitude,airbnb.longitude),point(restaurants.latitude, restaurants.longitude))*0.001 AS distance "
        var tabels_airbnb = "FROM airbnb JOIN restaurants"
        var conditions_airbnb = " WHERE restaurants.rating BETWEEN " + minRateRestaurant + " AND " + maxRateRestaurant + " AND airbnb.id = " + airbnbid + " AND type IN(" + types + ") "
        var distance_airbnb = "AND ST_Distance_Sphere(point(airbnb.latitude,airbnb.longitude),point(restaurants.latitude, restaurants.longitude))*0.001<=" + distance + " "
        var critical_airbnb = "AND restaurants.id IN(SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE restaurant_id NOT IN (SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE violation_id IN (SELECT violation_id FROM inspections WHERE critical=1))) "
        //maxNightCost<=max_price AND minNightCost>=min_price AND rating BETWEEN minRateHA AND maxRateHA
        var end_airbnb = "ORDER BY distance ASC,restaurants.rating DESC LIMIT 50;"

        let sql1 = output_airbnb + tabels_airbnb + conditions_airbnb + distance_airbnb;
        if (critical) {
            sql1 += critical_airbnb;
        }
        sql1 += end_airbnb;
        db.query(sql1, (err, results) => {
            if (err) {
                res.redirect("/error");
                throw err
            } else if (results.empty()) {
                console.log('no airbnb found')
                empty++
            } else {
                console.log("restaurants by airbnb results:")
                console.log(results[0])
                let data = JSON.stringify(results);
                fs.writeFileSync("airbnbbyiddearch.json", data)
            }
        })
    }
    if (hotelid != null) {
        var output_hotel = "SELECT restaurants.id,restaurants.name,restaurants.rating,restaurants.type,ST_Distance_Sphere(point(hotels.latitude,hotels.longitude),point(restaurants.latitude, restaurants.longitude))*0.001 AS distance "
        var tabels_hotel = "FROM hotels JOIN restaurants"
        var conditions_hotel = " WHERE restaurants.rating BETWEEN " + minRateRestaurant + " AND " + maxRateRestaurant + " AND hotels.id = " + hotelid + " AND type IN(" + types + ") "
        var distance_hotels = "AND ST_Distance_Sphere(point(hotels.latitude,hotels.longitude),point(restaurants.latitude, restaurants.longitude))*0.001<=" + distance + " "
        var critical_hotel = "AND restaurants.id IN(SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE restaurant_id NOT IN (SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE violation_id IN (SELECT violation_id FROM inspections WHERE critical=1))) "
        //maxNightCost<=max_price AND minNightCost>=min_price AND rating BETWEEN minRateHA AND maxRateHA
        var end_hotel = "ORDER BY distance ASC,restaurants.rating DESC LIMIT 50;"

        let sql1 = output_hotel + tabels_hotel + conditions_hotel + distance_hotels;
        if (critical) {
            sql1 += critical_hotel;
        }
        sql1 += end_hotel;
        db.query(sql1, (err, results) => {
            if (err) {
                res.redirect("/error");
                throw err
            } else if (results.empty()) {
                console.log('no hotels found')
                empty++
            } else {
                console.log("restaurants by hotel results:")
                console.log(results[0])
                let data = JSON.stringify(results);
                fs.writeFileSync("hotelbyiddearch.json", data)
            }
        })
    }


    if (hotelid == null && airbnbid == null) {
        res.render("index", {pageName: pageName});
    } else {
        if (hotelid) {
            pageName = "outputhotelid"
            let rawdatahotel = fs.readFileSync('hotelbyiddearch.json');
            let hotel = JSON.parse(rawdatahotel);
            res.render("index", {pageName: pageName, queryhotels: hotel});
        } else {
            pageName = "outputairbnbid"
            let rawdataairbnb = fs.readFileSync('airbnbbyiddearch.json');
            let airbnb = JSON.parse(rawdataairbnb);
            res.render("index", {pageName: pageName, queryairbnb: airbnb});
        }
    }
})


app.get('/find', (req, res) => {
    pageName = "find page";
    selection = req.query.selection;
    /*
    const id = req.query.id;
    var placesort = "airbnb";
    if (placesort === "restaurants") {
        let sql = "SELECT * FROM " + placeSort + " WHERE id=" + id;
        db.query(sql, (err, results) => {
            if (err) {
                res.redirect("/error");
                throw err
            } else res.redirect("/thanks");
        })
    }
    //pageName="thanks page"

     */
    res.render("index", {pageName: pageName, varselected: selection});
})

app.get('/update', (req, res) => {
    pageName = "update page";
    if (typeof (req.query.placeSort) != "undefined") {
        upps = req.query.placeSort;
    }
    if (typeof (req.query.placeSort) != "undefined") {
        upid = req.query.id;
    }
    res.render("index", {pageName: pageName});
})

app.get('/delete', (req, res) => {
    if (typeof (req.query.placeSort) != "undefined") {
        gg = req.query.placeSort;
    }
    if (typeof (req.query.placeSort) != "undefined") {
        ff = req.query.id;
    }

    if (typeof (req.query.password) == "undefined") {
        pageName = "delete page0";
    } else {
        const password = req.query.password;
        if (password.localeCompare("12345") === 0) {
            var id = ff;
            var placeSort = gg;
            //console.log(placeSort);
            let sql = "DELETE FROM " + placeSort + " WHERE id=" + id + ";";
            db.query(sql, (err, results) => {
                if (err) {
                    res.redirect("/error");
                    throw err
                }
            })
            //console.log(sql);
            pageName = "thanks page";
        } else {
            pageName = "delete page2";
        }
    }


    res.render("index", {pageName: pageName});
})

app.get('/thanks', (req, res) => {
    pageName = "thanks page";

    res.render("index", {pageName: pageName});
})

app.get('/error', (req, res) => {
    pageName = "error page";

    res.render("index", {pageName: pageName});
})
app.get('/output', (req, res) => {
    pageName = "output page";

    let rawdatahotel = fs.readFileSync('hotelrseults.json');
    let hotel = JSON.parse(rawdatahotel);
    let rawdataairbnb = fs.readFileSync('airbnbrseults.json');
    let airbnb = JSON.parse(rawdataairbnb);
    res.render("index", {pageName: pageName, queryhotels: hotel, queryairbnb: airbnb});

})
app.get('/info', (req, res) => {

    pageName = "output page";
    const id = req.query.id;
    if (typeof (req.query.sort) != "undefined") {
        kindOfRequestedPlace = req.query.sort;
    }
    if (kindOfRequestedPlace === null) {
        res.redirect("/error");
    } else {
        let sql = "";
        if (kindOfRequestedPlace.localeCompare("airbnb") === 0) {
            sql = "SELECT * FROM airbnb JOIN airbnb_hosts ON (airbnb.host_id=airbnb_hosts.host_id) WHERE id=" + id + ";";
            db.query(sql, (err, results) => {
                if (err) {
                    res.redirect("/error");
                    throw err
                } else {
                    console.log(results)//information for a certain place
                    //let data = JSON.stringify(results);
                    //fs.writeFileSync("hotelrseults.json", data)

                }
            })
        } else if (kindOfRequestedPlace.localeCompare("hotels") === 0) {
            sql = "SELECT * FROM hotels WHERE id=" + id + ";";
            db.query(sql, (err, results) => {
                if (err) {
                    res.redirect("/error");
                    throw err
                } else {
                    console.log(results)//information for a certain place
                    let data = JSON.stringify(results);
                    fs.writeFileSync("hotelinfo.json", data)
                    let rawdata = fs.readFileSync('hotelinfo.json');
                    data = JSON.parse(rawdata);
                    res.render("index", {pageName: "infohotel", queryhotel: data});
                }
            })
        } else if (kindOfRequestedPlace.localeCompare("restaurants") === 0) {
            sql = "SELECT * FROM restaurants WHERE id=" + id + ";";
            db.query(sql, (err, results) => {
                if (err) {
                    res.redirect("/error");
                    throw err
                } else {
                    console.log(results)//information for a certain place
                    let data = JSON.stringify(results);
                    fs.writeFileSync("restaurantsinfoA.json", data)
                    let rawdataA = fs.readFileSync('restaurantsinfoA.json');
                   dataA = JSON.parse(rawdataA);
                }
            })
            let sql2 = "SELECT * FROM restaurant_inspections_connection_table JOIN inspections ON (restaurant_inspections_connection_table.violation_id=inspections.violation_id) WHERE restaurant_id=" + id + ";";
            db.query(sql2, (err, results) => {
                if (err) {
                    res.redirect("/error");
                    throw err
                } else {
                    console.log(results)//list of inspections
                    let data = JSON.stringify(results);
                    fs.writeFileSync("restaurantsinfoB.json", data)
                    let rawdataB = fs.readFileSync('restaurantsinfoB.json');
                    dataB = JSON.parse(rawdataB);
                    res.render("index", {pageName: "inforestaurants", queryrestaurantsA: dataA, queryrestaurantsB: dataB});
                }
            })
        }


    }
    //kindOfRequestedPlace=null;
    //res.redirect("/thanks");

})

//POST functions
app.post("/search", function (req, res) {
    style = req.body.style;
    distance = req.body.distance;
    maxRateRestaurant = req.body.maxRateRestaurant;
    minRateRestaurant = req.body.minRateRestaurant;
    maxNightCost = req.body.maxNightCost;
    minNightCost = req.body.minNightCost;
    maxRateHA = req.body.maxRateHA;
    minRateHA = req.body.minRateHA;
    critical = req.body.critical;
    superhost = req.body.super;
    types = ""
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

    //var distance_hotels= "(hotels.latitude-restaurants.latitude)+(hotels.longitude-restaurants.longitude)"
    var output_hotel = "SELECT hotels.id,hotels.name,hotels.rating,hotels.low_price AS price,COUNT(restaurants.id) AS counter "
    var tabels_hotel = "FROM hotels JOIN restaurants"
    var conditions_hotel = " WHERE restaurants.rating BETWEEN " + minRateRestaurant + " AND " + maxRateRestaurant + " AND hotels.rating BETWEEN " + minRateHA + " AND " + maxRateHA + " AND hotels.low_price BETWEEN " + minNightCost + " AND " + maxNightCost + " AND type IN(" + types + ") "
    var distance_hotels = "AND ST_Distance_Sphere(point(hotels.latitude,hotels.longitude),point(restaurants.latitude, restaurants.longitude))*0.001<=" + distance + " "
    var critical_hotel = "AND restaurants.id IN(SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE restaurant_id NOT IN (SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE violation_id IN (SELECT violation_id FROM inspections WHERE critical=1))) "
    //maxNightCost<=max_price AND minNightCost>=min_price AND rating BETWEEN minRateHA AND maxRateHA
    var end_hotel = "GROUP BY hotels.id ORDER BY counter DESC,hotels.rating DESC,hotels.low_price ASC LIMIT 500;"

    let sql1 = output_hotel + tabels_hotel + conditions_hotel + distance_hotels;
    if (critical) {
        sql1 += critical_hotel;
    }
    sql1 += end_hotel;
    var output_airbnb = "SELECT airbnb.id,airbnb.name,airbnb.rating,airbnb.price AS price,COUNT(restaurants.id) AS counter"
    var tabels_airbnb = "FROM airbnb JOIN restaurants"
    var conditions_airbnb = "WHERE restaurants.rating BETWEEN " + minRateRestaurant + " AND " + maxRateRestaurant + " AND airbnb.rating BETWEEN " + minRateHA + " AND " + maxRateHA + " AND airbnb.price BETWEEN " + minNightCost + " AND " + maxNightCost + " AND type IN(" + types + ")"
    var distance_airbnb = " AND ST_Distance_Sphere(point(airbnb.latitude,airbnb.longitude),point(restaurants.latitude, restaurants.longitude))*0.001<=" + distance
    var critical_airbnb = "AND restaurants.id IN(SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE restaurant_id NOT IN (SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE violation_id IN (SELECT violation_id FROM inspections WHERE critical=1)))"
    var superhost_airbnb = "AND airbnb.id IN(SELECT id FROM airbnb WHERE host_id IN (SELECT DISTINCT host_id FROM airbnb_hosts WHERE superhost=1))"
    var end_airbnb = " GROUP BY airbnb.id ORDER BY counter DESC,airbnb.rating DESC,airbnb.price ASC LIMIT 50;"

    let sql2 = output_airbnb + " " + tabels_airbnb + " " + conditions_airbnb + distance_airbnb;
    if (critical) {
        sql2 += " " + critical_airbnb;
    }
    if (superhost) {
        sql2 += " " + superhost_airbnb;
    }
    //console.log(sql1);
    sql2 += end_airbnb;
    //console.log(sql2);
    //let sql=output_hotel+tabels_hotel+conditions_hotel+end_hotel; hotel results
    let empty = 0
    db.query(sql1, (err, results) => {
        if (err) {
            res.redirect("/error");
            throw err
        } else if (!results.length) {
            console.log('no hotels found')
            empty++
        } else {
            console.log("hotel results:")
            console.log(results[0])
            let data = JSON.stringify(results);
            fs.writeFileSync("hotelrseults.json", data)
        }
    })

    console.log(sql2);
    db.query(sql2, (err, results) => {
        if (err) {
            res.redirect("/error");
            throw err
        } else if (!results.length) {
            console.log('no airbnbs found')
            empty++
        } else {
            console.log("airbnb results:")
            console.log(results[0])
            let data = JSON.stringify(results);
            fs.writeFileSync("airbnbrseults.json", data)
            res.redirect("/output");
        }
        if (empty === 2) {
            console.log("no results found")
            res.redirect('/error3')
        }
    })
})


app.post("/update", function (req, res) {
    var id = upid;
    var placeSort = upps;
    var FirstName = req.body.FirstName;
    var LastName = req.body.LastName;
    var grade = req.body.grade;
    var comment = req.body.comment;

    var cur = 90;

    let sql0 = "SELECT * FROM " + placeSort + " WHERE id=" + id;

    db.query(sql0, (err, results) => {
        if (err) {
            res.redirect("/error3");
            throw err
        } else {
            //console.log("good" + results[0])
            cur = results[0]['rating']
            //console.log(cur)
            var value = ((grade - cur) / 10) + cur;
            //console.log(value)
            let sql = "UPDATE " + placeSort + " SET rating = " + value + " WHERE id=" + id;
            db.query(sql, (err, results) => {
                if (err) {
                    res.redirect("/error");
                    throw err
                }
            })
        }
    })


    var finalname = FirstName + " " + LastName;
    let sql2 = "INSERT INTO " + placeSort + "_reviews (" + placeSort + "_id, guest_name,grade,comment) VALUES (" + id + ",'" + finalname + "'," + grade + ",'" + comment + "');"
    db.query(sql2, (err, results) => {
        if (err) {
            res.redirect("/error");
            throw err
        } else res.redirect("/thanks");
    })

})


app.post("/delete", function (req, res) {
    var placeSort = kindOfRequestedPlace;
    var id = idd;
    //console.log(placeSort);
    let sql = "DELETE FROM " + placeSort + " WHERE id=" + id;
    db.query(sql, (err, results) => {
        if (err) {
            res.redirect("/error");
            throw err
        } else res.redirect("/thanks");
    })
})
app.post("/find", function (req, res) {
    pageName = '';
    var selection = req.query.selection;
    var placeSort = req.body.place;
    kindOfRequestedPlace = placeSort;
    var placeName = req.body.placename;
    //console.log(placeSort);
    let sql11 = "SELECT id,name FROM " + placeSort + " WHERE name LIKE '%" + placeName + "%'";
    db.query(sql11, (err, results) => {
        if (err) {
            res.redirect("/error");
            throw err
        } else if (!results.length) {
            console.log('no matches found')
            res.redirect('/error2')
        } else {
            pageName = 'findoutput';
            let data = JSON.stringify(results);
            fs.writeFileSync("findoutput.json", data)
            let rawdata = fs.readFileSync('findoutput.json');
            data = JSON.parse(rawdata);
            //console.log(results);
            res.render("index", {pageName: pageName, query: data, varselected: selection, placeSort: placeSort});
        }
    })

})
app.listen(process.env.PORT | port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
//Create connection

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '123456', //nizan: at my perosnal pc its 123456, Eldad:
    database: 'ny_db'
})


//Connect to MySQL
db.connect(err => {
    if (err) {
        res.redirect("/error");
        throw err
    }
    console.log('Connected!')
})



