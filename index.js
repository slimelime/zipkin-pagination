const zipkinFetch = require('./src/zipkin-fetch')
exports.fetch = (ZIPKIN_URL, filters = []) => async (start, end) => zipkinFetch(
  ZIPKIN_URL, filters)(start, end)
