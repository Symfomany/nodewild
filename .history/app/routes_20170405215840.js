var mysql = require('mysql');
var flash = require('express-flash');
var blobStream = require('blob-stream');

var express = require('express'),
	app = express(),
	pdf = require('express-pdf');

var path = require('path');

const PDFDocument = require('pdfkit')
const nodemailer = require('nodemailer');


let transporter = nodemailer.createTransport({
	host: "smtp.mailtrap.io",
	port: 2525,
	auth: {
		user: "eccfcf64a912f3",
		pass: "7bef7b105b4c7b"
	}
});

// setup email data with unicode symbols
let mailOptions = {
	from: '"Fred Foo 👻" <foo@blurdybloop.com>', // sender address
	to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers
	subject: 'Hello ✔', // Subject line
	text: 'Hello world ?', // plain text body
	html: '<b>Hello world ?</b>' // html body
};


var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'djscrave',
	database: 'iich'
});

connection.connect(function (err) {
	if (err) {
		console.error('error connecting: ' + err.stack);
		return;
	}
});


// app/routes.js
module.exports = function (app, passport) {


	//pdf
	app.use(pdf);

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function (req, res) {

		//send email
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				return console.log(error);
			}
			console.log('Message %s sent: %s', info.messageId, info.response);
		});

		res.render('index'); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function (req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/pages', // redirect to the secure profile section
		failureRedirect: '/login', // redirect back to the signup page if there is an error
		failureFlash: true // allow flash messages
	}),
		function (req, res) {
			console.log("hello");

			if (req.body.remember) {
				req.session.cookie.maxAge = 1000 * 60 * 3;
			} else {
				req.session.cookie.expires = false;
			}
			res.redirect('/');
		});

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function (req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup', { message: req.flash('signupMessage') });
	});


	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/pages', // redirect to the secure pages section
		failureRedirect: '/signup', // redirect back to the signup page if there is an error
		failureFlash: true // allow flash messages
	}));

	// =====================================
	// Pages SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/pages', isLoggedIn, function (req, res) {

		var query = connection.query('SELECT * FROM pages', function (mysql_err, mysql_res) {

			res.render('pages',
				{
					expressFlash: req.flash('success'),
					pages: mysql_res,
					user: req.user // get the user out of session and pass to template
				});
		});

	});



	// =====================================
	// Edit Pages SECTION =========================
	// =====================================
	/**
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
	 * Page Edit
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
	 */
	app.get('/edit/:id', function (req, res) {
		var id = req.params.id;
		var query = connection.query(`SELECT * FROM pages WHERE id = ${id}`, function (mysql_err, mysql_res) {

			if (mysql_err) {
				res.render('error', { error: mysql_err });
			}

			res.render('edit', {
				page: mysql_res[0]
			});

		});
	});



	/**
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
	 * Store action
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
	 */
	// all => GET (id) + POST
	app.all('/save/:id', function (req, res) {
		var id = req.params.id;
		var query = connection.query('UPDATE pages SET ? WHERE ?', [{ valeur: req.body.valeur }, { id: id }])

		req.flash('success', "La page a bien été éditée");
		res.redirect('/pages');
	});

	/**
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
	 * Pages de contact
	 * @todo: Search Engine for Sections
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
	 */
	// all => GET (id) + POST
	app.get('/contact', function (req, res) {
		res.render('contact', {
		});
	});



	// =====================================
	// Edit Pages SECTION =========================
	// =====================================
	/**
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
	 * Page PDF
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
	 */
	app.get('/pdf', function (req, res) {
		const doc = new PDFDocument();
		let filename = req.body.filename;
		// Stripping special characters
		filename = encodeURIComponent(filename) + '.pdf';
		// Setting response to 'attachment' (download).
		// If you use 'inline' here it will automatically open the PDF
		res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
		res.setHeader('Content-type', 'application/pdf');
		const content = `Blablabla...<br />
		`;
		doc.y = 300;
		doc.text(content, 50, 50);
		doc.pipe(res);
		doc.end();
	});

	//  res.pdfFromHTML({
	//     filename: 'generated.pdf',
	// 		htmlContent: '<p>ASDF</p>',
	// });
	// res.end();




	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/');
	});
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
