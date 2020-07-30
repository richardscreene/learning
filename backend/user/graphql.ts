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

  type Query {
    get(userId: ID!): User
    list(skip: Int, limit: Int): [User!]
  }
`);

const rootValue: object = {
	//curl -X POST -H "Content-Type: application/json" -d '{"query": "{ list(skip: 5,limit:1) { email } }"}' http://localhost:3000/graphql
	list: ({ skip, limit }: { skip: number; limit: number }) => {
    //TODO - admin only
		return user.list(skip, limit);
	},
	get: ({ userId }: { userId: string }) => {
    console.log("userId=", userId);
    //TODO -  admin or own user only
		return user.retrieve(userId);
	}
};

export { schema, rootValue };
