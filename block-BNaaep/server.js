const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');

let server = http.createServer(handleRequest);

function handleRequest(req, res) {
  let store = '';
  req.on('data', (chunk) => {
    store += chunk;
  });
  req.on('end', () => {
    if(req.url === '/' && req.method ==='GET') {
      res.setHeader('content-type', 'text/html');
      fs.createReadStream('./index.html').pipe(res);
    }
    else if(req.url === '/about' && req.method === 'GET') {
      res.setHeader('content-type', 'text/html');
      fs.createReadStream('./about.html').pipe(res);
    }
    else if(req.url.split('.').pop() === 'css') {
      res.setHeader('content-type', 'text/css');
      fs.createReadStream(`./${req.url}`).pipe(res);
    }
    else if (req.url.split('.').pop() === 'jpeg' || req.url.split('.').pop() === 'png') {
      let imgFormat = req.url.split('.').pop();
      res.setHeader('content-type', `image/${imgFormat}`);
      fs.createReadStream(`./${req.url}`).pipe(res);
    }
    else if(req.url === '/contact' && req.method === 'GET') {
      res.setHeader('content-type', 'text/html');
      fs.createReadStream('./form.html').pipe(res);
    }
    else if(req.url === '/form' && req.method === 'POST') {
      let parsedData = qs.parse(store);
      let userName = parsedData.username;
      let contactsDir = __dirname + '/contacts/';
      fs.open(contactsDir + userName + '.json', 'wx', (err, fd) => {
        if(err) console.log(err)
        fs.writeFile(fd, store, (err) => {
          if(err) console.log(err)
          fs.close(fd, () => {
            res.setHeader('content-type', 'text/html')
              return res.end(`<h2>Contact "${userName}" successfully saved</h2>`);
          });
        });
      });
    }
  });
}

server.listen(5000, () => {
  console.log('=> Server listening on port 5000')
});