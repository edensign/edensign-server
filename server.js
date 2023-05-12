const express = require('express')
const bodyParser = require("body-parser")
let { connectToMysql } = require("./db")


const app = express()
const port = 5000


app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
