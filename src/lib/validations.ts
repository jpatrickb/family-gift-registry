import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const createFamilySchema = z.object({
  name: z.string().min(1, "Family name is required").max(100),
})

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export const giftSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  price: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(parseFloat(val)),
      "Price must be a number"
    ),
  url: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.startsWith("http"),
      "URL must start with http"
    ),
  image_url: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.startsWith("http"),
      "Image URL must start with http"
    ),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type CreateFamilyInput = z.infer<typeof createFamilySchema>
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
export type GiftInput = z.infer<typeof giftSchema>
