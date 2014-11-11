var qs = require('querystring')
var hq = require('hyperquest')
var JSONStream = require('JSONStream')
var through = require('through')

module.exports = function(opts) {

  var stream = through()
  var count = 0

  var request = function(method, url, opts) {

    var uri = url

    ++count

    method = method || 'put'
    opts = opts || {}

    if (opts.querystring)
      uri += '?' + qs.stringify(opts.querystring)

    var req = hq[method](uri, opts)
    var noop = function(chunk) {
      this.push(chunk)
    }

    if (method == 'post' && opts.body)
      req.end(opts.body)

    req
      .pipe(through(opts.pre || noop))
      .pipe(JSONStream.parse(opts.pattern))
      .on('error', function(err) {
        stream.end(err)
      })
      .pipe(through(opts.post || noop))
      .on('error', function(err) {
        stream.end(err)
      })
      .on('data', function(d) { 
        stream.write(d)
      })
      .on('end', function() {
        if (--count == 0) stream.end()
      })
  }

  stream.get = function(url, opts) {
    request('get', url, opts)
  }

  stream.put = function(url, opts) {
    request('put', url, opts)
  }

  stream.delete = function(url, opts) {
    request('delete', url, opts)
  }

  stream.post = function(url, opts) {
    request('post', url, opts)
  }

  return stream
}

