export interface CurrentUserDto {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  roleId: number;
  companyId: number;
  departmentId: number | null;
  status: string;
  profile_photo_url: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  otpHash: string | null;
  otpExpiresAt: string | null;
  role: string;
  company: string;
}
