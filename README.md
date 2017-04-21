# hmap
hmap is a fast, flexible interpreter for HTML which use jade/pug syntax to describe HTML

## Install
```npm
npm install --save hmap
or
npm install hmap
```

## Basic Usage
**hmap file**  
test.hmap
```jade
html
  head
    title #{personal-title}
```

**javascript file**
```javascript
var hmap = require('hmap');
var html = '<html><head><title>hmap</title></head>'
var result = hmap(__dirname + "/test.hmap", html);
console.log(JSON.stringify(result));
```

**result**
```json
{"personal-title":"hmap"}
```

## Features
- Beautiful Syntax: `hmap` file use a beautiful syntax like jade/pug. if you have been use this template engine,you can fast to use it!
- Full Support: the low-level interpreter is Cheerio.A powerful npm package or core.

## License
this project is basic on MIT License. Use it free for you like.
