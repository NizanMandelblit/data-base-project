const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const fs = require('fs')
const mysql = require("mysql")
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}))
const port = 3001
let result = {}
fs.writeFileSync('hotelrseults.json', JSON.stringify(result))
fs.writeFileSync('airbnbrseults.json', JSON.stringify(result))


//global variables
let pageName, style, distance, maxRateRestaurant, minRateRestaurant, maxNightCost, minNightCost, maxRateHA, minRateHA,
    critical, superhost, types, kindOfRequestedPlace = "rr", selection = "ee", id, placeType, updateID, deleteID,
    updatePlace

//*** GET functions ***//

//time out page
app.get('/error1', (req, res) => {
    pageName = "error page1"
    res.render("index2", {pageName: pageName})
})

//no results for name with LIKE query
app.get('/error2', (req, res) => {
    pageName = "error page2"
    res.render("index2", {pageName: pageName})
})

//no destinations found for request
app.get('/error3', (req, res) => {
    pageName = "error page3"
    res.render("index2", {pageName: pageName})
})

// no reviews found
app.get('/error4', (req, res) => {
    pageName = "error page4"
    res.render("index2", {pageName: pageName})
})

//exit page
app.get('/bye', (req, res) => {
    pageName = "bye page"
    db.end();
    res.render("index2", {pageName: pageName})
    setTimeout(() =>
        process.exit(0), 1000)
})

//home page
app.get('/', (req, res) => {
    pageName = "home page"
    res.render("index2", {pageName: pageName})
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
                res.render("index2", {pageName: pageName, queryairbnb: airbnb})
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
                res.render("index2", {pageName: pageName, queryhotels: hotel})
            }
        })

    }
    if (hotelid == null && airbnbid == null) {
        res.render("index2", {pageName: pageName})
    }
})
//splits into 3-get information on a place, delete a place, add review.
app.get('/find', (req, res) => {
    pageName = "find page"
    selection = req.query.selection
    res.render("index2", {pageName: pageName, varselected: selection})
})
// update information
app.get('/update', (req, res) => {
    pageName = "update page"
    if (typeof (req.query.placeSort) != "undefined") {
        updatePlace = req.query.placeSort
    }
    if (typeof (req.query.placeSort) != "undefined") {
        updateID = req.query.id
    }
    res.render("index2", {pageName: pageName})
})
//delete a place, after login as admin.
app.get('/delete', (req, res) => {
    if (typeof (req.query.placeSort) != "undefined") {
        placeType = req.query.placeSort
    }
    if (typeof (req.query.id) != "undefined") {
        id = req.query.id
    }

    if (typeof (req.query.password) == "undefined") {
        pageName = "delete page0"
        res.render("index2", {pageName: pageName})
    } else {
        const password = req.query.password
        if (password.localeCompare("12345") === 0) {
            let sql = "DELETE FROM " + placeType + " WHERE id=" + id + ""
            let sql1 = "DELETE FROM " + kindOfRequestedPlace + "_reviews WHERE " + kindOfRequestedPlace + "_id=" + id + ""
            //check if restaurant to delete from connection table
            if (kindOfRequestedPlace.localeCompare("restaurants") === 0) {
                let sql2 = "DELETE FROM restaurant_inspections_connection_table WHERE restaurant_id=" + id + ""
                db.query(sql2, (err) => {
                    if (err) {
                        res.redirect("/error")
                        throw err
                    } else {
                        db.query(sql1, (err) => {
                            if (err) {
                                res.redirect("/error")
                                //throw err
                            } else {
                                db.query(sql, (err) => {
                                    if (err) {
                                        res.redirect("/error")
                                        //throw err
                                    } else {
                                        pageName = "thanks page"
                                        res.render("index2", {pageName: pageName})
                                    }
                                })
                            }
                        })
                    }
                })
                //if not restaurant
            } else {
                db.query(sql1, (err) => {
                    if (err) {
                        res.redirect("/error")
                        //throw err
                    } else {
                        db.query(sql, (err) => {
                            if (err) {
                                res.redirect("/error")
                                //throw err
                            } else {
                                pageName = "thanks page"
                                res.render("index2", {pageName: pageName})
                            }
                        })
                    }
                })
            }
            //wrong password
        } else {
            pageName = "delete page2"
            res.render("index2", {pageName: pageName})
        }
    }
})

//thanks page after submitting a form.
app.get('/thanks', (req, res) => {
    pageName = "thanks page"
    res.render("index2", {pageName: pageName})
})

app.get('/error', (req, res) => {
    pageName = "error page"
    res.render("index2", {pageName: pageName})
})
//display the requested query results.
app.get('/output', (req, res) => {
    pageName = "output page"
    let rawDataHotel = fs.readFileSync('hotelrseults.json')
    let hotel = JSON.parse(rawDataHotel)
    let rawDataAirbnb = fs.readFileSync('airbnbrseults.json')
    let airbnb = JSON.parse(rawDataAirbnb)
    res.render("index2", {pageName: pageName, queryhotels: hotel, queryairbnb: airbnb})
})
//seek information about a place.
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
                    res.render("index2", {pageName: "infoairbnb", queryairbnb: data})
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
                    res.render("index2", {pageName: "infohotel", queryhotel: data})
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
                    res.render("index2", {
                        pageName: "inforestaurants",
                        queryrestaurantsA: dataA,
                        queryrestaurantsB: dataB
                    })
                }
            })
        }
    }
})
//reveiws query reviews about a place.
app.get('/rev', (req, res) => {
    pageName = "rev page"
    const id = req.query.id
    let dataA
    let dataB
    if (typeof (req.query.sort) != "undefined") {
        kindOfRequestedPlace = req.query.sort
    }
    if (kindOfRequestedPlace === null) {
        res.redirect("/error")
    } else {
        let sql1 = ""
        if (kindOfRequestedPlace.localeCompare("airbnb") === 0) {
            sql1 = "SELECT * FROM airbnb_reviews WHERE airbnb_id=" + id + ""
            db.query(sql1, (err, results) => {
                if (err) {
                    res.redirect("/error")
                    throw err
                } else if (!results.length) {
                    res.redirect("/error4")
                } else {
                    //console.log(results)
                    let data = JSON.stringify(results)
                    fs.writeFileSync("airbnbrev.json", data)
                    let rawdata = fs.readFileSync('airbnbrev.json')
                    data = JSON.parse(rawdata)
                    res.render("index2", {pageName: "revairbnb", queryairbnb: data})
                }
            })
        } else if (kindOfRequestedPlace.localeCompare("hotels") === 0) {
            sql1 = "SELECT * FROM hotels_reviews WHERE hotels_id=" + id + ""
            db.query(sql1, (err, results) => {
                if (err) {
                    res.redirect("/error")
                    throw err
                } else if (!results.length) {
                    res.redirect("/error4")
                } else {
                    //console.log(results)
                    let data = JSON.stringify(results)
                    fs.writeFileSync("hotelrev.json", data)
                    let rawdata = fs.readFileSync('hotelrev.json')
                    data = JSON.parse(rawdata)
                    res.render("index2", {pageName: "revhotel", queryhotel: data})
                }
            })
        } else if (kindOfRequestedPlace.localeCompare("restaurants") === 0) {
            sql1 = "SELECT * FROM restaurants_reviews WHERE restaurants_id=" + id + ""
            db.query(sql1, (err, results) => {
                if (err) {
                    res.redirect("/error")
                    throw err
                } else if (!results.length) {
                    res.redirect("/error4")
                } else {
                    //console.log(results)
                    let data = JSON.stringify(results)
                    fs.writeFileSync("restaurantsrev.json", data)
                    let rawdata = fs.readFileSync('restaurantsrev.json')
                    data = JSON.parse(rawdata)
                    res.render("index2", {pageName: "revrestaurants", queryrestaurants: data})
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
    let timedOut = false
    let myTimeOut = setTimeout(() => {
            res.redirect('error1')
            timedOut = true
        }
        , 30000)
    db.query(sql1, (err, results) => {
        if (err) {
            res.redirect("/error")
            throw err
        } else if (!results.length && !timedOut) {
            empty++
        } else if (!timedOut) {
            let data = JSON.stringify(results)
            fs.writeFileSync("hotelrseults.json", data)
        }
    })

    db.query(sql2, (err, results) => {
        if (err) {
            res.redirect("/error")
            throw err
        } else if (!results.length && !timedOut) {
            empty++
        } else if (!timedOut) {
            let normRes = normalize(results)
            console.log(normRes)
            let pleasureCount = new Array(results.length)
            let weightPrice = 0.33
            let weightCount = 0.33
            let weightRating = 0.33
            for (let i = 0; i < results.length; i++) {
                pleasureCount[i] = normRes[0][i] * weightCount + normRes[1][i] * weightRating + normRes[2][i] * weightPrice
                results[i].pleasure = pleasureCount[i]
            }
            //sort results form highest to lowest pleasure
            results.sort((a, b) => (a.pleasure < b.pleasure) ? 1 : -1)

            console.log(pleasureCount)
            let data = JSON.stringify(results)
            fs.writeFileSync("airbnbrseults.json", data)
            clearTimeout(myTimeOut)
            res.redirect("/output")
        }
        //if no results were found
        if (empty === 2 && !timedOut) {
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
        } else {
            let sql1 = "DELETE FROM " + kindOfRequestedPlace + "_reviews WHERE " + kindOfRequestedPlace + "_id=" + deleteID
            console.log(sql1)
            db.query(sql1, (err) => {
                if (err) {
                    res.redirect("/error")
                    throw err
                } else {
                    res.redirect("/thanks")
                }
            })
        }
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
            res.render("index2", {pageName: pageName, query: data, varselected: selection, placeSort: placeSort})
        }
    })

})
app.listen(process.env.PORT | port, () => {
    console.log(`App started on http://localhost:${port}`)
})


//Create connection to DB
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '9096373',
    database: 'newyorktrip'
})

//Connect to MySQL
db.connect(err => {
    if (err) {
        throw err
    }
})

function normalize(results) {
    //find the min and max for price,rating and restaurant counter
    let minRating = 9999999
    let minPrice = 9999999
    let minCount = 9999999
    let maxRating = -99999999
    let maxPrice = -99999999
    let maxCount = -99999999
    let curr
    for (let i = 0; i < results.length; i++) {
        curr = results[i]
        if (curr.rating < minRating)
            minRating = curr.rating
        if (curr.rating > maxRating)
            maxRating = curr.rating
        if (curr.price < minPrice)
            minPrice = curr.price
        if (curr.price > maxPrice)
            maxPrice = curr.price
        if (curr.counter < minCount)
            minCount = curr.counter
        if (curr.counter > maxCount)
            maxCount = curr.counter
    }
    //normalize
    let normPrice = new Array(results.length)
    let normRating = new Array(results.length)
    let normCount = new Array(results.length)
    for (let i = 0; i < results.length; i++) {
        curr = results[i]
        curr.price = maxPrice - curr.price
        normPrice[i] = ((curr.price) / (maxPrice - minPrice)) * 100
        normRating[i] = ((curr.rating - minRating) / (maxRating - minRating)) * 100
        normCount[i] = ((curr.counter - minCount) / (maxCount - minCount)) * 100
    }
    return [normCount, normRating, normPrice]
}