/*  A Simple 'Hello World' API
 *    This barebones web server provides a RESTful api which may be called.
 *
 *  Notes:
 *    API Probing
        The '/hello' route is the only path to a successful response.
 *      Invalid paths should expect a statusCode of 418 "I'm a teapot.",
 *      to indicate that this server can't do what it isn't built for.
 *
 *    Insecure Environment
 *      This server configuration is NOT secure.  Human-Readable communication
 *      is being employed, and will betray your secrets to the world!
 *      The protocol will be kept insecure for the purpose of testing on
 *      another machine.  Including HTTPS would also require a key/cert
 *      to be generated on the proctor's environment.
 */

// Initialization and Functional Declaration
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

let openServer = http.createServer((req,res)=>{server_engine(req,res);});

var server_engine = (req,res)=>{

  // Parse the URL from the request
  let parsed_url = url.parse(req.url,false);

  // Extract and clean the path from the parsed URL
  let trimmed_path = parsed_url.pathname.replace(/^\/+|\/+$/g,'');

  // Assign the request handler, or skip to the notFound handler immediately.
  console.log(trimmed_path);
  if(typeof(router[trimmed_path]) !== 'undefined'){
    let assignedHandler = router[trimmed_path];

    // Extract the query string from the parsed URL
    let query = parsed_url.query;

    // Extract the method used to form this request
    let method = req.method.toUpperCase();

    // Extract the headers included in this request
    let headers = req.headers;

    // Instantiate the UTF-8 decoder for reading the request body.
    let decodifyer = new StringDecoder('utf-8');
    let stream_pool = '';
    req.on('data',(stream)=>{stream_pool+=decodifyer.write(stream)});
    req.on('end',()=>{
      stream_pool += decodifyer.end();

      let request_package = {
        'trimmed_path': trimmed_path,
        'query': query,
        'method': method,
        'headers': headers
      }

      assignedHandler(request_package, (status_code, response_package)=>{
        res.setHeader('Content-Type','application/json');
        res.writeHead(status_code);
        res.end(JSON.stringify(response_package));
        console.log(`Request Handled.\nstatusCode: ${status_code}\n response_package: `);
        console.log(response_package);
      });
    });
  } else {
    // immediately terminate processing the request, as it is aimed at an invalid route path
    handlers.notFound(null,(status_code, response_package) =>{
      res.setHeader('Content-Type','application/json');
      res.writeHead(status_code);
      res.end(JSON.stringify(response_package));
      console.log(`Invalid Request Handled.\nstatusCode: ${status_code}\nresPkg: `);
      console.log(response_package);
    });
  }
};

let handlers = {};
handlers.helloWorld = (request_package, callback)=>{
    var _res_pkg = {
      'handler': 'helloWorld Route',
      'payload': 'This is the helloWorld payload.',
      'reqID': request_package.reqID
    }
    callback(200, _res_pkg);
  };
handlers.notFound = (request_package, callback) => {
    var _res_pkg = {
      'handler': 'notFound',
      'payload': 'You are attempting to brew coffee.'
    };
    callback(418, _res_pkg);
};

const router = {
  'hello': handlers.helloWorld
}

// Scripted Logic
openServer.listen(3000,()=>{console.log(`HTTP server listening on port 3000`)});
