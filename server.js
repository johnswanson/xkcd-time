var webpage = require("webpage");
var fs = require("fs");

var page = webpage.create();

var Cache = (function () {
  var _cache = {};
  var cache = {};
  cache.has = function (response) {
    if (_cache.hasOwnProperty(response.url)) return true;

    if (fs.read("gotten.txt").split("\n").indexOf(response.url) !== -1) {
      _cache[response.url] = true;
      return true;
    }
    return false;
  };
  cache.put = function (response) {
    var id = setTimeout(function () {
      delete _cache[response.url];
    }, 20000);
    _cache[response.url] = true;

    return id;
  };
  cache.confirm = function (response, id) {
    fs.write("gotten.txt", response.url + "\n", "a");
    clearTimeout(id);
  };
  return cache;
})();

page.onResourceReceived = function (response) {
  var blacklisted = "http://imgs.xkcd.com/comics/time.png";
  if (response.contentType !== "image/png") return;
  if (response.url === blacklisted) return;
  if (Cache.has(response)) return;
  console.log("Setting up request for img");
  var cacheId = Cache.put(response);
  var imagepage = webpage.create();
  imagepage.open(response.url, function (status) {
    if (status !== "success") return console.log("Failed to connect to img");
    imagepage.render("img/"+Date.now()+".png");
    Cache.confirm(response, cacheId);
    console.log("Rendering completed: img/" + name);
  });
};

var id = setInterval(function () {
  page.open("http://imgs.xkcd.com/comics/time.png", function (status) {
    if (status !== "success") return console.log("Failed to connect");
  });
}, 10000);

setTimeout(function () {
  clearInterval(id);
  phantom.exit();
}, 86400000);
