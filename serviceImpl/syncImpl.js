const http = require("http");
var https = require('https');

module.exports = {
    publication: function(data) {
        // console.log(data)
    },
    resDateToClientServer: function(data) {
        var data = JSON.stringify(data)
        var options = {
            host: 'twoway1.herokuapp.com',
            path: '/api/client/',
            method: 'POST',
            headers: {
              'Access-Control-Allow-Origin':'*',
              'Access-Control-Allow-Credentials':'true',
              'Access-Control-Allow-Methods':'GET, HEAD, POST, PUT, DELETE',
              'Access-Control-Allow-Headers':'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization',
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(data),
              'authorization': 'token',
            }
        };

        var httpreq = http.request(options, function (response) {
            response.setEncoding('utf8');
            response.on('data', (d) => {
                // console.log(d)
            })
        });
        httpreq.write(data);
        httpreq.end();
    }
}