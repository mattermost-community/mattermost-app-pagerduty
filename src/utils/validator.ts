import { z } from 'zod';

export const AppFormValidator = z.object({
    title: z.string(),
    icon: z.string(),
    header: z.string().optional(),
    fields: z.array(z.any()).optional(),
    submit: z.object({
        path: z.string(),
        expand: z.any(),
        state: z.any().optional(),
    }),
});