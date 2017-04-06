// server.js

// set up ======================================================================
// get all the tools we need
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
var port = process.env.PORT || 8080; // port 8080

var passport = require('passport');
var flash = require('connect-flash');
var i18n = require('i18n');

i18n.configure({

	//define how many languages we would support in our application
	locales: ['en', 'de', 'fr'],

	//define the path to language json files, default is /locales
	directory: __dirname + '/locales',

	//define the default language
	defaultLocale: 'fr',

	// define a custom cookie name to parse locale settings from 
	cookie: 'i18n'
});
app.use(cookieParser("i18n_demo"));

//init i18n after cookie-parser
app.use(i18n.init);


// configuration ===============================================================
// connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

// app.set('view engine', 'ejs'); // set up ejs for templating
app.set('view engine', 'pug')

// required for passport
app.use(session({
	secret: 'vidyapathaisalwaysrunning',
	cookie: { maxAge: 60000 },
	resave: true,
	saveUninitialized: true
})); // session secret



app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);





// Load Module and Instantiate
var i18n = new (require('i18n-2'))({
	// setup some locales - other locales default to the first locale
	locales: ['en', 'de', 'fr']
});

