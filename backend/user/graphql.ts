import { buildSchema, GraphQLSchema } from "graphql";
import * as Boom from "@hapi/boom";
import * as user from "./user";
import { User, Role, JWT } from "./types";

const schema: GraphQLSchema = buildSchema(`
  enum Role {
    admin
  	user
  }

  type User {
    userId: ID!
  	email: String!
  	name: String!
  	role: Role!
  }

  input CreateUser {
    password: String!
    email: String!
    name: String!
    role: Role!
  }

  input UpdateUser {
    password: String
    email: String!
    name: String!
    role: Role!
  }

  input PatchUser {
    password: String
    email: String
    name: String
    role: Role
  }

  type Query {
    retrieve(userId: ID!): User
    list(skip: Int, limit: Int): [User!]
  }

  type Mutation {
    create(createUser: CreateUser): User
    update(userId: ID!, updateUser: UpdateUser): User
    patch(userId: ID!, patchUser: PatchUser): User
    delete(userId: ID!): ID
  }
`);

const rootValue: object = {
	list: ({ skip, limit }: { skip: number; limit: number }, context: JWT) => {
		if (context.user && context.user.role === Role.Admin) {
			return user.list(skip, limit);
		} else {
			return Promise.reject(Boom.forbidden("Not admin user"));
		}
	},
	create: ({ createUser }: { createUser: any }, context: JWT) => {
		if (context.user && context.user.role === Role.Admin) {
			return user.create(createUser);
		} else {
			return Promise.reject(Boom.forbidden("Not admin user"));
		}
	},
	retrieve: ({ userId }: { userId: string }, context: JWT) => {
		console.log("userId=", userId);
		if (
			(context.user && context.user.role === Role.Admin) ||
			context.user.userId === userId
		) {
			return user.retrieve(userId);
		} else {
			return Promise.reject(Boom.forbidden("Users can only get themselves"));
		}
	},
	update: (
		{ userId, updateUser }: { userId: string; updateUser: any },
		context: JWT
	) => {
		console.log("update user=", updateUser, typeof updateUser);
		let err;
		if (context.user && context.user.role === Role.Admin) {
			// carry on
		} else if (context.user && context.user.userId !== userId) {
			err = Boom.forbidden("Users can only change themselves");
		} else if (context.user && updateUser.role !== context.user.role) {
			err = Boom.forbidden("Users cannot modify role");
		}
		if (err) {
			return Promise.reject(err);
		} else {
			return user.update(userId, updateUser);
		}
	},
	patch: (
		{ userId, patchUser }: { userId: string; patchUser: any },
		context: JWT
	) => {
		console.log("patchUser user=", patchUser, typeof patchUser);
		if (context.user && context.user.role === Role.Admin) {
			return user.patch(userId, patchUser);
		} else {
			return Promise.reject(Boom.forbidden("Not admin user"));
		}
	},
	delete: ({ userId }: { userId: string }, context: JWT) => {
		if (context.user && context.user.role === Role.Admin) {
			return user.del(userId).then(() => {
        return Promise.resolve(userId);
      });
		} else {
			return Promise.reject(Boom.forbidden("Not admin user"));
		}
	}
};

export { schema, rootValue };
