const express = require("express")
const bodyParser=require("body-parser")
const app = express()
app.set("view engine","ejs");
app.use( express.static( "public" ) );

const port = 3001
var pageName;

app.get('/', (req, res) => {
    pageName="home page";

    res.render("index", {pageName:pageName});
})

app.get('/search', (req, res) => {
    pageName="search page";

    res.render("index", {pageName:pageName});
})

app.get('/update', (req, res) => {
    pageName="update page";

    res.render("index", {pageName:pageName});
})

app.get('/delete', (req, res) => {
    pageName="delete page";

    res.render("index", {pageName:pageName});
})

app.listen(process.env.PORT | port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

