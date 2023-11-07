import nodemailer from "nodemailer"

const sendMail = async (to: string, subject: string, html: string) => {
	try {
		const transporter = nodemailer.createTransport({
			service: "gmail",
			host: process.env.EMAIL_HOST,
			port: Number(process.env.EMAIL_PORT),
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		})

		await transporter.sendMail({
			from: process.env.EMAIL_USER,
			to,
			subject,
			html,
		})
	} catch (error) {
		console.error(error)
	}
}

export default sendMail