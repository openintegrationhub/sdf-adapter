/* global describe it */
const { expect } = require('chai');

const { getAllDomains } = require('../lib/usecases/domains/getAllDomains');

describe('Domains', () => {
  it('should list all domain names', (done) => {
    getAllDomains().then((res) => {
      expect(res).to.be.an('array');
      expect(res).to.have.lengthOf.at.least(1);
      console.log(JSON.stringify(res, null, 3));
      done();
    });
  });
});
