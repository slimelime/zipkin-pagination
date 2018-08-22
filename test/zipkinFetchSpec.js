const r = require('ramda');
const sandbox = require('sinon').createSandbox();
const axios = require('axios');

const {zipkinFetch} = require('../src/zipkin-fetch');

const TEST_PAGINATION = 2

describe('Zipkin fetching tests', function() {
  afterEach(() => {
    sandbox.restore();
  });
  it('should return metrics within default limit 5000', async () => {
    const data = [
      [
        {
          timestamp: 1,
          duration: defaultDuration,
          tags: defaultTags,
        }, {parentId: 1}]];
    sandbox.stub(axios, 'get').resolves({data});
    const res = await zipkinFetch('url', [], 'serviceName')(1000, 2000)
    res.should.be.eql(data)
  })

  it('should return metrics exceed the limit 5000 in given time period',
    async () => {
      const page1 = [
        [
          {
            traceId: 1,
            timestamp: 7770000,
            duration: defaultDuration,
            tags: {
              'http.host': 'api.banking-rules.prod.myob.com',
              'http.method': 'GET',
              'http.status_code': '200',
              'http.status_line': '200 OK',
              'http.url': 'https://api.banking-rules.prod.myob.com/health-check',
            },
          }, {parentId: 1}],
        [
          {
            traceId: 2,
            timestamp: 7770000,
            duration: defaultDuration,
            tags: {
              'http.host': 'api.banking-rules.prod.myob.com',
              'http.method': 'GET',
              'http.status_code': '200',
              'http.status_line': '200 OK',
              'http.url': 'https://api.banking-rules.prod.myob.com/health-check',
            },
          }, {parentId: 2}]];
      const page2 = [
        [
          {
            traceId: 3,
            timestamp: 6660000,
            duration: defaultDuration,
            tags: {
              'http.host': 'api.banking-rules.prod.myob.com',
              'http.method': 'GET',
              'http.status_code': '200',
              'http.status_line': '200 OK',
              'http.url': 'https://api.banking-rules.prod.myob.com/health-check',
            },
          }, {parentId: 3}]];
      sandbox.stub(axios, 'get').
        onFirstCall().
        returns({data: page1}).
        onSecondCall().
        returns({data: page2});
      const res = await zipkinFetch('url', [], 'serviceName', TEST_PAGINATION)(
        1000, 10000)
      res.should.be.eql(r.concat(page1, page2))

    })

  it('should remove duplicated traceId cross response',
    async () => {
      const page1 = [
        [
          {
            traceId: 1,
            timestamp: 7770000,
            duration: defaultDuration,
            tags: defaultTags,
          }, {parentId: 1}],
        [
          {
            traceId: 2,
            timestamp: 7770000,
            duration: defaultDuration,
            tags: defaultTags,
          }, {parentId: 2}]];
      const page2 = [
        [
          {
            traceId: 1,
            timestamp: 6660000,
            duration: defaultDuration,
            tags: defaultTags,
          }, {parentId: 3}]];
      sandbox.stub(axios, 'get').
        onFirstCall().
        returns({data: page1}).
        onSecondCall().
        returns({data: page2});
      const res = await zipkinFetch('url', [], 'serviceName', TEST_PAGINATION)(
        1000, 10000)
      res.should.be.eql(page1)
    })

  it('should not fetch more if not the exact page size limit returned',
    async () => {
      const page1 = [
        [
          {
            traceId: 1,
            timestamp: 7770000,
            duration: defaultDuration,
            tags: defaultTags,
          }, {parentId: 1}]];
      sandbox.stub(axios, 'get').
        onFirstCall().
        returns({data: page1}).
        onSecondCall().throws('error', 'unexpected fetching');
      const res = await zipkinFetch('url', [], 'serviceName', TEST_PAGINATION)(
        1000, 10000)
      res.should.be.eql(page1)
    })

});

const defaultDuration = 100;

const defaultTags = {
  'http.host': 'host',
  'http.method': 'GET',
  'http.status_code': '200',
  'http.status_line': '200 OK',
  'http.url': 'https://host/health-check',
};