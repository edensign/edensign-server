const express = require('express');
const bodyParser = require("body-parser");
const config = require("./config");
const routes = require("./routes");
let { connectToMysql } = require("./db");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', routes);

app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});
