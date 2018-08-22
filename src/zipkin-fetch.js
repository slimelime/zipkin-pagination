const r = require('ramda')
const axios = require('axios')
const urlendode = require('urlencode')

const generateQueryFilter = filters => `annotationQuery=${urlendode(
  r.join(' and ')(filters))}`

const timespanOf = ({start, end}) => `lookback=${end - start}&endTs=${end}`

const spanTimeStamp = r.pipe(r.head, r.prop('timestamp'))

const zipkinFetch = (
  zipkinUrl, filters, serviceName = 'nginx', pageSize = 1000) => async (
  start, end) => {
  const recursiveFetch = async (start, end, acc) => {
    const url = `${zipkinUrl}/zipkin/api/v2/traces?${generateQueryFilter(
      filters)}&limit=${pageSize}&serviceName=${serviceName}&${timespanOf(
      {start, end})}`
    const res = await axios.get(url)
    const traces = r.propOr([], 'data', res)
    const veryFirst = r.reduce(r.minBy(spanTimeStamp), [{timestamp: Infinity}],
      traces)
    console.log(`traces: ${url} ${traces.length}, from ${start} to ${end}`);
    const newEnd = Math.floor(spanTimeStamp(veryFirst))
    if (traces.length === pageSize && newEnd > start) {
      return recursiveFetch(start, newEnd,
        r.uniqBy(r.pipe(r.head, r.prop('traceId')))(
          r.concat(acc, traces)))
    }
    return r.uniqBy(r.pipe(r.head, r.prop('traceId')))(r.concat(acc, traces))
  }
  return recursiveFetch(start, end, [])

}

exports.zipkinFetch = zipkinFetch