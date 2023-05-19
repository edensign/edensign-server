/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require("./config");
const v1Routes = require("./v1/routes");
let { connectToMysql } = require("./db");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const corsOptions ={
    origin:'http://localhost:5173',
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));

app.use('/api/v1', v1Routes);

app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});
