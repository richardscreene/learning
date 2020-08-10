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
	hash?: string;
}

export interface Credentials {
	refreshToken?: string;
	accessToken: string;
}

export interface JWT {
	token: string;
	user: User;
}
