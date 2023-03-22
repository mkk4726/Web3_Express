const express = require('express');
const app = express();
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var path = require('path');
var qs = require('querystring');

// using middleware, body-parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false})) 
// main.js가 실행될 때마다, 사용자가 요청할 때마다 middleware가 실행됨.
// req.body가 추가됨.

// using 
// create, request가 너무 길어서 거절됨. 용량이 커서 생기는 문제들
// -> 압축으로 해결. response header 에 content-encoding: gzip으로 보내줌

var compression = require('compression');
app.use(compression());

// make html source about list and body.
const template = require('./libs/templates');

// route, routing
// app.get('/', (req, res) => res.send('Hello World))
app.get('/', (req, res) => {
  fs.readdir('./data', (err, filelist) => {
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(filelist);
    var html = template.HTML("Main page", list, 
      `<h2>${title}</h2>${description}`,
      `<a href="/create">create</a>`
    );
    // res.writeHead(200);
    // res.end(html);
    res.status(200).send(html);
  });
});
    
app.get('/page/:pageId', (req, res) => {
  // read filelist from ./data
  fs.readdir('./data', (err, filelist) => {   
    // for security. prevent input like "../password.js"
    var filteredId = path.parse(req.params.pageId).base;
    // read description from ./data/id
    fs.readFile(`./data/${filteredId}`, 'utf8', (err, desc) => {
      let title = req.params.pageId;
      var sanitizedTitle = sanitizeHtml(title);
      var sanitizedDescription = sanitizeHtml(desc, {
        allowedTags:['h1']
      });
      let list = template.list(filelist);
      let html = template.HTML(title, list , sanitizedDescription,
        `<a href="/create">create</a>
        <a href="/update/${sanitizedTitle}">update</a>
        <form action="/delete_process" method="post">
          <input type="hidden" name="id" value="${sanitizedTitle}">
          <input type="submit" value="delete">
        </form>`
      );
      res.status(200).send(html);
    });
  });
});

// implement create function
app.get('/create', (req, res) => {
  fs.readdir('./data', (err, filelist) => {
    var title = 'WEB - create';
    var list = template.list(filelist);
    // form tag를 이용해서 post request를 보낼 수 있다.
    var html = template.HTML(title, list, ` 
      <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `, '');
    res.status(200).send(html);
  });
});

app.post('/create_process', (req, res) => {

  /*
  var body = '';
  // divide request just in case request is too long to process.  
  req.on('data', (data) => {
    body = body + data;
  });
  req.on('end', () => {
    var post = qs.parse(body);
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
      res.writeHead(302, {Location: `/page/${title}`}); // redirection
      res.end();
    })
  });
  */
  var post = req.body;
  var title = post.title;
  var description = post.description;
  fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
    res.writeHead(302, {Location: `/page/${title}`});
    res.end();
  })

});

// implement update function
app.get('/update/:pageId', (req, res) => {
  fs.readdir('./data', (err, filelist) => {
    var filteredId = path.parse(req.params.pageId).base;
    fs.readFile(`./data/${filteredId}`, 'utf8', (err, desc) => {
      var title = req.params.pageId;
      var list = template.list(filelist);
      // 위에서와 똑같이 form tag로 수정할 정보를 post request 보냄.
      // input type="hidden"은 원래 id를 얻기 위한 코드로, 사용자가 수정할 수 없도록 숨겼다.
      var html = template.HTML(title, list, `
        <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${desc}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>`,
      `<a href="/create">create</a> <a href="/update/id=${title}">update<a>`); // control

      res.status(200).send(html); 
    });
  });
});
// 수정할 정보를 받아서 수정하는 코드
app.post('/update_process', (req, res) => {
  var body = '';
  // divide request just in case request is too long to process.  
  req.on('data', (data) => {
    body = body + data;
  });
  req.on('end', () => {
    var post = qs.parse(body);
    var id = post.id;
    var title = post.title;
    var description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, (err) => {
      fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
        res.writeHead(302, {Location: `/page/${title}`}); // redirection
        res.end();
      });
    });
  });
});

// implement delete function
// post request로 id값만 전달됨.
app.post('/delete_process', (req, res) => {
  var post = req.body;
  var id = post.id;
  var filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, (err) => {
    res.redirect('/'); // 처음 페이지로 redirection
  });
});



app.listen(3000, () => {
  console.log('Example app listeng on port 3000!')
})



