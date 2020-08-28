const nodemailer = require('nodemailer');
const debug = require('debug')('trymongo:email.debug')
//debug('dkim_private_key', process.env.DKIM_PRIVATE_KEY)
class EmailController {
  #transport_options = {
    // General
    host: 'mail.goytoot.com',
    port: 587,
    auth: {
      user: 'dkim@goytoot.com',
      pass: 'Welcome1',
    },
    // TLS
    secure: false, // upgrade later with STARTTTLS
    dkim: {
      domainName: 'goytoot.com',
      keySelector: '2020',
      privateKey: process.env.DKIM_PRIVATE_KEY,
    },
  }

  sendMail(
    toEmail,
    subject,
    // Gmail is bouncing mails (siting DMARC policy), if I don't
    // put similar stuff (like link info) in both html and text
    html = 'empty html',
    text = 'empty text',
    fromEmail = 'dkim@goytoot.com',
  ) {
    const transporter = nodemailer.createTransport(this.#transport_options);
    return transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject,
      html,
    }).then(info => {
      debug(info);
      return info;
    }).catch(err => {
      console.error(err);
      throw new Error(err);
    });
  }
}

module.exports = new EmailController();
