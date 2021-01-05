const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const fs = require('fs')
const mysql = require("mysql")
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}))
const port = 3001

//global variables
let pageName, style, distance, maxRateRestaurant, minRateRestaurant, maxNightCost, minNightCost, maxRateHA, minRateHA,
    critical, superhost, types, kindOfRequestedPlace = "rr", selection = "ee", id, placeType, updateID, deleteID,
    updatePlace

// GET functions

//time out page
app.get('/error1', (req, res) => {
    pageName = "error page1"
    res.render("index", {pageName: pageName})
})

//no results for name with LIKE query
app.get('/error2', (req, res) => {
    pageName = "error page2"
    res.render("index", {pageName: pageName})
})

//no destinations found for request
app.get('/error3', (req, res) => {
    pageName = "error page3"
    res.render("index", {pageName: pageName})
})

//exit page
app.get('/bye', (req, res) => {
    pageName = "bye page"
    db.end();
    res.render("index", {pageName: pageName})
})

//home page
app.get('/', (req, res) => {
    pageName = "home page"
    res.render("index", {pageName: pageName})
})

//search destination
app.get('/search', (req, res) => {
    pageName = "search page"
    const airbnbid = req.query.airbnbid
    const hotelid = req.query.hotelid
    if (airbnbid != null) {
        const output_airbnb = "SELECT restaurants.id,restaurants.name,restaurants.rating,restaurants.type,ST_Distance_Sphere(point(airbnb.latitude,airbnb.longitude),point(restaurants.latitude, restaurants.longitude))*0.001 AS distance "
        const tabels_airbnb = "FROM airbnb JOIN restaurants"
        const conditions_airbnb = " WHERE restaurants.rating BETWEEN " + minRateRestaurant + " AND " + maxRateRestaurant + " AND airbnb.id = " + airbnbid + " AND type IN(" + types + ") "
        const distance_airbnb = "AND ST_Distance_Sphere(point(airbnb.latitude,airbnb.longitude),point(restaurants.latitude, restaurants.longitude))*0.001<=" + distance + " "
        const critical_airbnb = "AND restaurants.id IN(SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE restaurant_id NOT IN (SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE violation_id IN (SELECT violation_id FROM inspections WHERE critical=1))) "
        const end_airbnb = "ORDER BY distance ASC,restaurants.rating DESC LIMIT 50"

        let sql1 = output_airbnb + tabels_airbnb + conditions_airbnb + distance_airbnb
        if (critical) {
            sql1 += critical_airbnb
        }
        sql1 += end_airbnb
        db.query(sql1, (err, results) => {
            if (err) {
                res.redirect("/error")
                throw err
            } else {
                let data = JSON.stringify(results)
                fs.writeFileSync("airbnbbyiddearch.json", data)
                pageName = "outputairbnbid"
                let rawDataAirbnb = fs.readFileSync('airbnbbyiddearch.json')
                let airbnb = JSON.parse(rawDataAirbnb)
                res.render("index", {pageName: pageName, queryairbnb: airbnb})
            }
        })
    }
    if (hotelid != null) {
        const output_hotel = "SELECT restaurants.id,restaurants.name,restaurants.rating,restaurants.type,ST_Distance_Sphere(point(hotels.latitude,hotels.longitude),point(restaurants.latitude, restaurants.longitude))*0.001 AS distance "
        const tabels_hotel = "FROM hotels JOIN restaurants"
        const conditions_hotel = " WHERE restaurants.rating BETWEEN " + minRateRestaurant + " AND " + maxRateRestaurant + " AND hotels.id = " + hotelid + " AND type IN(" + types + ") "
        const distance_hotels = "AND ST_Distance_Sphere(point(hotels.latitude,hotels.longitude),point(restaurants.latitude, restaurants.longitude))*0.001<=" + distance + " "
        const critical_hotel = "AND restaurants.id IN(SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE restaurant_id NOT IN (SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE violation_id IN (SELECT violation_id FROM inspections WHERE critical=1))) "
        const end_hotel = "ORDER BY distance ASC,restaurants.rating DESC LIMIT 50"

        let sql1 = output_hotel + tabels_hotel + conditions_hotel + distance_hotels
        if (critical) {
            sql1 += critical_hotel
        }
        sql1 += end_hotel
        db.query(sql1, (err, results) => {
            if (err) {
                res.redirect("/error")
                throw err
            } else {
                let data = JSON.stringify(results)
                fs.writeFileSync("hotelbyiddearch.json", data)
                pageName = "outputhotelid"
                let rawDataHotel = fs.readFileSync('hotelbyiddearch.json')
                let hotel = JSON.parse(rawDataHotel)
                res.render("index", {pageName: pageName, queryhotels: hotel})
            }
        })

    }
    if (hotelid == null && airbnbid == null) {
        res.render("index", {pageName: pageName})
    }
})

app.get('/find', (req, res) => {
    pageName = "find page"
    selection = req.query.selection
    res.render("index", {pageName: pageName, varselected: selection})
})

app.get('/update', (req, res) => {
    pageName = "update page"
    if (typeof (req.query.placeSort) != "undefined") {
        updatePlace = req.query.placeSort
    }
    if (typeof (req.query.placeSort) != "undefined") {
        updateID = req.query.id
    }
    res.render("index", {pageName: pageName})
})

app.get('/delete', (req, res) => {
    if (typeof (req.query.placeSort) != "undefined") {
        placeType = req.query.placeSort
    }
    if (typeof (req.query.placeSort) != "undefined") {
        id = req.query.id
    }

    if (typeof (req.query.password) == "undefined") {
        pageName = "delete page0"
    } else {
        const password = req.query.password
        if (password.localeCompare("12345") === 0) {
            let sql = "DELETE FROM " + placeType + " WHERE id=" + id + ""
            db.query(sql, (err) => {
                if (err) {
                    res.redirect("/error")
                    throw err
                }
            })
            pageName = "thanks page"
        } else {
            pageName = "delete page2"
        }
    }
    res.render("index", {pageName: pageName})
})

app.get('/thanks', (req, res) => {
    pageName = "thanks page"
    res.render("index", {pageName: pageName})
})

app.get('/error', (req, res) => {
    pageName = "error page"
    res.render("index", {pageName: pageName})
})

app.get('/output', (req, res) => {
    pageName = "output page"
    let rawDataHotel = fs.readFileSync('hotelrseults.json')
    let hotel = JSON.parse(rawDataHotel)
    let rawDataAirbnb = fs.readFileSync('airbnbrseults.json')
    let airbnb = JSON.parse(rawDataAirbnb)
    res.render("index", {pageName: pageName, queryhotels: hotel, queryairbnb: airbnb})
})

app.get('/info', (req, res) => {
    pageName = "output page"
    const id = req.query.id
    let dataA
    let dataB
    if (typeof (req.query.sort) != "undefined") {
        kindOfRequestedPlace = req.query.sort
    }
    if (kindOfRequestedPlace === null) {
        res.redirect("/error")
    } else {
        let sql = ""
        if (kindOfRequestedPlace.localeCompare("airbnb") === 0) {
            sql = "SELECT * FROM airbnb JOIN airbnb_hosts ON (airbnb.host_id=airbnb_hosts.host_id) WHERE id=" + id + ""
            db.query(sql, (err, results) => {
                if (err) {
                    res.redirect("/error")
                    throw err
                } else {
                    let data = JSON.stringify(results)
                    fs.writeFileSync("airbnbinfo.json", data)
                    let rawdata = fs.readFileSync('airbnbinfo.json')
                    data = JSON.parse(rawdata)
                    res.render("index", {pageName: "infoairbnb", queryairbnb: data})
                }
            })
        } else if (kindOfRequestedPlace.localeCompare("hotels") === 0) {
            sql = "SELECT * FROM hotels WHERE id=" + id + ""
            db.query(sql, (err, results) => {
                if (err) {
                    res.redirect("/error")
                    throw err
                } else {
                    let data = JSON.stringify(results)
                    fs.writeFileSync("hotelinfo.json", data)
                    let rawdata = fs.readFileSync('hotelinfo.json')
                    data = JSON.parse(rawdata)
                    res.render("index", {pageName: "infohotel", queryhotel: data})
                }
            })
        } else if (kindOfRequestedPlace.localeCompare("restaurants") === 0) {
            sql = "SELECT * FROM restaurants WHERE id=" + id + ""
            db.query(sql, (err, results) => {
                if (err) {
                    res.redirect("/error")
                    throw err
                } else {
                    let data = JSON.stringify(results)
                    fs.writeFileSync("restaurantsinfoA.json", data)
                    let rawdataA = fs.readFileSync('restaurantsinfoA.json')
                    dataA = JSON.parse(rawdataA)
                }
            })
            let sql2 = "SELECT * FROM restaurant_inspections_connection_table JOIN inspections ON (restaurant_inspections_connection_table.violation_id=inspections.violation_id) WHERE restaurant_id=" + id + ""
            db.query(sql2, (err, results) => {
                if (err) {
                    res.redirect("/error")
                    throw err
                } else {
                    let data = JSON.stringify(results)
                    fs.writeFileSync("restaurantsinfoB.json", data)
                    let rawdataB = fs.readFileSync('restaurantsinfoB.json')
                    dataB = JSON.parse(rawdataB)
                    res.render("index", {
                        pageName: "inforestaurants",
                        queryrestaurantsA: dataA,
                        queryrestaurantsB: dataB
                    })
                }
            })
        }
    }
})

//POST functions
app.post("/search", function (req, res) {
    style = req.body.style
    distance = req.body.distance
    maxRateRestaurant = req.body.maxRateRestaurant
    minRateRestaurant = req.body.minRateRestaurant
    maxNightCost = req.body.maxNightCost
    minNightCost = req.body.minNightCost
    maxRateHA = req.body.maxRateHA
    minRateHA = req.body.minRateHA
    critical = req.body.critical
    superhost = req.body.super
    types = ""
    if (typeof style === 'string') {
        types = types + "'" + style + "'"
    } else {
        for (let i = 0; i < style.length; i++) {
            types = types + "'" + style[i] + "'"
            if (i < style.length - 1) {
                types += ","
            }
        }
    }

    const output_hotel = "SELECT hotels.id,hotels.name,hotels.rating,hotels.low_price AS price,COUNT(restaurants.id) AS counter "
    const tabels_hotel = "FROM hotels JOIN restaurants"
    const conditions_hotel = " WHERE restaurants.rating BETWEEN " + minRateRestaurant + " AND " + maxRateRestaurant + " AND hotels.rating BETWEEN " + minRateHA + " AND " + maxRateHA + " AND hotels.low_price BETWEEN " + minNightCost + " AND " + maxNightCost + " AND type IN(" + types + ") "
    const distance_hotels = "AND ST_Distance_Sphere(point(hotels.latitude,hotels.longitude),point(restaurants.latitude, restaurants.longitude))*0.001<=" + distance + " "
    const critical_hotel = "AND restaurants.id IN(SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE restaurant_id NOT IN (SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE violation_id IN (SELECT violation_id FROM inspections WHERE critical=1))) "
    const end_hotel = "GROUP BY hotels.id ORDER BY counter DESC,hotels.rating DESC,hotels.low_price ASC LIMIT 500"

    let sql1 = output_hotel + tabels_hotel + conditions_hotel + distance_hotels
    if (critical) {
        sql1 += critical_hotel
    }
    sql1 += end_hotel
    const output_airbnb = "SELECT airbnb.id,airbnb.name,airbnb.rating,airbnb.price AS price,COUNT(restaurants.id) AS counter"
    const tables_airbnb = "FROM airbnb JOIN restaurants"
    const conditions_airbnb = "WHERE restaurants.rating BETWEEN " + minRateRestaurant + " AND " + maxRateRestaurant + " AND airbnb.rating BETWEEN " + minRateHA + " AND " + maxRateHA + " AND airbnb.price BETWEEN " + minNightCost + " AND " + maxNightCost + " AND type IN(" + types + ")"
    const distance_airbnb = " AND ST_Distance_Sphere(point(airbnb.latitude,airbnb.longitude),point(restaurants.latitude, restaurants.longitude))*0.001<=" + distance
    const critical_airbnb = "AND restaurants.id IN(SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE restaurant_id NOT IN (SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE violation_id IN (SELECT violation_id FROM inspections WHERE critical=1)))"
    const superhost_airbnb = "AND airbnb.id IN(SELECT id FROM airbnb WHERE host_id IN (SELECT DISTINCT host_id FROM airbnb_hosts WHERE superhost=1))"
    const end_airbnb = " GROUP BY airbnb.id ORDER BY counter DESC,airbnb.rating DESC,airbnb.price ASC LIMIT 50"

    let sql2 = output_airbnb + " " + tables_airbnb + " " + conditions_airbnb + distance_airbnb
    if (critical) {
        sql2 += " " + critical_airbnb
    }
    if (superhost) {
        sql2 += " " + superhost_airbnb
    }

    sql2 += end_airbnb
    let empty = 0
    let myTimeOut = setTimeout(() =>
            res.redirect('error1')
        , 30000)
    db.query(sql1, (err, results) => {
        if (err) {
            res.redirect("/error")
            throw err
        } else if (!results.length) {
            empty++
        } else {
            let data = JSON.stringify(results)
            fs.writeFileSync("hotelrseults.json", data)
        }
    })

    db.query(sql2, (err, results) => {
        if (err) {
            res.redirect("/error")
            throw err
        } else if (!results.length) {
            empty++
        } else {
            let data = JSON.stringify(results)
            fs.writeFileSync("airbnbrseults.json", data)
            clearTimeout(myTimeOut)
            res.redirect("/output")
        }
        //if no results were found
        if (empty === 2) {
            clearTimeout(myTimeOut)
            res.redirect('/error3')
        }
    })
})

//update place
app.post("/update", function (req, res) {
    const id = updateID
    const placeSort = updatePlace
    const FirstName = req.body.FirstName
    const LastName = req.body.LastName
    const grade = req.body.grade
    const comment = req.body.comment
    let cur = 90

    let sql0 = "SELECT * FROM " + placeSort + " WHERE id=" + id

    db.query(sql0, (err, results) => {
        if (err) {
            res.redirect("/error")
            throw err
        } else {
            cur = results[0]['rating']
            const value = ((grade - cur) / 10) + cur;
            const sql = "UPDATE " + placeSort + " SET rating = " + value + " WHERE id=" + id
            db.query(sql, (err) => {
                if (err) {
                    res.redirect("/error")
                    throw err
                }
            })
        }
    })

    const fullName = FirstName + " " + LastName;
    let sql2 = "INSERT INTO " + placeSort + "_reviews (" + placeSort + "_id, guest_name,grade,comment) VALUES (" + id + ",'" + fullName + "'," + grade + ",'" + comment + "')"
    db.query(sql2, (err) => {
        if (err) {
            res.redirect("/error")
            throw err
        } else res.redirect("/thanks")
    })

})

//delete place from DB
app.post("/delete", function (req, res) {
    let sql = "DELETE FROM " + kindOfRequestedPlace + " WHERE id=" + deleteID
    db.query(sql, (err) => {
        if (err) {
            res.redirect("/error")
            throw err
        } else res.redirect("/thanks")
    })
})

//find place in order to update,view info or delete
app.post("/find", function (req, res) {
    pageName = ''
    const selection = req.query.selection
    const placeSort = req.body.place
    kindOfRequestedPlace = placeSort
    const placeName = req.body.placename
    let sql11 = "SELECT id,name FROM " + placeSort + " WHERE name LIKE '%" + placeName + "%'"
    db.query(sql11, (err, results) => {
        if (err) {
            res.redirect("/error")
            throw err
        } else if (!results.length) {
            res.redirect('/error2')
        } else {
            pageName = 'findoutput'
            let data = JSON.stringify(results)
            fs.writeFileSync("findoutput.json", data)
            let rawdata = fs.readFileSync('findoutput.json')
            data = JSON.parse(rawdata)
            res.render("index", {pageName: pageName, query: data, varselected: selection, placeSort: placeSort})
        }
    })

})
app.listen(process.env.PORT | port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})


//Create connection to DB
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '123456',
    database: 'ny_db'
})

//Connect to MySQL
db.connect(err => {
    if (err) {
        throw err
    }
    console.log('Connected to DB')
})
