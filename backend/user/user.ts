import { hash, compare } from "bcrypt";

import { promisify } from "util";

import * as Boom from "@hapi/boom";
import * as jwt from "jsonwebtoken";
import * as db from "./db";
import { User, Credentials, Role } from "./types";
import { send } from "./email-mailgun";
import * as logger from "./logger";
import { verify, sign } from "./authenticate";

const SALT_ROUNDS: number = 10;

function generateHash(password: string): Promise<string> {
	return hash(password, SALT_ROUNDS);
}

function validateHash(password: string, hash: string): Promise<void> {
	return compare(password, hash).then(result => {
		if (result) {
			return Promise.resolve();
		} else {
			return Promise.reject(Boom.unauthorized("Could not authenticate"));
		}
	});
}

function removeAuth(user: User): User {
	// we don't want to expose the auth to the client
	delete user.hash;
	delete user.refreshToken;
	delete user.resetToken;

	return user;
}

function createCredentials(user: User): Promise<Credentials> {
	let credentials: Credentials = {} as Credentials;

	return sign({ userId: user.userId }, "24h")
		.then((refreshToken: string) => {
			credentials.refreshToken = refreshToken;

			return sign(removeAuth(user), "5m");
		})
		.then((accessToken: string) => {
			credentials.accessToken = accessToken;
			return Promise.resolve(credentials);
		});
}

export function login(obj: {
	email: string;
	password: string;
}): Promise<Credentials> {
	logger.debug("login", { email: obj.email });
	let user: User;
	let credentials: Credentials;

	return db
		.findByEmail(obj.email)
		.then((myUser: User) => {
			user = myUser;
			return validateHash(obj.password, user.hash);
		})
		.then(() => {
			return createCredentials(user);
		})
		.then(myCredentials => {
			credentials = myCredentials;
			return db.updateById(user.userId, {
				refreshToken: credentials.refreshToken
			});
		})
		.then(() => {
			return Promise.resolve(credentials);
		});
}

export function refresh(
	userId: string,
	refreshToken: string
): Promise<Credentials> {
	logger.debug("refresh", { userId });

	return db
		.findById(userId)
		.then((user: User) => {
			if (user.refreshToken !== refreshToken) {
				return Promise.reject(Boom.unauthorized("Invalid token"));
			} else {
				return sign(removeAuth(user), "5m");
			}
		})
		.then((accessToken: string) => {
			return Promise.resolve({ accessToken } as Credentials);
		});
}

export function register(obj: {
	email: string;
	password: string;
	name: string;
	role: Role;
}): Promise<Credentials> {
	logger.debug("register", { obj });

	let user: User;
	let credentials: Credentials;
	return generateHash(obj.password)
		.then((hash: string) => {
			return db.insertOne({
				email: obj.email,
				name: obj.name,
				role: obj.role,
				hash
			});
		})
		.then((myUser: User) => {
			user = myUser;
			return createCredentials(user);
		})
		.then(myCredentials => {
			credentials = myCredentials;
			return db.updateById(user.userId, {
				refreshToken: credentials.refreshToken
			});
		})
		.then(() => {
			return Promise.resolve(credentials);
		});
}

export function forgot(email: string): Promise<void> {
	logger.debug("forgot email=", { email });
	let userId: string;

	return db
		.findByEmail(email)
		.then((user: User) => {
			userId = user.userId;
			return sign({ userId }, "10m");
		})
		.then((resetToken: string) => {
			return db.updateById(userId, { resetToken });
		})
		.then((user: User) => {
			return send(email, user.resetToken);
		})
		.catch(() => {
			// pretend we sent the email anyway
			return Promise.resolve();
		});
}

export function reset(
	resetToken: string,
	password: string
): Promise<Credentials> {
	logger.debug("reset", { resetToken });
	let user: User;
	let credentials: Credentials;

	return verify(resetToken)
		.then((user: User) => {
			return db.findById(user.userId);
		})
		.then((myUser: User) => {
			user = myUser;
			if (user.resetToken !== resetToken) {
				return Promise.reject(Boom.unauthorized("Invalid token"));
			} else {
				return generateHash(password);
			}
		})
		.then(hash => {
			user.hash = hash;
			return createCredentials(user);
		})
		.then(myCredentials => {
			credentials = myCredentials;
			return db.updateById(
				user.userId,
				{ hash: user.hash, refreshToken: credentials.refreshToken },
				{ resetToken: "" }
			);
		})
		.then(() => {
			return Promise.resolve(credentials);
		});
}

export function logout(userId: string, refreshToken: string): Promise<void> {
	logger.debug("logout", { userId });

	return db
		.findById(userId)
		.then((user: User) => {
			if (user.refreshToken !== refreshToken) {
				return Promise.reject(Boom.unauthorized("Invalid token"));
			} else {
				return db.updateById(userId, null, { refreshToken: "" });
			}
		})
		.then((user: User) => {
			return Promise.resolve();
		});
}

export function password(
	userId: string,
	password: string
): Promise<Credentials> {
	logger.debug("logout", { userId });
	let user: User;
	let credentials: Credentials;

	return db
		.findById(userId)
		.then((myUser: User) => {
			user = myUser;
			return generateHash(password);
		})
		.then(hash => {
			user.hash = hash;
			return createCredentials(user);
		})
		.then(myCredentials => {
			credentials = myCredentials;
			return db.updateById(user.userId, {
				hash: user.hash,
				refreshToken: credentials.refreshToken
			});
		})
		.then(() => {
			return Promise.resolve(credentials);
		});
}

export function create(obj: {
	email: string;
	password: string;
	name: string;
	role: Role;
}): Promise<User> {
	logger.debug("create", { obj });

	return generateHash(obj.password)
		.then((hash: string) => {
			let user: User = {
				email: obj.email,
				name: obj.name,
				role: obj.role,
				hash
			};
			return db.insertOne(user);
		})
		.then((user: User) => {
			return Promise.resolve(removeAuth(user));
		});
}

export function retrieve(userId: string): Promise<User> {
	logger.debug("retrieve");

	return db.findById(userId).then((user: User) => {
		return Promise.resolve(removeAuth(user));
	});
}

export function update(
	userId: string,
	obj: {
		email: string;
		password?: string;
		name: string;
		role: Role;
	}
): Promise<User> {
	logger.debug("update", { userId, obj });

	let user: User = {
		email: obj.email,
		name: obj.name,
		role: obj.role
	};

	// we don't always update the password
	if (obj.password) {
		return generateHash(obj.password)
			.then((hash: string) => {
				user.hash = hash;
				return db.updateById(userId, user);
			})
			.then((myUser: User) => {
				return Promise.resolve(removeAuth(myUser));
			});
	} else {
		return db.updateById(userId, user).then((myUser: User) => {
			return Promise.resolve(removeAuth(myUser));
		});
	}
}

export function del(userId: string): Promise<void> {
	logger.debug("del", { userId });

	return db.deleteById(userId);
}

export function patch(userId: string, obj: object): Promise<User> {
	logger.debug("patch", { userId, obj });

	return db.updateById(userId, obj).then((user: User) => {
		return Promise.resolve(removeAuth(user));
	});
}

export function list(skip: number, limit: number): Promise<Array<User>> {
	logger.debug("list", { skip, limit });

	return db.list(skip, limit).then((userList: Array<User>) => {
		if (!userList) {
			return Promise.reject(Boom.badImplementation("Failed to list users"));
		} else {
			return Promise.resolve(
				userList.map(
					(user: User): User => {
						return removeAuth(user);
					}
				)
			);
		}
	});
}
