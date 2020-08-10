import { promisify } from "util";
import * as Boom from "@hapi/boom";
import * as jwt from "jsonwebtoken";
import * as logger from "./logger";
import { Request, Response, NextFunction } from "express";
import { User, Role, JWT } from "./types";

const JWT_SECRET: string = process.env.JWT_SECRET || "DUMMY_SECRET";
const AUTH_REGEX: RegExp = /^Bearer\s+(.+)/;
const JWT_ALGORITHM: string = "HS256";

// used for generating both user and reset tokens so we'll accept any old object
export function sign(obj: object, expiresIn: string): Promise<string> {
	return promisify(jwt.sign)(obj, JWT_SECRET, {
		expiresIn,
		algorithm: JWT_ALGORITHM
	});
}

export function verify(token: string): Promise<User> {
	return promisify(jwt.verify)(token, JWT_SECRET).catch(err => {
		console.log("err.name=", err.name);
		switch (err.name) {
		case "TokenExpiredError":
		case "JsonWebTokenError":
		case "NotBeforeError":
			return Promise.reject(Boom.unauthorized("Invalid JWT"));
		default:
			return Promise.reject(err);
		}
	});
}

export function parseAuthorization(authHeader: string): Promise<string> {
	if (!authHeader) {
		return Promise.reject(Boom.unauthorized("No authorization header"));
	}

	let parts = authHeader.match(AUTH_REGEX);
	if (!parts) {
		return Promise.reject(
			Boom.unauthorized("Badly formed authorization header")
		);
	} else {
		return Promise.resolve(parts[1]);
	}
}

function getToken(req: Request): Promise<string> {
	let authHeader = req.headers["authorization"];
	return parseAuthorization(authHeader);
}

export function parseToken(req: Request): Promise<JWT> {
	let result: JWT = <JWT>{};
	return getToken(req)
		.then(token => {
			result.token = token;
			return verify(token);
		})
		.then((user: User) => {
			result.user = user;
			return Promise.resolve(result);
		});
}

export function isAccessValid(req: Request, res: Response, next: NextFunction) {
	parseToken(req)
		.then((result: JWT) => {
			res.locals.token = result.token;
			// if the token contains an email field then we know its an access token
			if (result.user && result.user.email) {
				res.locals.user = result.user;
				next();
			} else {
				next(Boom.unauthorized("Bad token supplied"));
			}
		})
		.catch(next);
}

export function isRefreshValid(
	req: Request,
	res: Response,
	next: NextFunction
) {
	return parseToken(req)
		.then((result: JWT) => {
			res.locals = { ...res.locals, result };
			next();
		})
		.catch(next);
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
	parseToken(req)
		.then((result: JWT) => {
			res.locals.token = result.token;
			// if the token contains an email field then we know its an access token
			if (result.user && result.user.role === Role.Admin) {
				res.locals.user = result.user;
				next();
			} else {
				next(Boom.forbidden("Not admin user"));
			}
		})
		.catch(next);
}
