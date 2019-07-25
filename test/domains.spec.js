/* global describe it */
const { getAllDomains } = require('../lib/usecases/domains/getAllDomains');

describe('Domains', () => {
  // eslint-disable-next-line no-undef
  test('should list all domain names', async (done) => {
    const config = {
      username: 'xxx',
      password: 'xxx',
    };
    const response = await getAllDomains(config);

    // eslint-disable-next-line no-undef
    expect(response).toBeDefined();

    done();
  });
});
