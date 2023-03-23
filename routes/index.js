var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var template = require('../libs/templates.js');

// app.get('/', (req, res) => res.send('Hello World))
router.get('/', (req, res) => {
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

module.exports = router;