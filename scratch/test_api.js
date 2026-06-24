const axios = require('axios');

async function testApi() {
    try {
        console.log("Logging in as company...");
        const loginRes = await axios.post('http://localhost:8080/api/v1/login', {
            email: 'livon@gmail.com',
            password: 'livon@123'
        });

        console.log("Login Result:", loginRes.data);
        const token = loginRes.data.data.token;

        console.log("Fetching company profile...");
        const profileRes = await axios.get('http://localhost:8080/api/v1/company/profile', {
            headers: {
                'x-access-token': token
            }
        });
        console.log("Company Profile:", profileRes.data);

        console.log("Fetching company distributors...");
        const distRes = await axios.get('http://localhost:8080/api/v1/company/distributors', {
            headers: {
                'x-access-token': token
            }
        });
        console.log("Company Distributors:", distRes.data);
    } catch (err) {
        console.error("API Test Error:", err.response ? err.response.data : err.message);
    }
}

testApi();
