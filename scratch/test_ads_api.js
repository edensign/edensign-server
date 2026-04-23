const axios = require('axios');

async function testAds() {
    try {
        const response = await axios.get('http://localhost:8080/api/v1/products/sponsored');
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error fetching ads:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
        }
    }
}

testAds();
