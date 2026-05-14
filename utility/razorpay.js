const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require('../config');

// Initialize Razorpay instance lazily
let razorpayInstance = null;

const getRazorpayInstance = () => {
    if (!razorpayInstance) {
        if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
            console.warn('Razorpay keys are missing. Payment operations will fail.');
            return null;
        }
        razorpayInstance = new Razorpay({
            key_id: config.RAZORPAY_KEY_ID,
            key_secret: config.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayInstance;
};

/**
 * Creates a Razorpay order.
 * @param {number} amount - The amount in INR (will be converted to paise).
 * @param {string} receipt - A unique receipt identifier.
 * @returns {Promise<Object>} The Razorpay order object.
 */
const createOrder = async (amount, receipt) => {
    const instance = getRazorpayInstance();
    if (!instance) throw new Error('Razorpay is not configured');

    const options = {
        amount: Math.round(amount * 100), // convert to paise
        currency: 'INR',
        receipt: receipt,
    };

    return new Promise((resolve, reject) => {
        instance.orders.create(options, (err, order) => {
            if (err) {
                console.error('Razorpay order creation failed:', err);
                return reject(err);
            }
            resolve(order);
        });
    });
};

/**
 * Verifies the Razorpay payment signature.
 * @param {string} order_id - The Razorpay order ID.
 * @param {string} payment_id - The Razorpay payment ID.
 * @param {string} signature - The Razorpay signature from the client.
 * @returns {boolean} True if the signature is valid, false otherwise.
 */
const verifySignature = (order_id, payment_id, signature) => {
    if (!config.RAZORPAY_KEY_SECRET) return false;

    const body = order_id + "|" + payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    return expectedSignature === signature;
};

module.exports = {
    getRazorpayInstance,
    createOrder,
    verifySignature,
};
