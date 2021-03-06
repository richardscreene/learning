import { join } from "path";

const serverless = require("serverless-http");
import * as express from "express";
import { Application, Request, Response, NextFunction } from "express";
const app: Application = express();
import * as bodyParser from "body-parser";
import * as Boom from "@hapi/boom";
import { OpenApiValidator } from "express-openapi-validator";
import * as cors from "cors";
import { User, Credentials, JWT } from "./types";
import { graphqlHTTP } from "express-graphql";
import * as logger from "./logger";
import * as user from "./user";
import * as db from "./db";
import * as authenticate from "./authenticate";
import { schema, rootValue } from "./graphql";

const SPEC_FILE: string = join(__dirname, "api.json");

app.use(bodyParser.json());

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));

function isDbReady(req: Request, res: Response, next: NextFunction) {
	if (db.ready()) {
		next();
	} else {
		next(Boom.serverUnavailable("Database is not ready"));
	}
}

app.use(isDbReady);

app.use(
	"/graphql",
	graphqlHTTP((req: Request) => {
		return authenticate.parseToken(req).then((jwt: JWT) => {
			return Promise.resolve({
				schema,
				rootValue,
				graphiql: process.env.NODE_ENV === "development",
				context: jwt
			});
		});
	})
);

new OpenApiValidator({
	apiSpec: SPEC_FILE,
	validateRequests: true,
	validateResponses: true
}).installSync(app);

app.put("/login", (req: Request, res: Response, next: NextFunction) => {
	user
		.login(req.body)
		.then((credentials: Credentials) => {
			res.json(credentials);
		})
		.catch(next);
});

app.put(
	"/refresh",
	authenticate.isRefreshValid,
	(req: Request, res: Response, next: NextFunction) => {
		user
			.refresh(res.locals.user.userId, res.locals.token)
			.then((credentials: Credentials) => {
				res.json(credentials);
			})
			.catch(next);
	}
);

app.post("/register", (req: Request, res: Response, next: NextFunction) => {
	user
		.register(req.body)
		.then((credentials: Credentials) => {
			res.json(credentials);
		})
		.catch(next);
});

app.put("/forgot", (req: Request, res: Response, next: NextFunction) => {
	user
		.forgot(req.body.email)
		.then(() => {
			res.send();
		})
		.catch(next);
});

app.put(
	"/reset/:resetToken",
	(req: Request, res: Response, next: NextFunction) => {
		user
			.reset(req.params.resetToken, req.body.password)
			.then((credentials: Credentials) => {
				res.json(credentials);
			})
			.catch(next);
	}
);

app.post(
	"/logout",
	authenticate.isRefreshValid,
	(req: Request, res: Response, next: NextFunction) => {
		return user
			.logout(res.locals.user.userId, res.locals.token)
			.then(() => {
				res.end();
			})
			.catch(next);
	}
);

app.put(
	"/password",
	authenticate.isRefreshValid,
	(req: Request, res: Response, next: NextFunction) => {
		return user
			.password(res.locals.user.userId, req.body.password)
			.then((credentials: Credentials) => {
				res.json(credentials);
			})
			.catch(next);
	}
);


// NB. THE USER REST ROUTES ARE DEPRECATED - USE GRAPHQL


app.post(
	"/users",
	authenticate.isAdmin,
	(req: Request, res: Response, next: NextFunction) => {
		user
			.create(req.body)
			.then((user: User) => {
				res.json(user);
			})
			.catch(next);
	}
);

app.get(
	"/users/:userId",
	authenticate.isAccessValid,
	(req: Request, res: Response, next: NextFunction) => {
		if (res.locals.user.role === "admin") {
			next();
		} else if (res.locals.user.userId === req.params.userId) {
			next();
		} else {
			next(Boom.forbidden("Users can only get themselves"));
		}
	},
	(req: Request, res: Response, next: NextFunction) => {
		user
			.retrieve(req.params.userId)
			.then((user: User) => {
				res.json(user);
			})
			.catch(next);
	}
);

app.put(
	"/users/:userId",
	authenticate.isAccessValid,
	(req: Request, res: Response, next: NextFunction) => {
		if (res.locals.user.role === "admin") {
			next();
		} else if (res.locals.user.userId !== req.params.userId) {
			next(Boom.forbidden("Users can only change themselves"));
		} else if (req.body.role !== res.locals.user.role) {
			next(Boom.forbidden("Users cannot modify role"));
		} else {
			next();
		}
	},
	(req: Request, res: Response, next: NextFunction) => {
		user
			.update(req.params.userId, req.body)
			.then((user: User) => {
				res.json(user);
			})
			.catch(next);
	}
);

app.delete(
	"/users/:userId",
	authenticate.isAdmin,
	(req: Request, res: Response, next: NextFunction) => {
		user
			.del(req.params.userId)
			.then(() => {
				res.send();
			})
			.catch(next);
	}
);

app.patch(
	"/users/:userId",
	authenticate.isAdmin,
	(req: Request, res: Response, next: NextFunction) => {
		user
			.patch(req.params.userId, req.body)
			.then((user: User) => {
				res.json(user);
			})
			.catch(next);
	}
);

app.get(
	"/users",
	authenticate.isAdmin,
	(req: Request, res: Response, next: NextFunction) => {
		user
			.list(Number(req.query.skip), Number(req.query.limit))
			.then(users => {
				res.json(users);
			})
			.catch(next);
	}
);

// eslint-disable-next-line no-unused-vars
app.use((err, req: Request, res: Response, next: NextFunction) => {
	if (!Boom.isBoom(err)) {
		res.status(500).send(err.message);
	} else {
		res.status(err.output.statusCode).send(err.message);
	}
});

const handler = serverless(app, {
	request: (req, event, context) => {
		context.callbackWaitsForEmptyEventLoop = false;
	}
});

export { app, handler };
