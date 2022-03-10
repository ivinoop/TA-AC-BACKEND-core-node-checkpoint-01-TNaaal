const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');

let server = http.createServer(handleRequest);

function handleRequest(req, res) {
  let parsedUrl = url.parse(req.url,true);
  let contactsDir = __dirname + '/contacts/';
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
      let username = parsedData.username;
      // Handle error here
      fs.open(contactsDir + username + '.json', 'wx', (err, fd) => {
        if(err) console.log(err)
        fs.writeFile(fd, JSON.stringify(parsedData), (err) => {
          if(err) console.log(err)
          fs.close(fd, () => {
            res.setHeader('content-type', 'text/html')
              return res.end(`<h2>Contact "${username}" successfully saved</h2>`);
          });
        });
      });
    }
    // else if(parsedUrl.pathname === '/users' && req.method === 'GET') {
    //   let username = parsedUrl.query.username;
    //   let userPath = __dirname +'/contacts' + username +'.json';
    //   let contactsPath = __dirname + '/contacts';
    //   if(username) {
    //     fs.readFile(userPath, (err, content) => {
    //       if(err) console.log(err);
    //       let userData = (JSON.parse(content.toString()));
    //       res.writeHead(200, {'content-type': 'text/html'});
    //       res.write(`<h3>${userData.name}</h3>`);
    //       res.write(`<h3>${userData.email}</h3>`);
    //       res.write(`<h3>${userData.username}</h3>`);
    //       res.write(`<h3>${userData.age}</h3>`);
    //       res.write(`<h3>${userData.bio}</h3>`);
    //       return res.end();
    //     });
    //   } else {
    //     let userFiles = fs.readdirSync(contactsPath);
    //     let allContacts = userFiles.map((con) => {
    //       return JSON.parse(fs.readFile(contactsPath + '/' + con));
    //     });
    //     let allData = '';
    //     allContacts.forEach(contact => {
    //       allData += 
    //       `<h2>${contact.name}</h2>
    //        <h2>${contact.email}</h2>
    //        <h2>${contact.username}</h2>
    //        <h2>${contact.age}</h2>
    //        <h2>${contact.bio}</h2>`;
    //     });
    //     res.writeHead(200, {'content-type': 'text/html'});
    //     return res.end(allContacts);
    //   }
    // }
    else if(req.method === 'GET' && parsedUrl.pathname === '/users') {
      let username = parsedUrl.query.username;
      fs.readFile(contactsDir + username + '.json', (err, content) => {
        if(err) console.log(err);
        res.setHeader('content-type', 'application/json');
        return res.end(content);
      })
    }
    else {
      res.statusCode = 404;
      res.end('Page not found');
    }
  }); 
}

server.listen(5000, () => {
  console.log('=> Server listening on port 5000')
});