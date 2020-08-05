'use strict';
const debug = require('debug')('trymongo:users.debug');
const log = require('debug')('trymongo:users.log');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const emailController = require('./email')

exports.list = (req, res, next) => {
  debug('get users')
  res.status(501).json({
    message: 'Not implemented yet',
  });
}
exports.resetPassword = async (req, res) => {
  const ResetPasswordToken = req.app.locals.mongoose.model('ResetPasswordToken')
  const resetPasswordToken = await ResetPasswordToken.findOne({
    hash: req.body.queryToken,
  })
  if (!resetPasswordToken) {
    res.status(401).json({
      message: 'Invalid token'
    })
  }
  const passwordHash = await bcrypt.hash(req.body.newPassword, 10).catch(err => {
    debug(err)
    res.status(500).json({
      message: 'Password reset failed',
    })
  })
  const User = req.app.locals.mongoose.model('User')
  await User.findOneAndUpdate({
    email: resetPasswordToken.email
  }, {
    passwordHash,
  }).then(result => {
    debug(result)
    res.status(200).json({
      message: 'Password reset success'
    })
  }).catch(err => {
    debug(err)
    res.status(500).json({
      message: 'Password reset failed'
    })
  })
}
exports.sendForgotPasswordEmail = async (req, res, next) => {
  const UserModel = req.app.locals.mongoose.model('User');
  const toEmail = req.body.email;
  const user = await UserModel.findOne({
    email: toEmail
  });
  if (!user) {
    const message = `User email (${toEmail}) not found`;
    console.log(message)
    res.status(401).json({
      message,
    })
  }
  const dateISO = new Date().toISOString();
  const hash = crypto.createHash('sha256')
    .update(toEmail)
    .update(dateISO)
    .digest('base64');
  await emailController.sendMail(
    toEmail,
    'The way to reset your GoyToot password',
    `<a href="https://goytoot.com/reset-password?tok=${hash}">
    Click this link to reset your password</a>
    `,
    `Click the link to reset your password: 
    https://goytoot.com/reset-password`,
  ).then(async (info) => {
    const ResetPasswordToken = req.app.locals.mongoose
      .model('ResetPasswordToken');
    await ResetPasswordToken.create({
      hash, dateISO,
      email: toEmail
    })
    res.status(200).json({
      message: 'Reset password email sent',
      info,
    })
  }).catch((err) => {
    debug(err);
    res.status(500).json({
      message: 'Sending reset password email failed',
    })
  })
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
exports.login = async (req, res) => {
  const User = req.app.locals.mongoose.model('User');
  let fetchedUser;
  const isUserValidated = await User.findOne({
    email: req.body.email
  }).then(user => {
    if (!user) {
      return false
    }
    fetchedUser = user;
    return bcrypt.compare( // async
      req.body.password, user.passwordHash
    )
  })
  if (!isUserValidated) {
    return res.status(401).json({
      status: 'Failure',
      message: 'Invalid email/password',
    })
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
}

exports.signup = (req, res, next) => {
  debug('signup: %o', req.body);
  bcrypt.hash(req.body.password, 10).then(hash => {
    const User = req.app.locals.mongoose.model('User');
    User.create({
      displayName: req.body.displayName,
      email: req.body.email,
      passwordHash: hash,
      createDate: (new Date).toISOString(),
    }).then(result => {
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

