const r = require('ramda');
const assert = require('assert');
const {zipkinFetch} = require('../src/zipkin-fetch');

describe('zipkinFetch tests', function() {

  it('should return metrics within default limit 5000', async () => {
    const testSuites = [
      {start: 1534710000, end: 1534735000, actualSize: 4807},
      {start: 1534735001, end: 1534740000, actualSize: 960},
      {start: 1534700000, end: 1534709999, actualSize: 1920},
    ]
    const res = await Promise.all(r.map(async ({start, end, actualSize}) => {
      return zipkinFetch('http://localhost:9411',
        ['http.host=api.ledger-cache-facade.prod.myob.com', 'http.method=GET'])(
        start, end
      ).then(d => {
        console.log(d.length, actualSize, d.length === actualSize);
        return d.length === actualSize
      })
    })(testSuites))
    assert.equal(r.all(r.identity)(res), true)

  })

  it('should return metrics breaks the limit 5000 in given time period', async () => {
    const testSuites = [
      {start: 1534710000, end: 1534740000, actualSize: 4807 + 960},
      {start: 1534700000, end: 1534740000, actualSize: 4807 + 960 + 1920}
    ]
    const res = await Promise.all(r.map(async ({start, end, actualSize}) => {
      return zipkinFetch('http://localhost:9411',
        ['http.host=api.ledger-cache-facade.prod.myob.com', 'http.method=GET'])(
        start, end
      ).then(d => {
        console.log(d.length, actualSize, d.length === actualSize);
        return d.length === actualSize
      })
    })(testSuites))

    assert.equal(r.all(r.identity)(res), true)
  })

});
