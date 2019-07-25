const request = require('request-promise');
const { refresh } = require('../../helper/refreshToken.js');

module.exports = {
  async getAllModels(cfg) {
    const modelNames = {};
    const tempDomain = cfg.domain.split('-');
    const domain = tempDomain[0];

    await refresh(cfg);

    const { token } = process.env;

    if (token) {
      // eslint-disable-next-line no-console
      console.log('Valid token');
    }

    const requestOptions = {
      uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domain}/schemas`,
      json: true,
      headers: {
        Authorization: ` Bearer ${token}`,
      },
    };

    const models = await request.get(requestOptions);

    models.data.forEach((element) => {
      modelNames[`${element.id}-${element.name}`] = element.name;
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(modelNames));
    });
    return modelNames;
  },
};
