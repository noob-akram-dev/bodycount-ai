
'use server';

/**
 * @fileOverview Generates a fictional body count based on a username, influenced by violent or religious keywords.
 *
 * - generateBodyCount - A function that generates the body count.
 * - GenerateBodyCountInput - The input type for the generateBodyCount function.
 * - GenerateBodyCountOutput - The return type for the generateBodyCount function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBodyCountInputSchema = z.object({
  username: z.string().describe('The username of the individual.'),
});
export type GenerateBodyCountInput = z.infer<typeof GenerateBodyCountInputSchema>;

const GenerateBodyCountOutputSchema = z.object({
  bodyCount: z.number().describe('The fictional body count generated for the username.'),
});
export type GenerateBodyCountOutput = z.infer<typeof GenerateBodyCountOutputSchema>;

export async function generateBodyCount(input: GenerateBodyCountInput): Promise<GenerateBodyCountOutput> {
  return generateBodyCountFlow(input);
}

const keywordInfluenceTool = ai.defineTool(
  {
    name: 'keywordInfluence',
    description: 'Determines the influence of keywords (violent or religious) on the body count.',
    inputSchema: z.object({
      username: z.string().describe('The username to analyze for keywords.'),
    }),
    outputSchema: z.object({
      violenceModifier: z.number().describe('Modifier based on violent keywords.'),
      religionModifier: z.number().describe('Modifier based on religious keywords.'),
    }),
  },
  async (input) => {
    const username = input.username.toLowerCase();
    let violenceModifier = 1;
    let religionModifier = 1;

    const violentKeywords = ['killer', 'destroyer', 'assassin', 'murder', 'slayer'];
    const religiousKeywords = ['god', 'jesus', 'allah', 'buddha', 'holy', 'saint'];

    if (violentKeywords.some(keyword => username.includes(keyword))) {
      violenceModifier = 2; // Increase body count more for violent usernames
    }

    if (religiousKeywords.some(keyword => username.includes(keyword))) {
      religionModifier = 1.5; // Slightly increase for religious usernames
    }

    return {violenceModifier, religionModifier};
  }
);


const generateBodyCountPrompt = ai.definePrompt({
  name: 'generateBodyCountPrompt',
  input: {schema: GenerateBodyCountInputSchema},
  output: {schema: GenerateBodyCountOutputSchema},
  tools: [keywordInfluenceTool],
  prompt: `Given the username {{{username}}}, generate a fictional body count for entertainment purposes only. 

The body count should be a random number, but influenced by the presence of violent or religious keywords in the username.

Use the keywordInfluence tool to determine how much the body count should be modified based on the username.

Always generate a disclaimer, the model output should not include the disclaimer.
`,
});

const generateBodyCountFlow = ai.defineFlow(
  {
    name: 'generateBodyCountFlow',
    inputSchema: GenerateBodyCountInputSchema,
    outputSchema: GenerateBodyCountOutputSchema,
  },
  async input => {
    if (input.username.toLowerCase() === '@akram__.shaikh') {
      return { bodyCount: 0 };
    }

    const {output} = await generateBodyCountPrompt(input);

    if (!output) {
      // Handle the case where the LLM call fails or returns no output
      const keywordInfluence = await keywordInfluenceTool(input);
      const baseBodyCount = Math.floor(Math.random() * 100); // Base random number
      const modifiedBodyCount = baseBodyCount * keywordInfluence.violenceModifier * keywordInfluence.religionModifier;
      return { bodyCount: Math.floor(modifiedBodyCount) };
    }

    return output;
  }
);
