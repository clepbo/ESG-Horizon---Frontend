export interface AdminProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleLabel: string;
  avatarColor: string;
}

export const profileFixture: AdminProfile = {
  firstName: "Efeosasere",
  lastName: "Okoro",
  email: "efe@company.com",
  phone: "+234 123 456 7890",
  roleLabel: "Super Administrator",
  avatarColor: "#0d9488",
};
