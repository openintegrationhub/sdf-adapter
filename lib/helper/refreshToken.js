const request = require('request-promise');

async function refreshToken(cfg) {
    const usernameOih = cfg.username;
    const passwordOih = cfg.password;
    const requestOptions = {
        uri: 'http://iam.openintegrationhub.com/login',
        json: true,
        body: {
          username: usernameOih,
          password: passwordOih,
        },
      };

    let getToken = true;

    if (!process.env.token || !process.env.tokenExpiryDate) {
        console.log('Token or expiration date missing')
    }
    else if (process.env.tokenExpiryDate <= Date.now()) {
        console.log('Token is expired')
    } else {
        getToken = false;
        console.log('Token and expiry date are all good');
        return process.env.token;
    }

    if (getToken) {
        try{
            console.log('Fetching the new token...');
            const response = await request.post(requestOptions);
            process.env.token = response.token;
            calculateExpirationDate();

            return true;
        } catch (err) {
            console.log("New token could not be fetched");
        }
    }      
}

function calculateExpirationDate(){
    let dt = new Date();
    dt = dt.setHours( dt.getHours() + 2 );

    process.env.tokenExpiryDate = dt;

    return true;
}


exports.refresh = refreshToken;
exports.calculateExpiration = calculateExpirationDate;