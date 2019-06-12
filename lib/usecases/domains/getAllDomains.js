const request = require('request-promise');

module.exports = {
  async getAllDomains() {
    const requestOptions = {
      method: 'GET',
      uri: 'http://metadata.openintegrationhub.com/api/v1/domains',
      json: true,
      headers: {
        Authorization: 'Bearer 62DScM6d57rc1QMJaa_pWSPGMC5CQTa3YDrAOLoDSQgj1-eJonADcD3d-sIpuCfj9ihx_Pn6ylAyWo0UACSN316qFo3C5T77nKvbf8SMzfECSL-ijp62sIKB1FsHNUAAFAaFwNQSulK-J2XsX92xeBbJnq_HDwLS88kSQ2eOXP0',
      },
    };

    const domains = await request.get(requestOptions);
    const domainNames = domains.data.map(element => element.name);
    return domainNames;
  },
};
