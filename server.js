const config = require("./config")
const express = require('express')
let { connectToMysql } = require("./db")


const app = express()


app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`)
})
