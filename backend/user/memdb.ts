// Mock file so we can replicate simple mongodb functionality
// as an in-memory store.  This means we can greatly ease
// deployment for non-expert users.
// NB. this is not a full implementation of mongoDb and is likely
// to contain many holes!!!!

import * as logger from "./logger";
import { ObjectID } from "mongodb";

interface Filter {
	_id?: string;
	email?: string;
}

class Cursor {
	private list: object[] = [];

	constructor(list: object[]) {
		logger.debug("Create cursor", { list });
		this.list = list;
	}

	toArray(): Promise<object[]> {
		return Promise.resolve(this.list);
	}
}

class Collection {
	private docs: object = {};

	constructor(name: string) {
		logger.debug("Create collection", { name });
	}

	createIndexes(indices: Array<object>): Promise<any> {
		return Promise.resolve();
	}

	private get(filter: Filter): string {
		let id: string;
		if (filter._id) {
			id = filter._id;
		} else if (filter.email) {
			id = Object.keys(this.docs).find((myId: string) => {
				return !this.docs[myId].email.localeCompare(filter.email, undefined, { sensitivity: 'base'})
			});
		} else {
			id = null;
		}
		return id;
	}

	private modify(id: string, update: object): Promise<object> {
		if (update["$set"]) {
			Object.keys(update["$set"]).forEach(key => {
				this.docs[id][key] = update["$set"][key];
			});
		}
		if (update["$unset"]) {
			Object.keys(update["$unset"]).forEach(key => {
				delete this.docs[id][key];
			});
		}
		return Promise.resolve({ ...this.docs[id] });
	}

	insertOne(doc: object): Promise<object> {
		let id = ObjectID();
		this.docs[id] = { ...doc, _id: id };
		return Promise.resolve({ insertedCount: 1, ops: [{ ...this.docs[id] }] });
	}

	findOne(
		filter: Filter,
		options?: { collation: object }
	): Promise<object | void> {
		let id = this.get(filter);
		if (id && this.docs[id]) {
			return Promise.resolve({ ...this.docs[id] });
		} else {
			return Promise.resolve();
		}
	}

	updateOne(
		filter: Filter,
		update: object,
		options: { upsert: boolean }
	): Promise<object | void> {
		let id: string;
		if (filter._id) {
			return this.modify(filter._id, update);
		} else if (filter.email) {
			let id = this.get(filter);
			if (id) {
				return this.modify(id, update);
			} else if (options && options.upsert) {
				return this.insertOne(update["$set"]);
			} else {
				return Promise.resolve();
			}
		} else {
			return Promise.resolve();
		}
	}

	findOneAndUpdate(
		filter: Filter,
		update: object,
		options: { returnOriginal: boolean }
	): Promise<object | void> {
		let id = this.get(filter);

		if (id && this.docs[id]) {
			return this.modify(id, update).then(doc => {
				return Promise.resolve({ ok: 1, value: { ...doc } });
			});
		} else {
			return Promise.resolve();
		}
	}

	find(filter: Filter, options: { skip?: number; limit?: number }): Cursor {
		let docs = Object.values(this.docs);
		let start = options.skip || 0;
		let end = options.limit ? options.limit + start - 1 : docs.length;

		// shallow copy each entry in output list
		let list = docs.slice(start, end).map(doc => {
			return { ...doc };
		});

		return new Cursor(list);
	}

	deleteOne(filter: Filter) {
		let n = 0;
		let id = this.get(filter);

		if (id && this.docs[id]) {
			delete this.docs[id];
			n = 1;
		}
		return Promise.resolve({ result: { n } });
	}
}

class Database {
	private collections: object = {};
	constructor(name: string) {
		logger.debug("Create database", { name });
	}

	createCollection(name: string): Promise<Collection> {
		if (!this.collections[name]) {
			this.collections[name] = new Collection(name);
		}
		return Promise.resolve(this.collections[name]);
	}
}

export const MemClient = {
	connect: (url: string, config: object): Promise<object> => {
		return Promise.resolve({
			db: (name: string): Database => {
				return new Database(name);
			}
		});
	}
};
