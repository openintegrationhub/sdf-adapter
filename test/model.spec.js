/* global describe */
const { getAllModels } = require('../lib/usecases/models/getAllModels');

describe('Models', () => {
  // eslint-disable-next-line no-undef
  test('should list all model', async (done) => {
    const config = {
      username: 'philipp.hoegner@cloudecosystem.org',
      password: '_uRFRDTxZf4BB',
      domain: '5cf51a1629bb9e00108f092c-Addresses',
    };
    const response = await getAllModels(config);

    // eslint-disable-next-line no-undef
    expect(response).toBeDefined();

    done();
  });
});
