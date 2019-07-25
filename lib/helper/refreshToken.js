const request = require('request-promise');

function calculateExpirationDate() {
  let dt = new Date();
  dt = dt.setHours(dt.getHours() + 2);

  process.env.tokenExpiryDate = dt;

  return true;
}

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
    // eslint-disable-next-line no-console
    console.log('Token or expiration date missing');
  } else if (process.env.tokenExpiryDate <= Date.now()) {
    // eslint-disable-next-line no-console
    console.log('Token is expired');
  } else {
    getToken = false;
    // eslint-disable-next-line no-console
    console.log('Token and expiry date are all good');
    return process.env.token;
  }

  // Check token validity
  if (!getToken) {
    const echoValidationRequest = {
      uri: 'http://flow-repository.openintegrationhub.com/flows',
      header: `Authorization:Bearer ${process.env.token}`,
      json: true,
    };

    request.get(echoValidationRequest, async (err, res) => {
      if (err === null) {
        const jsonResult = res.json();
        if (jsonResult.errors && jsonResult.errors[0].code === 401) {
          getToken = true;

          const response = await request.post(requestOptions);
          process.env.token = response.token;
          calculateExpirationDate();
        } else {
          getToken = false;
        }
      } else {
        console.log('Error while making request');
      }
    });
  }

  if (getToken) {
    try {
      // eslint-disable-next-line no-console
      console.log('Fetching the new token...');
      const response = await request.post(requestOptions);

      process.env.token = response.token;
      calculateExpirationDate();

      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('New token could not be fetched');
    }
  } else {
    return true;
  }
  return true;
}

exports.refresh = refreshToken;
exports.calculateExpiration = calculateExpirationDate;
