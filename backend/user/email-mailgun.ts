import { join } from "path";
import * as Boom from "@hapi/boom";
import * as mailgun from "mailgun.js";
import * as logger from "./logger";

const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
//LATER - get this from somewhere sensible
const SERVER_URL = "http://localhost:8080/reset/";

let mg;
if (!MAILGUN_DOMAIN || !MAILGUN_API_KEY) {
	logger.warn("Mailgun not configured");
} else {
	mg = mailgun.client({
		username: "api",
		key: MAILGUN_API_KEY
	});
}

export function send(email: string, token: string): Promise<void> {
	const link = join(SERVER_URL, token.replace(/\./g, ":"));

	if (!mg) {
		logger.warn("Mailgun not configured - would send email with data=", { link });
		return Promise.reject(Boom.badImplementation("Mailer not configured"));
	}

	return mg.messages
		.create(MAILGUN_DOMAIN, {
			from: `Excited User <mailgun@${MAILGUN_DOMAIN}>`,
			to: ["rscreene@yahoo.co.uk"],
			subject: "Password Reset",
			text: `Testing some Mailgun awesomness! Follow ${link}`,
			html: `<h1>Testing some Mailgun awesomness!</h1><a href="${link}">Follow me</a>`
		})
		.catch(err => {
			return Promise.reject(Boom.boomify(err, { statusCode: 500 }));
		})
		.then(result => {
			return Promise.resolve();
		});
}
