// const crypto = require('crypto');

// const signTeleBirrRequest = (data, privateKey) => {
//     const sign = crypto.createSign('SHA256');
//     sign.update(JSON.stringify(data));
//     return sign.sign(privateKey, 'base64');
// };

// module.exports = { signTeleBirrRequest };

const crypto = require('crypto');
 
const signTeleBirrRequest = (data, privateKey) => {
    const sign = crypto.createSign('RSA-SHA256');

    // Convert data (object) to a string if it's not already
    const dataToSign = typeof data === 'object' ? JSON.stringify(data) : data;

    sign.update(dataToSign, 'utf8');  // Ensure it's a string
    sign.end();

    return sign.sign(privateKey, 'base64');  // Return the signed data as a base64-encoded string
};

module.exports = { signTeleBirrRequest };
