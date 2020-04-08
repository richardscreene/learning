export interface Auth {
	hash: string;
	salt: string;
	iterations: number;
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
	refreshToken?: string;
	resetToken?: string;
	auth?: Auth;
}

export interface Credentials {
	refreshToken?: string;
	accessToken: string;
}
