import OpenAI from "openai";

const openai = new OpenAI({apiKey: process.env.EXPO_PUBLIC_OPEN_AI_KEY});

export async function main(transcript) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          "role": "system", 
          "content": "When given a large transcript text from a podcast, convert it to a chronological list of relevant topics talked about using topic segmentation. Topics should not overlap in the sentences they cover. For example, “topic 1” would cover sentences 1 to 12, “topic 2” would cover sentences 13 to 26, etc. Make sure the first topic starts with the first sentence of the transcript. If there is an intro section that just introduces the people, just title it 'Intro'. If there is a sponsors section, just title it 'Sponsors' In the outline for each segment, include the topic itself, the starting sentence, and some descriptive notes/bullet points discussed in the topic. Each topic should cover at least 10 sentences of transcript material. Make sure the starting sentence is directly copied from the transcript(Don't change puncuation, spelling, anything). JSON Format, no backticks, no 'json' keyword."
        },
        {
          "role": "user", 
          "content": transcript
        }
      ],
      model: "gpt-4o-mini",
    });

    const json = JSON.parse(completion.choices[0].message.content);

    //const startingSentences = json.map((topic) => topic.starting_sentence);

    console.log(JSON.stringify(json, null, 2));
  } catch (error) {
    console.error("Error during OpenAI API call:", error);
  }
}

