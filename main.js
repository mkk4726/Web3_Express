const express = require('express');
const app = express();
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var path = require('path');
var qs = require('querystring');
const helmet = require('helmet');
app.use(helmet());

// make html source about list and body.
const template = require('./libs/templates');

// static file
// public아래에 있는 파일이나 디렉토리를 url을 통해 접근할 수 있게된다. -> 훨씬 더 안전해진다. 
// public directory안에서 파일을 찾겠다.
app.use(express.static('public')); 


// using middleware, body-parser
// main.js가 실행될 때마다, 사용자가 요청할 때마다 middleware가 실행됨.
// req.body가 추가됨.
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false})) 


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

// simplify code using router.
var topicRouter = require('./routes/topic');
var indexRouter = require('./routes/index');
// /topic으로 시작하는 주소들에게 topicRouter라는 middleware를 적용하겠다. 
app.use('/topic', topicRouter);
app.use('/', indexRouter);


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

// setting port number
app.listen(3000, () => {
  console.log('Example app listeng on port 3000!')
})



