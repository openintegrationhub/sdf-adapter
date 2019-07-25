/* global describe it */
const { getAllDomains } = require('../lib/usecases/domains/getAllDomains');

describe('Domains', () => {
  // eslint-disable-next-line no-undef
  test('should list all domain names', async (done) => {
    const config = {
      username: 'philipp.hoegner@cloudecosystem.org',
      password: '_uRFRDTxZf4BB',
    };
    const response = await getAllDomains(config);

    // eslint-disable-next-line no-undef
    expect(response).toBeDefined();

    done();
  });
});
