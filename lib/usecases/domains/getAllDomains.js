const request = require('request-promise');
const { refresh } = require('../../helper/refreshToken.js');

module.exports = {
  async getAllDomains(cfg) {
    await refresh(cfg);

    const { token } = process.env;

    if (token) {
      // eslint-disable-next-line no-console
      console.log('Valid token');
    }

    const domainNames = {};

    const requestOptions = {
      method: 'GET',
      uri: 'http://metadata.openintegrationhub.com/api/v1/domains',
      json: true,
      headers: {
        Authorization: ` Bearer ${token}`,
      },
    };

    const domains = await request.get(requestOptions);

    domains.data.forEach((element) => {
      domainNames[`${element.id}-${element.name}`] = element.name;
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(domainNames));
    });
    return domainNames;
  },
};
