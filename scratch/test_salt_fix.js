const Utility = require('../utility');
const config = require('../config');

async function testHash() {
    console.log('Testing with config.SALT:', config.SALT, 'Type:', typeof config.SALT);
    try {
        const hash = await Utility.createHash('testpassword');
        console.log('Success! Hash generated:', hash);
        
        const isMatch = await Utility.comparePassword('testpassword', hash);
        console.log('Comparison test:', isMatch ? 'Passed' : 'Failed');
    } catch (error) {
        console.error('Error during test:', error);
    }
}

testHash();
