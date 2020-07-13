'use strict';
const debug = require('debug')('trymongo:users:ctl');
const log = require('debug')('trymongo:users:ctl*');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

exports.list = (req, res, next) => {
  debug('get users')
  res.send('not implemented yet');
}
exports.sendmail = (req, res, next) => {
  const transporter = nodemailer.createTransport({
    host: 'mail.goytoot.com',
    port: 587,
    secure: false, // upgrade later with STARTTTLS
    auth: {
      user: 'dkim@goytoot.com',
      pass: 'Welcome1',
    },
    dkim: {
      domainName: 'goytoot.com',
      keySelector: '2020',
      privateKey: process.env.DKIM_PRIVATE_KEY,
    },
  });
  const info = transporter.sendMail({
    from: 'dkim@goytoot.com',
    to: 'innerb@gmail.com',
    subject: 'forgot password',
    text: 'test'
  }, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      log(info)
    }
  });
}
exports.getsession = (req, res) => {
  console.log('req.session: ', req.session)
  res.status(200).json(req.session)
}
exports.postsession = (req, res) => {
  if (req.session.counter) {
    req.session.counter++;
  } else {
    req.session.counter = 1;
  }
  console.log('req.session: ', req.session)
  res.status(201).json(req.session)
}
exports.deletesession = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('delete session error: ', err)
      res.status(500).json({
        message: `Delete session error: ${err}`
      })
    } else {
      res.status(205).end()
    }
  })
}
exports.login = (req, res) => {
  debug('login: %o', req.body);
  const User = req.app.locals.mongooseService.getUserModel();
  let fetchedUser;
  User.findOne({email: req.body.email}).then(user => {
    if (!user) {
      return false;
    }
    fetchedUser = user;
    return bcrypt.compare( // async
      req.body.password, user.passwordHash
    )
  }).then(isPasswordVerified => {
    if (!isPasswordVerified) {
      return res.status(200).json({
        status: "Failure",
        messages: ['Invalid email/password'],
      });
    }
    req.session.userId = fetchedUser._id
    req.session.displayName = fetchedUser.displayName
    res.status(200).json({
      status: 'Success',
      userId: fetchedUser._id,
      email: fetchedUser.email,
      displayName: fetchedUser.displayName,
      createDate: fetchedUser.createDate,
    });
  }).catch(err => {
    debug('login error: %o', err.message)
    return res.status(500).json({
      message: 'login caught exception'
    });
  });
}
exports.signup = (req, res, next) => {
  debug('signup: %o', req.body);
  const User = req.app.locals.mongooseService.getUserModel();
  bcrypt.hash(req.body.password, 10).then(hash => {
    const newUser = new User({
      displayName: req.body.displayName,
      email: req.body.email,
      passwordHash: hash,
      createDate: (new Date).toISOString(),
    })
    newUser.save().then(result => {
      res.status(201).json({
        status: 'Success',
        result
      })
    }).catch(err => {
      const messages = Object.entries(err.errors).map(
        ([k, v]) => v.message
      );
      debug('signup errors:\n%o', messages);
      res.status(200).json({
        status: 'Failure',
        messages,
      })
    })
  })
}
exports.checkLogin = (req, res, next) => {
  if (req.session && req.session.userId) {
    next()
  } else {
    res.status(401).json({
      message: 'User not logged in'
    })
  }
}

