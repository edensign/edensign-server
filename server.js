/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

require("net").setDefaultAutoSelectFamily(false);

const bodyParser = require("body-parser");
const cors = require("cors");
const express = require('express');
const fileUpload = require("express-fileupload");

const config = require("./config");
require("./db");   // Validates Supabase config on startup
const rateLimiter = require("./utility/rateLimiter");
const v1Routes = require("./v1/routes");

const app = express();

const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:8081', 'https://eden-sign.netlify.app', 'https://eden-sign-admin.netlify.app', 'https://salon-websiteih.netlify.app'],
    credentials: true,
    optionSuccessStatus: 200
}

app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true, parameterLimit: 50000 }));
app.use(cors(corsOptions));
app.use(fileUpload());
app.use(rateLimiter);

app.use('/api/v1', v1Routes);

app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});
