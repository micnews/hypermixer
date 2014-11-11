var hypermixer = require('..')
var http = require('http')
var ASSERT = require('assert').ok

describe('the constructor', function() {

  var server = http.createServer(function(req, res) {
    if (req.url == '/?v=2&alt=json') {
      res.end(JSON.stringify({
        feed: {
          links: [
            { link0: 0 },
            { link1: 1 },
            { link2: 2 }
          ]
        }
      }));
    }
    else if (req.url == '/foo') {
      res.end(JSON.stringify({
        links: [
          { link3: 3 },
          { link4: 4 }
        ]
      }));
    }
    else if (req.url == '/invalidjson') {
      res.end('invalidjson')
    }
  }).listen(8009);

  it('should connect to multiple end points and emit chunks of valid json as they are recieved', function(done) {
  
    var h = hypermixer()
    var count = 0

    h.on('data', function(data) {
      ++count
    })

    h.on('end', function() {
      ASSERT(count == 5)
      done()
    })

    h.get('http://127.0.0.1:8009/', {
      pattern: 'feed.links.*',
      querystring: { v: 2, alt: 'json' }
    })

    h.get('http://127.0.0.1:8009/foo', {
      pattern: 'links.*'
    })

  })

  it('should write error back on invalid json and end', function(done) {

    var h = hypermixer()
    var count = 0

    h.on('data', function(data) {
      ASSERT(data instanceof Error)
      ++count
    })

    h.on('end', function() {
      ASSERT(count == 1)
      done()
    })

    h.get('http://127.0.0.1:8009/invalidjson')

  })
})

