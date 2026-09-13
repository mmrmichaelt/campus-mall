import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(7).optional().or(z.literal("")),
  password: z.string().min(8),
  name: z.string().min(2),
  countryCode: z.string().min(2),
  university: z.string().min(2),
  accountType: z.enum(["STUDENT", "OUTSIDER"])
});

export const listingSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  category: z.string().min(2),
  condition: z.string().min(2),
  brand: z.string().optional(),
  pictureUrl: z.string().url().optional().or(z.literal("")),
  price: z.coerce.number().nonnegative(),
  location: z.string().min(2)
});
