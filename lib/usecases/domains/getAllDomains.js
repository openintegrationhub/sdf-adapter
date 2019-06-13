const request = require('request-promise');

module.exports = {
  async getAllDomains(cfg) {
    await refresh(cfg);
    const token = process.env.token;

    if(token){
      console.log('Valid token');
    }

    let domainNames= {};

    const requestOptions = {
        method: 'GET',
        uri: `http://metadata.openintegrationhub.com/api/v1/domains`,
        json: true,
        headers: {
            "Authorization" : ` Bearer ${token}`, 
            }
    };

    const domains = await request.get(requestOptions);
       
    domains.data.forEach(element => {
        domainNames[`${element.id}-${element.name}`] = element.name;
        console.log(JSON.stringify(domainNames));
    });
    
    return domainNames;
  },
};
