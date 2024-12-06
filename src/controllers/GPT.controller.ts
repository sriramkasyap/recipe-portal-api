import dotenv from "dotenv";
import OpenAI from "openai";
import { ResponseFormatJSONSchema } from "openai/resources/index.mjs";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default class GPTController {
  static generateDataFromPrompt = async (
    system_prompt: string,
    user_prompt: string,
    schema: ResponseFormatJSONSchema["json_schema"]
  ): Promise<any | null> => {
    console.log({ system_prompt, user_prompt, schema });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: system_prompt,
        },
        {
          role: "user",
          content: user_prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: schema,
      },
    });

    if (!completion.choices[0].message.content) return null;

    return JSON.parse(completion.choices[0].message.content);
  };
}
