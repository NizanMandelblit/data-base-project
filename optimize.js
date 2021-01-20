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
let distance = 3
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
        oneUpOneDown(results, normRes)
        hillClimbing(results, normRes)
        untilOverTake(results,normRes)
    }
})

function hillClimbing(results, normRes) {
    let maxPleasure = -Infinity, bestPlace, bestWeights, i = 0
    let weightPrice = 1 / 3
    let weightCount = 1 / 3
    let weightRating = 1 / 3
    while (weightPrice <= 1 && weightPrice >= 0 && weightCount <= 1 && weightCount >= 0 && weightRating <= 1 && weightRating >= 0 && i < 100) {
        let curr = getOptimal(results, weightPrice, weightCount, weightRating, normRes)
        if (curr.pleasure > maxPleasure) {
            maxPleasure = curr.pleasure
            bestPlace = JSON.parse(JSON.stringify(curr))
            bestWeights = 'wPrice =' + weightPrice + ', wRating = ' + weightRating + ', wCount = ' + weightCount
        }
        let upPrice = getOptimal(results, (weightPrice + 0.02), (weightCount - 0.01), (weightRating - 0.01), normRes)
        let upCount = getOptimal(results, (weightPrice - 0.01), (weightCount + 0.02), (weightRating - 0.01), normRes)
        let upRating = getOptimal(results, (weightPrice - 0.01), (weightCount - 0.01), (weightRating + 0.02), normRes)

        if (curr.pleasure > upCount.pleasure && curr.pleasure > upRating.pleasure && curr.pleasure > upPrice.pleasure) {
            break
        } else if (upPrice.pleasure >= upCount.pleasure && upPrice.pleasure >= upRating.pleasure) {
            weightPrice += 0.02
            weightCount -= 0.01
            weightRating -= 0.01
        } else if (upCount.pleasure >= upPrice.pleasure && upCount.pleasure >= upRating.pleasure) {
            weightPrice -= 0.01
            weightCount += 0.02
            weightRating -= 0.01
        } else if (upRating.pleasure >= upCount.pleasure && upRating.pleasure >= upPrice.pleasure) {
            weightPrice -= 0.01
            weightCount -= 0.01
            weightRating += 0.02
        }
        i++
    }
    console.log("the place with highest hill-climbing optimum is:")
    console.log(bestPlace)
    console.log('and the weights were:\n' + bestWeights)
    console.log(i)
}

function oneUpOneDown(results, normRes) {
    let maxPleasure = -Infinity, bestPlace, bestWeights
    for (let i = 0; i < 6; i++) {
        let weightPrice = 1 / 3
        let weightCount = 1 / 3
        let weightRating = 1 / 3
        while (weightPrice <= 1 && weightPrice >= 0 && weightCount <= 1 && weightCount >= 0 && weightRating <= 1 && weightRating >= 0) {
            let curr = getOptimal(results, weightPrice, weightCount, weightRating, normRes)
            if (curr.pleasure > maxPleasure) {
                maxPleasure = curr.pleasure
                bestPlace = JSON.parse(JSON.stringify(curr))
                bestWeights = 'wPrice =' + weightPrice + ', wRating = ' + weightRating + ', wCount = ' + weightCount
            }
            if (i === 0) {
                weightPrice -= 0.01
                weightCount += 0.01
            } else if (i === 1) {
                weightPrice += 0.01
                weightCount -= 0.01
            } else if (i === 2) {
                weightRating -= 0.01
                weightCount += 0.01
            } else if (i === 3) {
                weightRating += 0.01
                weightCount -= 0.01
            } else if (i === 4) {
                weightRating -= 0.01
                weightPrice += 0.01
            } else if (i === 5) {
                weightRating += 0.01
                weightPrice -= 0.01
            }
        }
    }
    console.log("the place with highest 'one up one down' optimum is:")
    console.log(bestPlace)
    console.log('and the weights were:\n' + bestWeights)
}


function untilOverTake(results, normRes) {
    let bestPlace = results[0]
    let bestWeights = ''
    for (let i = 0; i < 6; i++) {
        let first = true, maxID = 0, prevMaxID, maxIndex = 0
        let weightPrice = 0.33
        let weightCount = 0.33
        let weightRating = 0.33
        while (weightPrice <= 1 && weightPrice >= 0 && weightCount <= 1 && weightCount >= 0 && weightRating <= 1 && weightRating >= 0) {

            if (!first)
                prevMaxID = maxID

            //populate pleasure field
            for (let i = 0; i < results.length; i++)
                results[i].pleasure = normRes[0][i] * weightCount + normRes[1][i] * weightRating + normRes[2][i] * weightPrice

            //sort results form highest to lowest pleasure
            //results.sort((a, b) => (a.pleasure < b.pleasure) ? 1 : -1)

            //find place with highest pleasure
            let max = -Infinity, curr
            for (let i = 0; i < results.length; i++) {
                curr = results[i]
                if (curr.pleasure > max) {
                    max = curr.pleasure
                    maxID = curr.id
                    maxIndex = i
                }
            }
            if (first) {
                console.log("best place before changing weights in iteration " + (i + 1) + ":")
                console.log(results[maxIndex])
            } else if (prevMaxID !== maxID)
                break

            //change weights
            if (i === 0) {
                weightPrice -= 0.01
                weightCount += 0.01
            } else if (i === 1) {
                weightPrice += 0.01
                weightCount -= 0.01
            } else if (i === 2) {
                weightRating -= 0.01
                weightCount += 0.01
            } else if (i === 3) {
                weightRating += 0.01
                weightCount -= 0.01
            } else if (i === 4) {
                weightRating -= 0.01
                weightPrice += 0.01
            } else if (i === 5) {
                weightRating += 0.01
                weightPrice -= 0.01
            }
            first = false
        }

        console.log("best place after the previous best was over taken in iteration " + (i + 1) + ":")
        console.log(results[maxIndex])
        console.log('wPrice = ' + weightPrice, ',wRating = ' + weightRating, ',wCount = ' + weightCount + '\n')
        if (bestPlace.pleasure < results[maxIndex].pleasure) {
            bestPlace = JSON.parse(JSON.stringify(results[maxIndex]))
            bestWeights = 'wPrice =' + weightPrice + ', wRating = ' + weightRating + ', wCount = ' + weightCount
        }
    }
    console.log("the place with highest optimum is:")
    console.log(bestPlace)
    console.log('and the weights were:\n' + bestWeights)
}

function getOptimal(results, weightPrice, weightCount, weightRating, normRes) {
    let optimal = -Infinity, optimalIndex
    //populate pleasure field
    for (let i = 0; i < results.length; i++) {
        results[i].pleasure = normRes[0][i] * weightCount + normRes[1][i] * weightRating + normRes[2][i] * weightPrice
        if (results[i].pleasure > optimal) {
            optimal = results[i].pleasure
            optimalIndex = i
        }
    }
    return results[optimalIndex]
}

function normalize(results) {
    //find the min and max for price,rating and restaurant counter
    let minRating = Infinity
    let minPrice = Infinity
    let minCount = Infinity
    let maxRating = -Infinity
    let maxPrice = -Infinity
    let maxCount = -Infinity
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