var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();

// Passport configurators..
var loopbackPassport = require('loopback-component-passport');
var PassportConfigurator = loopbackPassport.PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);

/*
 * body-parser is a piece of express middleware that
 * reads a form's input and stores it as a javascript
 * object accessible through `req.body`
 *
 */
var bodyParser = require('body-parser');


// attempt to build the providers/passport config
var config = {};
try {
    config = require('./providers.json');
} catch (err) {
    console.trace(err);
    process.exit(1); // fatal
}

// Set up the /favicon.ico
app.use(loopback.favicon());

// request pre-processing middleware
app.use(loopback.compress());

// -- Add your pre-processing middleware here --


// boot scripts mount components like REST API
boot(app, __dirname);


// to support JSON-encoded bodies
app.use(bodyParser.json());
// to support URL-encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
}));



app.use(loopback.cookieParser(app.get('cookieSecret')));
app.use(loopback.session({
    secret: 'yololo',
    saveUninitialized: true,
    resave: true
}));

passportConfigurator.init();
passportConfigurator.setupModels({
    userModel: app.models.user,
    userIdentityModel: app.models.userIdentity,
    userCredentialModel: app.models.userCredential
});
for (var s in config) {
    var c = config[s];
    c.session = c.session !== false;
    passportConfigurator.configureProvider(s, c);
}

app.get('/auth/profileAcc',  function (req, res, next) {
res.send(req.user);
  //res.cookie('access-token', req.signedCookies['access-token']);
  //res.cookie('userId', req.user.id);
  //res.redirect('http://localhost:9291/#/main');
    // res.render('pages/loginProfiles', {
    //     user: req.user,
    //     url: req.url
    // });
});

// -- Mount static files here--
// All static middleware should be registered at the end, as all requests
// passing the static middleware are hitting the file system
// Example:
//   var path = require('path');
//   app.use(loopback.static(path.resolve(__dirname, '../client')));

// Requests that get this far won't be handled
// by any middleware. Convert them into a 404 error
// that will be handled later down the chain.
app.use(loopback.urlNotFound());

// The ultimate error handler.
app.use(loopback.errorHandler());

app.start = function() {
    // start the web server
    return app.listen(function() {
        app.emit('started');
        console.log('Web server listening at: %s', app.get('serverUrl'));
    });

};

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}
