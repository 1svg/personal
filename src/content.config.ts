import { glob } from 'astro/loaders'
import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'

const user = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/user' }),
  schema: z.object({
    name: z.string(),
    pronouns: z.string().optional(),
    avatar: z.url().or(z.string().startsWith('/')),
    bio: z.string().optional(),
    mail: z.email().optional(),
    website: z.url().optional(),
    twitter: z.url().optional(),
    github: z.url().optional(),
    linkedin: z.url().optional(),
    discord: z.url().optional(),
    letterboxd: z.url().optional(),
  }),
})

const workshop = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/workshop' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    icon: z.string().optional(),
    draft: z.boolean().optional(),
  }),
})

export const collections = { user, workshop }
