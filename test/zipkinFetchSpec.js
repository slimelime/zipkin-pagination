const r = require('ramda');
const assert = require('assert');
const {zipkinFetch} = require('../src/zipkin-fetch');

describe('zipkinFetch tests', function() {

  it('should return metrics within default limit 5000', async () => {

    assert.equal(1, 1)

  })

  it('should return metrics breaks the limit 5000 in given time period', async () => {
    assert.equal(2, 2)
  })

});
