const https = require('https');

const options = {
    hostname: 'zomrmjwevkbofgvjfexy.supabase.co',
    port: 443,
    path: '/',
    method: 'GET'
};

console.log('Testing connection to Supabase (zomrmjwevkbofgvjfexy.supabase.co)...');

const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);
    console.log('Connection Successful!');
});

req.on('error', (error) => {
    console.error('Connection Failed!');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    if (error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY') {
        console.error('\nVERDICT: This confirms a "Man-in-the-Middle" interception (Cisco/Antivirus).');
        console.error('Your computer does not trust the certificate presented by the network.');
    }
});

req.end();
