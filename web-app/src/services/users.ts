import api from "@/lib/api";
import { UserProps } from "@/types";

export interface ApiUser {
	id: number;
	username: string;
	email: string;
	role?: string;
	profile_image?: string | null;
}

const ROLE_LABELS: Record<string, string> = {
	AD: "Admin",
	MA: "Manager",
	OP: "Operation Manager",
	FI: "Finance Officer",
	LO: "Loan Officer",
	AC: "Accountant",
};

export const getRoleDisplayLabel = (role?: string): string => {
	if (!role) return "";
	return ROLE_LABELS[role] ?? role;
};

export const normalizeUser = (
	user: ApiUser,
): UserProps & { id: number; role?: string } => ({
	id: user.id,
	username: user.username,
	email: user.email,
	role: user.role,
	profile_image: user.profile_image ?? null,
	profile: {
		role_display: getRoleDisplayLabel(user.role),
		profile_image: user.profile_image ?? null,
	},
});

export const usersService = {
	getUsers: () =>
		(api.get("/auth/users") as Promise<ApiUser[]>).then((users) =>
			users.map(normalizeUser),
		),

	getUserById: (userId: string | number) =>
		(api.get(`/auth/users/${userId}`) as Promise<ApiUser>).then(normalizeUser),
};
