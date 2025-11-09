
'use server';

import { generateBodyCount, type GenerateBodyCountInput, type GenerateBodyCountOutput } from '@/ai/flows/generate-body-count';

type ActionResult = {
  bodyCount?: number;
  datingSuggestion?: string;
  error?: string;
};

export async function getBodyCountAction(input: GenerateBodyCountInput): Promise<ActionResult> {
  try {
    const result: GenerateBodyCountOutput = await generateBodyCount(input);
    if (result.bodyCount !== undefined) {
      return { bodyCount: result.bodyCount, datingSuggestion: result.datingSuggestion };
    }
    return { error: 'Failed to generate a body count.' };
  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred. Please try again later.' };
  }
}
