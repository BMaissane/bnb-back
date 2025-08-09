import { user, UserType } from '@prisma/client';

export type MockUser = Partial<user> & {
  id: number;
  email: string;
  first_name: string;
  type_user: UserType;
};