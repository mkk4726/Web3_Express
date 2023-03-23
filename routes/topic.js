// /topic/~~ request는 모두 이쪽으로 이동

var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var template = require('../libs/templates.js');

// '/topic' 으로 시작하는 주소에 대하여 router로 처리
// 따라서 여기서는 /topic이 부분을 없애야됨.

// implement create function
// topic/create는 page가 아닌 생성page로 가기 위한 예약어로 사용하기 위해 위치를 위로 올렸다.
router.get('/create', (req, res) => {
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

router.post('/create_process', (req, res) => {
  var post = req.body;
  var title = post.title;
  var description = post.description;
  fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
    res.writeHead(302, {Location: `/topic/${title}`});
    res.end();
  })

});

// implement update function
router.get('/update/:pageId', (req, res) => {
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
router.post('/update_process', (req, res) => {
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
router.post('/delete_process', (req, res) => {
  var post = req.body;
  var id = post.id;
  var filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, (err) => {
    res.redirect('/'); // 처음 페이지로 redirection
  });
});

// list에 없는 값을 url로 요청했을 때 error을 발생시키자.
router.get('/:pageId', (req, res, next) => {
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


module.exports = router;