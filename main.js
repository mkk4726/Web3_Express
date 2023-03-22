const express = require('express');
const app = express();
var fs = require('fs');
// make html source about list and body.
const template = require('./libs/templates');

// route, routing
// app.get('/', (req, res) => res.send('Hello World))
app.get('/', (req, res) => {
  fs.readdir('./data', (err, filelist) => {
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(filelist);
    var html = template.HTML(title, list, 
      `<h2>${title}</h2>${description}`,
      `<a href="/create>create</a>`
    );
    // res.writeHead(200);
    // res.end(html);
    res.status(200).send(html);
  });
});
    
app.get('/page/:pageId', (req, res) => {
  res.status(200).send(req.params);
})

app.listen(3000, () => {
  console.log('Example app listeng on port 3000!')
})




/*
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

const template = require('./libs/templates');
const { template_list, template_body} = template;

var app = http.createServer(function(request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  var title = queryData.id;
  var sanitizedTitle = sanitizeHtml(title);
  
  if (pathname === '/') {
    if (queryData.id === undefined) {
      queryData.id = 'INDEX'
    
    };
    fs.readdir('./data', function (err, filelist){   
      var filteredId = path.parse(queryData.id).base;
      fs.readFile(`./data/${filteredId}`, 'utf8', function(err, description) {
        var sanitizedDescription = sanitizeHtml(description);
        let list = template_list(filelist);
        let body = template_body(sanitizedTitle, list , sanitizedDescription,
          `<a href="/create">create</a>
          <a href="/update?id=${sanitizedTitle}">update</a>
          <form action="delete_process" method="post">
            <input type="hidden" name="id" value="${sanitizedTitle}">
            <input type="submit" value="delete">
          </form>
          `);
        response.writeHead(200);
        response.end(body);
        })
      })
  } else if (pathname === '/create') {
    fs.readdir('./data', function (err, filelist) {
      let title = 'create'; 
      let list = template_list(filelist);
      let description = `
      <form action="/create_process" method="post"> 
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>`
      let body = template_body(title, list, description,
        ``);
      response.writeHead(200);
      response.end(body);
    }) 
  } else if (pathname === '/create_process') {
    var body = '';
    request.on('data', function(data) {
      body += data;
    
      if (body.length > 1e6) {
        request.connection.destroy();
      }
    });
    request.on('end', function() {
      var post = qs.parse(body);
      var title = post.title;
      var description = sanitizeHtml(post.description);
      fs.writeFile(`data/${title}`, description, 'utf8', err => {
        if (err) {
          console.error(err);
        }
      });
      response.writeHead(302, {Location: `/?id=${title}`});
      response.end('success');
    })} else if (pathname === `/update`) {
      var filteredId = path.parse(queryData.id).base;
      fs.readdir('./data', function (err, filelist){      
        fs.readFile(`./data/${filteredId}`, 'utf8', function(err, description) {
          let list = template_list(filelist);
          let body = template_body(sanitizedTitle, list , 
            `
            <form action="/update_process" method="post"> 
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <p><input type="text" name="title" placeholder="title" value="${sanitizedTitle}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>`,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
          response.writeHead(200);
          response.end(body);
        });
      });
    } else if (pathname === '/update_process') {
      var body = '';
      request.on('data', function(data) {
        body += data;
      
        if (body.length > 1e6) {
          request.connection.destroy();
        }
      });
      request.on('end', function() {
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = sanitizeHtml(post.description);

        fs.rename(`data/${id}`, `data/${title}`, (err) => {
          // console.log(err);
          fs.writeFile(`data/${title}`, description, 'utf8', err => {
            if (err) {
              // console.error(err);
            }
          });
        })
        
        response.writeHead(302, {Location: `/?id=${title}`});
        response.end('success');
       
      })

    } else if (pathname === '/delete_process') {
      var body = '';
      request.on('data', function(data) {
        body += data;
      });
      request.on('end', function() {
        var post = qs.parse(body);
        var id = post.id;

        var filteredId = path.parse(id).base;
        fs.unlink(`./data/${filteredId}`, (err) => {
          // console.log(err);
        })

        response.writeHead(302, {Location: `/`});
        response.end('success');
        
        })
    } else {
    response.writeHead(404);
    response.end('Not found');
  }
})

app.listen(3000);

*/