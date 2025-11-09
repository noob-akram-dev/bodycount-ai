
'use server';

/**
 * @fileOverview Generates a fictional body count and a funny dating suggestion based on a username.
 *
 * - generateBodyCount - A function that generates the body count and suggestion.
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
  datingSuggestion: z.string().describe('A funny, personal suggestion on whether to date the person.'),
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

The body count should be a random number between 1 and 20, influenced by the presence of violent or religious keywords in the username.

After generating the body count, provide a short, funny, and personal dating suggestion based on that number.
- For a low count (0-5), suggest they are a keeper or new to the game.
- For a medium count (6-15), suggest they are experienced but maybe a risk.
- For a high count (16-20), make a joke about them being a legend or a professional.

Example: For a body count of 2, the suggestion could be "This one's practically brand new. Handle with care, or don't."
Example: For a body count of 18, the suggestion could be "You've found a legend. You're not just a chapter in their book; you're a footnote."

Use the keywordInfluence tool to determine how much the body count should be modified based on the username.

This is for entertainment purposes only. The output should not include any disclaimer.
`,
});

const generateBodyCountFlow = ai.defineFlow(
  {
    name: 'generateBodyCountFlow',
    inputSchema: GenerateBodyCountInputSchema,
    outputSchema: GenerateBodyCountOutputSchema,
  },
  async input => {
    const username = input.username.toLowerCase();
    if (username === '@akram__.shaikh' || username === '@ridd.jain') {
      return { bodyCount: 0, datingSuggestion: "A perfect score of zero! This one is a certified keeper. A rare find, indeed!" };
    }
    if (username === '@sohawho') {
      const sohaValues = [56, 79, 26, 27];
      const randomIndex = Math.floor(Math.random() * sohaValues.length);
      const bodyCount = sohaValues[randomIndex];
      let datingSuggestion = "You're dealing with a celestial event. This isn't a body count, it's a high score. Good luck, soldier.";
      if (bodyCount < 30) {
        datingSuggestion = "A modest legend. They've seen a thing or two, but there are still worlds to conquer. Maybe one of them is yours."
      }
      return { bodyCount, datingSuggestion };
    }


    const {output} = await generateBodyCountPrompt(input);

    if (!output || !output.datingSuggestion || output.bodyCount < 1 || output.bodyCount > 20) {
      // Handle the case where the LLM call fails or returns no output
      const keywordInfluence = await keywordInfluenceTool(input);
      const baseBodyCount = Math.floor(Math.random() * 20) + 1; // Base random number 1-20
      const modifiedBodyCount = baseBodyCount * keywordInfluence.violenceModifier * keywordInfluence.religionModifier;
      
      let finalBodyCount = Math.floor(modifiedBodyCount);
      if (finalBodyCount > 20) {
        finalBodyCount = 20;
      }
      if (finalBodyCount < 1) {
        finalBodyCount = 1;
      }
      
      let datingSuggestion = "The AI is speechless. This person transcends numbers. Proceed with a mix of awe and terror.";
       if (finalBodyCount <= 5) {
        datingSuggestion = "This one's a keeper! Or just really good at hiding their tracks. Proceed with cautious optimism.";
      } else if (finalBodyCount <= 15) {
        datingSuggestion = "A seasoned veteran. They know the ropes. Expect good stories, but maybe don't introduce them to your parents just yet.";
      } else {
        datingSuggestion = "You've got a pro on your hands. This isn't their first rodeo. Or their tenth. Buckle up, buttercup.";
      }

      return { bodyCount: finalBodyCount, datingSuggestion };
    }

    return output;
  }
);
