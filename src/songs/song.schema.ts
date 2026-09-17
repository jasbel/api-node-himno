// song.schema.ts
import { z } from '@hono/zod-openapi';

export const IdParamsSchema = z.object({
  id: z.string().min(1).openapi({
    param: { name: 'id', in: 'path' },
    example: 'song-123',
  }),
});

export const ParagraphSchema = z
  .object({
    id: z.string().openapi({ example: 'p1' }),
    paragraph: z.string().openapi({ example: 'Verse text' }),
    chorusPos: z
      .array(z.tuple([z.union([z.number(), z.string()]), z.number().optional()]))
      .openapi({
        description: 'Chorus references: [paragraph position or chorus id, optional repeat count]',
      }),
  })
  .openapi('Paragraph');

export const ChoirSchema = z
  .object({
    id: z.string().openapi({ example: 'c1' }),
    choir: z.string().openapi({ example: 'Chorus text' }),
  })
  .openapi('Choir');

export const SongCreateSchema = z
  .object({
    code: z.string().openapi({ example: 'H-001' }),
    title: z.string().openapi({ example: 'Amazing Grace' }),
    musicalNote: z.string().openapi({
      description:
        'Musical note. Known values: _, G|Sol, A|La, C|Do, D|Re, E|Mi, B|Si, F|Fa, F#|Fa#, C/D|Do-Re',
      example: 'G|Sol',
    }),
    paragraphs: z.union([z.array(ParagraphSchema), z.string()]).openapi({
      description: 'Structured paragraphs, or a raw JSON string for legacy clients',
    }),
    chorus: z.array(ChoirSchema),
  })
  .openapi('SongCreate');

export const SongSchema = SongCreateSchema.extend({
  id: z.string().openapi({ example: 'song-123' }),
}).openapi('Song');

export const ErrorSchema = z.object({ error: z.string() }).openapi('Error');

export const MessageSchema = z.object({ message: z.string() }).openapi('Message');
