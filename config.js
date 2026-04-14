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
    NODE_ENV: process.env.NODE_ENV || 'local',
    PORT: process.env.PORT || 8080,
    HOST: process.env.HOST || 'localhost',
    DB: process.env.DB || 'eden-sign',
    DB_PORT: process.env.DB_PORT || 3306,
    DB_USERNAME: process.env.DB_USERNAME || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    SECRET: process.env.SECRET || "EdEn@@#12sIgN",
    SALT: process.env.SALT || 10,
    ACCESS_KEY: process.env.AWS_ACCESS_KEY_ID,
    SECRET_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    REGION: process.env.AWS_REGION,
    BUCKET: process.env.AWS_BUCKET_NAME,

    IMAGE_CONTAINER_SAS_URL: process.env.IMAGE_CONTAINER_SAS_URL || "https://edensign1.blob.core.windows.net/image-storage?sp=racwdl&st=2023-11-08T06:00:11Z&se=2024-03-16T14:00:11Z&sv=2022-11-02&sr=c&sig=jUD8G%2F4U%2FxKUuYF4AMpBhL1Nw5zHzGdwGHqeHaxPd5g%3D"
};

// ed#n@sign321