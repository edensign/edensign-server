/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
    path: path.resolve(__dirname, `${process.env.NODE_ENV}.env`)
});

module.exports = {
    NODE_ENV : process.env.NODE_ENV || 'local',
    PORT : process.env.PORT || 8080,
    HOST : process.env.HOST || 'localhost',
    DB : process.env.DB || 'eden-sign',
    DB_PORT : process.env.DB_PORT || 3306,
    DB_USERNAME : process.env.DB_USERNAME || 'root',
    DB_PASSWORD : process.env.DB_PASSWORD || '',
    SECRET : process.env.SECRET || "EdEn@@#12sIgN",
    SALT : process.env.SALT || 16,
    IMAGE_CONTAINER_SAS_URL: process.env.IMAGE_CONTAINER_SAS_URL || "https://edensign.blob.core.windows.net/image-storage?sp=racwdli&st=2023-08-07T07:59:09Z&se=2023-10-31T15:59:09Z&spr=https&sv=2022-11-02&sr=c&sig=bYYCJSesNOlgW9vYM2Auma6eBKx2SNPzwU%2FsMDBr7%2B4%3D"
};

// ed#n@sign321