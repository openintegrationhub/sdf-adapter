const request = require('request-promise');
const { calculateExpiration } = require('./lib/helper/refreshToken.js');

/**
 *
 * @param credentials object to retrieve apiKey from
 *
 * @returns Promise sending HTTP request and resolving its response
 */
async function verify(credentials) {
  const usernameOih = credentials.username;
  const passwordOih = credentials.password;

  if (!usernameOih) {
    throw new Error('Username is missing');
  } else {
    // eslint-disable-next-line no-console
    console.log(`Username: ${usernameOih} is ok.`);
  }
  if (!passwordOih) {
    throw new Error('Password: is missing');
  } else {
    // eslint-disable-next-line no-console
    console.log('Password **** is ok.');
  }

  const requestOptions = {
    uri: 'http://iam.openintegrationhub.com/login',
    json: true,
    body: {
      username: usernameOih,
      password: passwordOih,
    },
  };

  const response = await request.post(requestOptions);

  if (response) {
    process.env.token = response.token;
    calculateExpiration();
    return true;
  }
  return false;
}

module.exports = verify;
