var express = require('express')
  , http = require('http')
  , path = require('path')
  , restgen = require('restgen');

var app = express()
  , mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/vibb');

// development only
if ('development' == app.get('env')) {
  app.use(express.logger({ format: '\x1b[1m :date \x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms\x1b[0m :status' }));
}

// all environments
app.configure(function() {
  app.set('root', __dirname);
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(restgen.ErrorHandler)
});

restgen.Initialize(app, mongoose);

app.use(function(req, res, next){
  next(restgen.RestError.NotFound.insert(req.url));
});

// example of how to throw a 404
app.get('/404', function(req, res, next){
  next(restgen.RestError.NotFound.insert(req.url));
});

// example of how to throw a 500
app.get('/500', function(req, res, next){
  next(new Error('keyboard cat!'));
});

if(!module.parent) {
  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
}

exports.app = app;