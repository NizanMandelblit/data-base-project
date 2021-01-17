const mysql = require("mysql")


//Create connection to DB
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'matthews34',
    database: 'nytrip'
})

//Connect to MySQL
db.connect(err => {
    if (err) {
        throw err
    }
    console.log('connected to db')
})

let maxRateRestaurant = 90
let minRateRestaurant = 80
let maxNightCost = 130
let minNightCost = 100
let types = "'Donuts','Jewish/Kosher','Sandwiches'"
let distance = 5
let maxRateAirBNB = 90
let minRateAirBNB = 80
let critical = false
let superhost = false

const output_airbnb = "SELECT airbnb.id,airbnb.name,airbnb.rating,airbnb.price AS price,COUNT(restaurants.id) AS counter"
const tables_airbnb = "FROM airbnb JOIN restaurants"
const conditions_airbnb = "WHERE restaurants.rating BETWEEN " + minRateRestaurant + " AND " + maxRateRestaurant + " AND airbnb.rating BETWEEN " + minRateAirBNB + " AND " + maxRateAirBNB + " AND airbnb.price BETWEEN " + minNightCost + " AND " + maxNightCost + " AND type IN(" + types + ")"
const distance_airbnb = " AND ST_Distance_Sphere(point(airbnb.latitude,airbnb.longitude),point(restaurants.latitude, restaurants.longitude))*0.001<=" + distance
const critical_airbnb = "AND restaurants.id IN(SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE restaurant_id NOT IN (SELECT DISTINCT restaurant_id FROM restaurant_inspections_connection_table WHERE violation_id IN (SELECT violation_id FROM inspections WHERE critical=1)))"
const superhost_airbnb = "AND airbnb.id IN(SELECT id FROM airbnb WHERE host_id IN (SELECT DISTINCT host_id FROM airbnb_hosts WHERE superhost=1))"
const end_airbnb = " GROUP BY airbnb.id ORDER BY counter DESC,airbnb.rating DESC,airbnb.price ASC LIMIT 50"

let sql = output_airbnb + " " + tables_airbnb + " " + conditions_airbnb + distance_airbnb

if (critical)
    sql += " " + critical_airbnb

if (superhost)
    sql += " " + superhost_airbnb

sql += end_airbnb

db.query(sql, (err, results) => {
    //if query fails
    if (err) {
        throw err
    //if no results found
    } else if (!results.length) {
        console.log('no results')
    // if results found
    } else {
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
        //console.log(pleasureCount)
        //sort results form highest to lowest pleasure
        results.sort((a, b) => (a.pleasure < b.pleasure) ? 1 : -1)

        console.log(results)
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
