const https = require('https');

function postRequest(path, data) {
    const dataString = JSON.stringify(data);
    const options = {
        hostname: 'forex-quant-backend.onrender.com',
        port: 443,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': dataString.length
        }
    };

    const req = https.request(options, res => {
        let responseData = '';
        res.on('data', chunk => {
            responseData += chunk;
        });
        res.on('end', () => {
            console.log(`Response from ${path}:`, res.statusCode);
            if (res.statusCode === 302) {
                console.log('Redirect Location:', res.headers.location);
            } else {
                console.log('Body:', responseData);
            }
        });
    });

    req.on('error', error => {
        console.error('Error:', error);
    });

    req.write(dataString);
    req.end();
}

console.log('Testing APIs...');
postRequest('/api/auth/signup', {
    name: "Test User",
    email: "test_script_user@example.com",
    password: "password123",
    phoneNumber: "+19998887777"
});

setTimeout(() => {
    postRequest('/api/auth/signin', {
        email: "test_script_user@example.com",
        password: "password123"
    });
}, 2000);

setTimeout(() => {
    postRequest('/api/auth/request-otp', {
        emailOrPhone: "+19998887777"
    });
}, 4000);
