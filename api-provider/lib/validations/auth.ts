import { z } from 'zod';
import zxcvbn from 'zxcvbn';

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(100, 'Le nom est trop long'),

    email: z
      .string()
      .email('Email invalide')
      .max(320) // RFC 5321
      .toLowerCase()
      .trim(),

    password: z
      .string()
      .min(12, 'Le password doit contenir au moins 12 caractères')
      .max(128)
      .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
      .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
      .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
      .refine(
        (password) => {
          const result = zxcvbn(password);
          return result.score >= 3; // Strong (0-4 scale)
        },
        {
          message:
            'Password trop faible. Utilisez un mélange de lettres, chiffres et symboles',
        }
      ),
  });

export const loginSchema = z.object({
  email: z.string().email('Email invalide').toLowerCase().trim(),
  password: z.string().min(1, 'Password requis'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide').toLowerCase().trim(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token invalide'),
    password: z
      .string()
      .min(12, 'Le password doit contenir au moins 12 caractères')
      .max(128)
      .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
      .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
      .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
      .refine((password) => zxcvbn(password).score >= 3, {
        message: 'Password trop faible',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les passwords ne correspondent pas',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
