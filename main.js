const express = require('express');
const app = express();
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var path = require('path');
var qs = require('querystring');

// static file
app.use(express.static('public')); // public directory안에서 파일을 찾겠다.
// public아래에 있는 파일이나 디렉토리를 url을 통해 접근할 수 있게된다. -> 훨씬 더 안전해진다. 


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

// make middle ware
// 공통적으로 사용되는 기능을 middleware로 처리한다.
// 필요없을 때도 불러오는 비효율이 발생한다. use -> get
// 모든 get방식에서만 filedir을 불러오는 방식. post에서는 발생하지 않는다. 
// 사실 express에서는 모든게 middle ware다 .
app.get('*', (req, res, next) => {
  fs.readdir('./data', (err, filelist) => {
    req.list = filelist;
    next(); // next에는 그 다음에 호출되어야할 middleware가 담겨있다. 
  });
});

// make html source about list and body.
const template = require('./libs/templates');

// route, routing
// app.get('/', (req, res) => res.send('Hello World))
app.get('/', (req, res) => {
  var title = 'Welcome';
  var description = 'Hello, Node.js';
  var list = template.list(req.list);
  var html = template.HTML("Main page", list, 
    `<h2>${title}</h2>${description}
    <img src="/images/hello.jpg" style="width:25%; display:block; margin-top:10px">
    `,
    `<a href="/topic/create">create</a>`
  );
  // res.writeHead(200);
  // res.end(html);
  res.status(200).send(html);
});

// implement create function
// topic/create는 page가 아닌 생성page로 가기 위한 예약어로 사용하기 위해 위치를 위로 올렸다.
app.get('/topic/create', (req, res) => {
  var title = 'WEB - create';
  var list = template.list(req.list);
  // form tag를 이용해서 post request를 보낼 수 있다.
  var html = template.HTML(title, list, ` 
    <form action="/topic/create_process" method="post">
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

app.post('/topic/create_process', (req, res) => {
  var post = req.body;
  var title = post.title;
  var description = post.description;
  fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
    res.writeHead(302, {Location: `/topic/${title}`});
    res.end();
  })

});

// implement update function
app.get('/topic/update/:pageId', (req, res) => {
  var filteredId = path.parse(req.params.pageId).base;

  fs.readFile(`./data/${filteredId}`, 'utf8', (err, desc) => {
    var title = req.params.pageId;
    var list = template.list(req.list);
    // 위에서와 똑같이 form tag로 수정할 정보를 post request 보냄.
    // input type="hidden"은 원래 id를 얻기 위한 코드로, 사용자가 수정할 수 없도록 숨겼다.
    var html = template.HTML(title, list, `
      <form action="/topic/update_process" method="post">
        <input type="hidden" name="id" value="${title}">
        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
        <p>
          <textarea name="description" placeholder="description">${desc}</textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>`,
    `<a href="/topic/create">create</a> <a href="/topic/update/id=${title}">update<a>`); // control

    res.status(200).send(html); 
  });
});
// 수정할 정보를 받아서 수정하는 코드
app.post('/topic/update_process', (req, res) => {
  var post = req.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, (err) => {
    fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
      res.writeHead(302, {Location: `/topic/${title}`}); // redirection
      res.end();
    });
  });
});

// implement delete function
// post request로 id값만 전달됨.
app.post('/topic/delete_process', (req, res) => {
  var post = req.body;
  var id = post.id;
  var filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, (err) => {
    res.redirect('/'); // 처음 페이지로 redirection
  });
});

// list에 없는 값을 url로 요청했을 때 error을 발생시키자.
app.get('/topic/:pageId', (req, res, next) => {
  // for security. prevent input like "../password.js"
  var filteredId = path.parse(req.params.pageId).base;
  // read description from ./data/id
  fs.readFile(`./data/${filteredId}`, 'utf8', (err, desc) => {
    if (err) {
      next(err); // error가 발생하면 다음 middleware을 호출하도록. err을 던진다. 
    } else {
      let title = req.params.pageId;
      var sanitizedTitle = sanitizeHtml(title);
      var sanitizedDescription = sanitizeHtml(desc, {
        allowedTags:['h1']
      });
      let list = template.list(req.list);
      let html = template.HTML(title, list , sanitizedDescription,
        `<a href="/topic/create">create</a>
        <a href="/topic/update/${sanitizedTitle}">update</a>
        <form action="/topic/delete_process" method="post">
          <input type="hidden" name="id" value="${sanitizedTitle}">
          <input type="submit" value="delete">
        </form>`
      );
      res.status(200).send(html);
    }
  });
});

// handle 404 response
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!")
})

// error handler
// express에서는 4개의 인자를 가지고 있는 함수는 error를 handling하기 위한 middleware로 약속되어있다. 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
})

app.listen(3000, () => {
  console.log('Example app listeng on port 3000!')
})



