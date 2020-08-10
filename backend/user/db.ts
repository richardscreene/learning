import * as logger from "./logger";
import { MongoClient, ObjectID } from "mongodb";
import { MemClient } from "./memdb";

import { User, Role } from "./types";
import * as Boom from "@hapi/boom";

const DB_NAME: string = "redux-learning";
const MONGO_URL: string = process.env.MONGO_URL;
let dbo, collection;
let isReady: boolean = false;

let DbClient;
if (MONGO_URL) {
	DbClient = MongoClient;
} else {
	DbClient = MemClient;
}

const COLLATION: object = { locale: "en", strength: 2 };
const ADMIN_USER: User = {
	email: "bob@example.com",
	name: "Bob Example",
	role: Role.Admin,
	// password is "12345678"
	hash: "$2b$10$jqS1iWmEmxXwjaLr1qCWL.J96cZUFy7CxrwgIcpW6WKwLzpg2jpei"
};

DbClient.connect(MONGO_URL, {
	useUnifiedTopology: true,
	useNewUrlParser: true,
	reconnectTries: Number.MAX_VALUE,
	reconnectInterval: 500,
	connectTimeoutMS: 10000,
	socketTimeoutMS: 45000
})
	.then(myDb => {
		logger.info("Connected to mongo");

		dbo = myDb.db(DB_NAME);
		return dbo.createCollection("users");
	})
	.then(myCollection => {
		collection = myCollection;
		return collection.createIndexes([
			{
				key: { email: 1 },
				unique: true,
				collation: COLLATION
			}
		]);
	})
	.then(() => {
		// create dummy admin user if it doesn't already exist
		//LATER - we shouldn't do this....
		return collection.updateOne(
			{ email: ADMIN_USER.email },
			{ $set: ADMIN_USER },
			{ upsert: true }
		);
	})
	.then(() => {
		isReady = true;
	})
	.catch(err => {
		logger.error("Failed to connect to mongo", { err });
	});

function fromDb(obj: any): User {
	obj.userId = obj._id.toString();
	delete obj._id;
	return obj as User;
}

export function findByEmail(email: string): Promise<User> {
	return collection
		.findOne({ email }, { collation: COLLATION })
		.then((obj: object) => {
			if (obj) {
				return Promise.resolve(fromDb(obj));
			} else {
				return Promise.reject(Boom.notFound("User not found"));
			}
		});
}

export function insertOne(user: User): Promise<User> {
	return collection
		.insertOne(user)
		.then(result => {
			if (result && result.insertedCount === 1) {
				// include the userId in the result
				return Promise.resolve(fromDb(result.ops[0]));
			} else {
				return Promise.reject(Boom.badImplementation("Nothing inserted"));
			}
		})
		.catch(err => {
			if (err.code === 11000) {
				return Promise.reject(Boom.conflict("User already exists"));
			} else {
				return Promise.reject(err);
			}
		});
}

export function list(skip: number, limit: number): Promise<Array<User>> {
	return collection
		.find(
			{},
			{
				skip,
				limit
			}
		)
		.toArray()
		.then(list => {
			return Promise.resolve(
				list.map(
					(obj: object): User => {
						return fromDb(obj);
					}
				)
			);
		});
}

export function findById(id: string): Promise<User> {
	return collection.findOne({ _id: ObjectID(id) }).then(result => {
		if (result) {
			return Promise.resolve(fromDb(result));
		} else {
			return Promise.reject(Boom.notFound("User not found"));
		}
	});
}

export function deleteById(id: string): Promise<void> {
	return collection.deleteOne({ _id: ObjectID(id) }).then(result => {
		if (result && result.result && result.result.n === 0) {
			return Promise.reject(Boom.notFound("User not found"));
		} else {
			return Promise.resolve();
		}
	});
}

export function updateById(
	id: string,
	setDoc: User,
	unsetDoc?: User
): Promise<User> {
	let modifier = {};
	if (setDoc) {
		modifier["$set"] = setDoc;
	}
	if (unsetDoc) {
		modifier["$unset"] = unsetDoc;
	}

	return collection
		.findOneAndUpdate({ _id: ObjectID(id) }, modifier, {
			returnOriginal: false
		})
		.then(result => {
			if (result && result.ok !== 1) {
				return Promise.reject(Boom.notFound("User not found"));
			} else {
				return Promise.resolve(fromDb(result.value));
			}
		});
}

export function ready() {
	return isReady;
}
