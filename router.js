// Require Africa's Talking SDK here...
var AfricasTalking = require('africastalking');
var express = require('express');
var router = express.Router();

// Initialize SDK code here...
var africasTalking = new AfricasTalking({
  username: 'Pine_Date',
  apiKey: '60a1e9f206c0f1b43e22a295fc08a31efcdd64f20b6fbbee90f21dcfb8ceae1d',
});

var sms = africasTalking.SMS;

// Login credentials
var CONFIG_USERNAME = 'user1';
var CONFIG_PASSWORD = 'pass1';

// 2 factor authentication verification code
var CONFIG_VERIFICATION_CODE = '';

// Simulator phone number
var CONFIG_PHONE_NUMBER = '+254797163664';

router.get('/', function (req, res, next) {
  if (req.session.loggedIn === true) {
    res.render('index', {
      title: 'Home | Africa\'s Talking 2FA',
      welcomeTitle: 'Nice!',
      welcomeMessage: 'You made it :)',
    });
  } else {
    res.redirect('/login');
  }
});

router.get('/login', function (req, res, next) {
  if (req.session.loggedIn === true) {
    res.redirect('/');
  } else {
    res.render('login', {
      title: 'Login | Africa\'s Talking 2FA',
    });
  }
});

// Process login form code here...
router.post('/login', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  if (username === CONFIG_USERNAME && password === CONFIG_PASSWORD) {
    req.session.sendVerificationCode = true;
    req.session.verificationFailed = false;
    res.redirect('/verify');
  } else {
    res.redirect('/login');
  }
});

// Send verification code here...
function sendVerificationCode() {
  var randomNumber = Math.floor(1000 + Math.random() * 9000);
  CONFIG_VERIFICATION_CODE = 'VC-' + randomNumber;

  var message = 'Your login verification code is: ' + CONFIG_VERIFICATION_CODE;

  console.log('Sending message...');
  sms.send({
    to: CONFIG_PHONE_NUMBER,
    message: message,
  })
    .then(function (response) {
      console.log('Message Sent!');
      console.log(response);
    })
    .catch(function (error) {
      console.log('Message Failed!');
      console.log(error);
    });
}
router.get('/verify', function (req, res, next) {
  if (req.session.loggedIn === true) {
    res.redirect('/');
  } else {
    if (req.session.sendVerificationCode === true && req.session.verificationFailed === false) {
      // Call send verification function here...
      sendVerificationCode();
    }

    res.render('verify', {
      title: 'Verify | Africa\'s Talking 2FA',
    });
  }
});

// Process verify code form here...
router.post('/verify', function (req, res) {
  var code = req.body.code;

  if (code === CONFIG_VERIFICATION_CODE) {
    req.session.loggedIn = true;
    delete req.session.sendVerificationCode;
    delete req.session.verificationFailed;

    CONFIG_VERIFICATION_CODE = '';

    res.redirect('/');
  } else {
    req.session.verificationFailed = true;
    res.redirect('/verify');
  }
});

router.post('/logout', function (req, res, next) {
  delete req.session.loggedIn;
  res.redirect('/');
});


module.exports = router;