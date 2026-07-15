/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const dotenv = require('dotenv');
const path = require('path');

const NODE_ENV = process.env.NODE_ENV || 'local';
dotenv.config({
    path: path.resolve(__dirname, `${NODE_ENV}.env`)
});

module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'local',
    PORT: parseInt(process.env.PORT) || 8080,

    // Supabase configuration (replaces MySQL)
    SUPABASE_URL:         process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    SUPABASE_ANON_KEY:    process.env.SUPABASE_ANON_KEY,
    SUPABASE_BUCKET_NAME: process.env.SUPABASE_BUCKET_NAME || 'photos',

    // Auth
    SECRET: process.env.SECRET || "EdEn@@#12sIgN",
    SALT:   parseInt(process.env.SALT) || 10,

    // AWS S3
    ACCESS_KEY: process.env.AWS_ACCESS_KEY_ID,
    SECRET_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    REGION:     process.env.AWS_REGION,
    BUCKET:     process.env.AWS_BUCKET_NAME,

    // Azure Blob Storage
    IMAGE_CONTAINER_SAS_URL: process.env.IMAGE_CONTAINER_SAS_URL || "https://edensign1.blob.core.windows.net/image-storage?sp=racwdl&st=2023-11-08T06:00:11Z&se=2024-03-16T14:00:11Z&sv=2022-11-02&sr=c&sig=jUD8G%2F4U%2FxKUuYF4AMpBhL1Nw5zHzGdwGHqeHaxPd5g%3D",

    // Razorpay
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,

    // Firebase Admin
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,

    // AI Page Agent
    VITE_PAGE_AGENT_API_KEY: process.env.VITE_PAGE_AGENT_API_KEY
};
