import { z } from 'zod';

const phone = z
  .string()
  .max(30, 'Phone is too long')
  .optional()
  .or(z.literal(''));

export const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone,
  role: z.enum(['SUPER_ADMIN', 'STUDENT', 'PARENT']),
});
export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const editUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone,
});
export type EditUserFormValues = z.infer<typeof editUserSchema>;

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
