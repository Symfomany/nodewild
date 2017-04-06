var mysql = require('mysql');
var flash = require('express-flash');
var blobStream = require('blob-stream');

var express = require('express'),
	app = express(),
	pdf = require('express-pdf');

var path = require('path');

const PDFDocument = require('pdfkit')
const nodemailer = require('nodemailer');
const Paypal = require('paypal-express-checkout');


// debug = optional, defaults to false, if true then paypal's sandbox url is used
// paypal.init('some username', 'some password', 'signature', 'return url', 'cancel url', debug);
var paypal = Paypal.init('julie_api1.meetserious.com', 'TM4E2TPP5Q4XFVXD', 'All4UJDmyWTWhg1CD6xRXR5afv3FAChTf-fg6nz4kiaVZAoSrKIhY-eb', 'http://localhost:8080/paypal-confirm', 'http://localhost:8080/pages', true);


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



	/**
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
	 * Paypal
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
	 */
	app.get('/cart', function (req, res) {



	});


	/**
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
	 * Paypal checkout
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
	 */
	app.get('/paypal', function (req, res) {

		// checkout
		// requireAddress = optional, defaults to false
		// paypal.pay('Invoice number', amount, 'description', 'currency', requireAddress, callback);
		// paypal.pay('20130001', 123.23, 'iPad', 'EUR', function(err, url) {
		// or with "requireAddress": true
		let number = Math.floor(Math.random() * (10000000 + 1)) + 1;
		paypal.pay('20130002', 62, 'iPhone', 'EUR', true, function (err, url) {
			if (err) {
				console.log(err);
				return;
			}

			// redirect to paypal webpage
			res.redirect(url);
		});

	});


	app.get('/paypal-confirm', function (req, res) {
		//detail
		paypal.detail(req.query.token, req.query.PayerID, function (err, data, invoiceNumber, price) {

			if (err) {
				console.log(err);
				return;
			}

			// data.success == {Boolean}
			console.log(data);

			if (data.success)
				console.log('DONE, PAYMENT IS COMPLETED.');
			else
				console.log('SOME PROBLEM:', data);

			/*
			data (object) =
			{ TOKEN: 'EC-35S39602J3144082X',
			  TIMESTAMP: '2013-01-27T08:47:50Z',
			  CORRELATIONID: 'e51b76c4b3dc1',
			  ACK: 'Success',
			  VERSION: '52.0',
			  BUILD: '4181146',
			  TRANSACTIONID: '87S10228Y4778651P',
			  TRANSACTIONTYPE: 'expresscheckout',
			  PAYMENTTYPE: 'instant',
			  ORDERTIME: '2013-01-27T08:47:49Z',
			  AMT: '10.00',
			  TAXAMT: '0.00',
			  CURRENCYCODE: 'EUR',
			  PAYMENTSTATUS: 'Pending',
			  PENDINGREASON: 'multicurrency',
			  REASONCODE: 'None' };
			*/

			req.flash('success', "Le paiment a bien été effectué");
			res.redirect('/pages');

		});

	});

	/**
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
	 * Page PDF
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
	 */
	app.get('/pdf', function (req, res) {
		const doc = new PDFDocument();
		doc.font('public/fonts/PalatinoBold.ttf')
			.fontSize(25);

		doc.addPage()
			.fontSize(25)
			.text('Here is some vector graphics...', 100, 100)

		let filename = req.body.filename;
		// Stripping special characters
		filename = encodeURIComponent(filename) + '.pdf';
		// Setting response to 'attachment' (download).
		// If you use 'inline' here it will automatically open the PDF
		res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
		res.setHeader('Content-type', 'application/pdf');
		const content = `Blablabla...<br />`;
		doc.addPage()
		doc.y = 300;
		doc.text(content, 50, 50);
		doc.pipe(res);
		doc.end();

		// req.flash('success', "Le PDF a bien été exporté");
		// res.redirect('/pages');

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
