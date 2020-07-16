const nodemailer = require('nodemailer');
const debug = require('debug')('trymongo:email')

class EmailController {
  #mail_host = 'mail.goytoot.com';
  #mail_port = 587;
  #dkim_domain_name = 'goytoot.com';
  #dkim_key_selector = '2020';

  sendMail(
    toEmail,
    subject,
    text = 'empty text', html = '',
    // Now using same 'from' & 'email user account'
    fromUserEmail = 'dkim@goytoot.com',
    fromPassword = 'Welcome1',
  ) {
    const transporter = nodemailer.createTransport({
      host: this.#mail_host,
      port: this.#mail_port,
      secure: false, // upgrade later with STARTTTLS
      auth: {
        user: fromUserEmail,
        pass: fromPassword,
      },
      dkim: {
        domainName: this.#dkim_domain_name,
        keySelector: this.#dkim_key_selector,
        privateKey: process.env.DKIM_PRIVATE_KEY,
      },
    });

    return transporter.sendMail({
      from: fromUserEmail,
      to: toEmail,
      subject,
      text, html,
    }).then(info => {
      debug(info);
    }).catch(err => {
      console.error(err);
    });
  }
}

module.exports = EmailController;
