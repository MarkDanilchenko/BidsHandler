// --------------------------------------MAILER_CONFIG
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config({ path: '../../.env' });

// --------------------------------------MAILER(TEST_ACCOUNT)
const sendEmail = async (mailOptions) => {
	const testAccount = await nodemailer.createTestAccount();
	const transporter = nodemailer.createTransport({
		host: 'smtp.ethereal.email',
		port: 587,
		secure: false,
		auth: {
			user: testAccount.user,
			pass: testAccount.pass,
		},
	});
	return transporter.sendMail(mailOptions);
};

// --------------------------------------EXPORT
module.exports = { sendEmail };
