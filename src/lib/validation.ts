import { z } from "zod";

const phoneRegex = /^\+?[1-9]\d{7,14}$/;

const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "Email address is too long")
  .optional()
  .or(z.literal(""))
  .transform((value) => value || undefined);

const optionalPhone = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || phoneRegex.test(value), "Enter a valid phone number")
  .transform((value) => value || undefined);

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters").max(100, "Name is too long"),
  country: z.string().trim().min(2, "Please select a country").max(100, "Country is too long"),
  university: z.string().trim().max(200, "University/college name is too long").optional().default(""),
  accountType: z.enum(["STUDENT", "OUTSIDER"]),
  phone: optionalPhone,
  email: optionalEmail,
  password: z.string().min(8, "Password must contain at least 8 characters").max(128, "Password is too long"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).superRefine((data, ctx) => {
  if (!data.email && !data.phone) {
    ctx.addIssue({
      code: "custom",
      path: ["email"],
      message: "Enter an email address, a phone number, or both.",
    });
  }
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: "custom",
      path: ["confirmPassword"],
      message: "Passwords do not match",
    });
  }
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email address or phone number"),
  password: z.string().min(1, "Password is required"),
});

export const verificationSchema = z.object({
  type: z.enum(["EMAIL", "PHONE"]),
  code: z.string().trim().regex(/^\d{6}$/, "Verification code must contain 6 digits"),
});

export const sendVerificationCodeSchema = z.object({
  type: z.enum(["EMAIL", "PHONE"]),
});

export const listingSchema = z.object({
  title: z.string().trim().min(2, "Title must contain at least 2 characters").max(150, "Title is too long"),
  description: z.string().trim().min(5, "Description must contain at least 5 characters").max(5000, "Description is too long"),
  price: z.coerce.number().finite().nonnegative("Price cannot be negative"),
  currency: z.string().trim().min(3).max(5).default("KES"),
  category: z.string().trim().min(2, "Please select a category").max(50, "Category is too long"),
  institution: z.string().trim().min(2, "Please select the institution for this item").max(200, "Institution name is too long"),
  imageUrl: z.string().trim().url("Image URL must be valid").optional().or(z.literal("")),
  imageUrls: z.array(z.string().url("Each photo must be a valid uploaded image URL")).max(5, "You can upload up to 5 photos").optional().default([]),
  location: z.string().trim().min(2, "Location is required").max(200, "Location is too long"),
  details: z.object({
    brand: z.string().trim().max(100).optional(),
    model: z.string().trim().max(100).optional(),
    condition: z.string().trim().max(50).optional(),
    conditionNotes: z.string().trim().max(500).optional(),
    color: z.string().trim().max(50).optional(),
    size: z.string().trim().max(50).optional(),
    material: z.string().trim().max(100).optional(),
    quantity: z.coerce.number().int().min(1).max(100000).optional(),
    year: z.coerce.number().int().min(1900).max(2100).optional(),
    warranty: z.string().trim().max(200).optional(),
    negotiable: z.boolean().optional(),
    delivery: z.string().trim().max(100).optional(),
    tags: z.string().trim().max(300).optional(),
  }).optional().default({}),
});

export const messageSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required"),
  receiverId: z.string().min(1, "Receiver ID is required"),
  body: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message is too long"),
});

export const settingsSchema = z.object({
  emailAlerts: z.boolean(),
  messageAlerts: z.boolean(),
  marketing: z.boolean(),
  publicProfile: z.boolean(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerificationInput = z.infer<typeof verificationSchema>;
export type ListingInput = z.infer<typeof listingSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
