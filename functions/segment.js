import OpenAI from "openai";

const openai = new OpenAI({apiKey: "sk-None-aIG2vwPzmRYQ2wXgAtCST3BlbkFJ0PtmGQaOxgA0TEYNaGwW"});

export async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{"role": "system", "content": "Your Job: When given a large transcript text from a podcast, convert it to chronological list of relevant topics talked about using topic segmentation and summarization."},
        {"role": "user", "content": "Where was it played?"}],
    model: "gpt-4o-mini",
  });

  console.log(completion.choices[0]);
}
