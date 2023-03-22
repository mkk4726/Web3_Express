module.exports = {
  template_list : (filelist) => {
    var list = '<ul>';
    var i = 0;
    while(i < filelist.length) {
      if (filelist[i] !== 'INDEX') {
        list = list + `<li><a href="?id=${filelist[i]}">${filelist[i]}</a></li>`;
      }
      i = i + 1;
      
    }
    list = list + '</ul>';
    return list;
  },
  template_body : (title, list, description, control) => {
    var template = `
        <!doctype html>
        <html>
        <head>
          <title>WEB2 - ${title}</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1><a href="/">WEB</a></h1>
          ${list}
          ${control}
          <h2>${title}</h2>
          <p>${description}</p>
        </body>
        </html>`
    return template;
  }
} 

