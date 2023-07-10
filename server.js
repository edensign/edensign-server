/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const bodyParser = require("body-parser");
const cors = require("cors");
const express = require('express');
const fileUpload = require("express-fileupload");
const path = require('path');

const config = require("./config");
let { connectToMysql } = require("./db");
const rateLimiter = require("./utility/rateLimiter")
const v1Routes = require("./v1/routes");

const app = express();

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200
}

app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true, parameterLimit: 50000 }));
// app.use(express.json());
app.use(cors(corsOptions));
app.use(fileUpload());   //express-fileupload middleware
app.use(rateLimiter);

app.use('/api/v1', v1Routes);

app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});
