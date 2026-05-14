const admin = require('firebase-admin');
const supabase = require('../supabase');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Initialize Firebase Admin SDK
try {
    if (config.FIREBASE_PROJECT_ID && config.FIREBASE_CLIENT_EMAIL && config.FIREBASE_PRIVATE_KEY) {
        // Initialize from environment variables
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: config.FIREBASE_PROJECT_ID,
                clientEmail: config.FIREBASE_CLIENT_EMAIL,
                // Replace escaped newlines with actual newlines for the private key
                privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            })
        });
        console.log('Firebase Admin initialized successfully from environment variables.');
    } else {
        // Fallback to service account JSON file
        const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');
        if (fs.existsSync(serviceAccountPath)) {
            const serviceAccount = require(serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin initialized successfully from service account file.');
        } else {
            console.warn('Firebase Service Account credentials not found in env or file. Push notifications will not be sent.');
        }
    }
} catch (error) {
    console.error('Error initializing Firebase Admin:', error);
}

/**
 * Send a push notification to a user and save it in the database
 * 
 * @param {string} userId - UUID of the user
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {string} type - Notification type (e.g., 'appointment', 'wallet')
 * @param {object} data - Optional extra data payload
 */
const sendPushNotification = async (userId, title, body, type, data = {}) => {
    try {
        // 1. Save notification to Supabase database
        const { error: insertError } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                title: title,
                body: body,
                type: type,
                data: data
            });

        if (insertError) {
            console.error('Error saving notification to DB:', insertError);
            return;
        }

        // If Firebase is not initialized, we just save to DB and skip FCM
        if (!admin.apps.length) {
            return;
        }

        // 2. Fetch user FCM tokens
        const { data: tokensData, error: tokensError } = await supabase
            .from('user_fcm_tokens')
            .select('fcm_token')
            .eq('user_id', userId);

        if (tokensError || !tokensData || tokensData.length === 0) {
            console.log(`No FCM tokens found for user ${userId}`);
            return;
        }

        const tokens = tokensData.map(t => t.fcm_token);

        // 3. Send via FCM
        const message = {
            notification: {
                title: title,
                body: body,
            },
            data: {
                type: type,
                ...data
            },
            tokens: tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        
        console.log(`${response.successCount} messages were sent successfully`);
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]);
                    console.error(`Error sending to token: ${tokens[idx]}`, resp.error);
                }
            });
            // Optionally: Remove invalid tokens from DB
            if (failedTokens.length > 0) {
                 await supabase
                    .from('user_fcm_tokens')
                    .delete()
                    .in('fcm_token', failedTokens);
            }
        }
    } catch (error) {
        console.error('Error in sendPushNotification:', error);
    }
};

module.exports = {
    sendPushNotification,
    admin
};
