export interface Auth {
	hash: string;
}

export const enum Role {
	Admin = "admin",
	User = "user"
}

export interface User {
	userId?: string;
	email?: string;
	name?: string;
	role?: Role;
	//TODO - move tokens to auth
	refreshToken?: string;
	resetToken?: string;
	auth?: Auth;
}

export interface Credentials {
	refreshToken?: string;
	accessToken: string;
}

export interface JWT {
	token: string;
	user: User;
}
