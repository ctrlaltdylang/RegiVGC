const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const generateHtml = (filename, options) => {
  const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
  const inlined = juice(html);
  return inlined;
};

exports.send = async (options) => {
  const html = generateHtml(options.filename, options);
  const text = htmlToText.fromString(html);

  const mailOptions = {
    from: `dylan@ctrlaltdylan.com`,
    to: options.user.email,
    subject: options.subject,
    text,
    html,
  };

  return sgMail.send(mailOptions);
};
