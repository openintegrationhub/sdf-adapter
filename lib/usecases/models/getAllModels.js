const request = require('request-promise');

module.exports = {
  async getAllModels(cfg) {
    let modelNames= {};
    const tempDomain = cfg.domain.split('-');
    const domain = tempDomain[0];

    await refresh(cfg);
    const token = process.env.token;

    if(token){
      console.log('Valid token');
    }

    const requestOptions = {
      method: 'GET',
      uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domain}/schemas`,
      json: true,
      headers: {
          "Authorization" : ` Bearer ${token}`, 
          }
    };

    const models = await request.get(requestOptions);

    models.data.forEach(element => {
        modelNames[`${element.id}-${element.name}`] = element.name;
        console.log(JSON.stringify(modelNames));
    });
    
    return modelNames;
  },
};
