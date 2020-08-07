import { buildSchema, GraphQLSchema } from "graphql";
//import { GraphQLSchema } from "graphql.d.ts";
import * as user from "./user";

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
    delete(userId: ID!): Boolean
  }
`);

const rootValue: object = {
	//curl -X POST -H "Content-Type: application/json" -d '{"query": "{ list(skip: 5,limit:1) { email } }"}' http://localhost:3000/graphql
	list: ({ skip, limit }: { skip: number; limit: number }) => {
		//TODO - admin only
		return user.list(skip, limit);
	},
	create: ({ createUser }: { createUser: any }) => {
		console.log("user=", createUser, typeof createUser);
		//TODO -  admin
		return user.create(createUser);
	},
	retrieve: ({ userId }: { userId: string }) => {
		console.log("userId=", userId);
		//TODO -  admin or own user only
		return user.retrieve(userId);
	},
  update: ({ userId, updateUser }: { userId: string, updateUser: any }) => {
		console.log("update user=", updateUser, typeof updateUser);
		//TODO -  admin or own user only
		return user.update(userId, updateUser);
	},
  patch: ({ userId, patchUser }: { userId: string, patchUser: any }) => {
		console.log("patchUser user=", patchUser, typeof patchUser);
		//TODO -  admin or own user only
		return user.patch(userId, patchUser);
	},
	delete: ({ userId }: { userId: string }) => {
		//TODO - is admin
		return user.del(userId);
	}
};

export { schema, rootValue };
