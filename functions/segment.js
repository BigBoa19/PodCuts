import OpenAI from "openai"; //comment

const openai = new OpenAI({apiKey: process.env.EXPO_PUBLIC_OPEN_AI_KEY});

export async function segment(transcript) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          "role": "system", 
          "content": "When given a large transcript text from a podcast, convert it to a chronological list of relevant topics talked about using topic segmentation. Topics should not overlap in the sentences they cover. For example, 'topic 1' would cover sentences 1 to 12, 'topic 2' would cover sentences 13 to 26, etc. If there is an intro section that just introduces the people, just title it 'Intro'. If there is a sponsors section, just title it 'Sponsors'. In the outline for each segment, include the topic itself, the starting sentence, and some descriptive notes/bullet points discussed in the topic. Each topic should cover at least 10 sentences of transcript material."
        },
        {
          "role": "system", 
          "content": "Make sure the starting sentence is directly copied from the transcript(Don't change puncuation, spelling, anything). Ensure that the starting sentence is unique and has at least five words so there are no repetitions. Exlude any filler words like 'okay', 'yeah', 'alright', etc. Also exclude commas."
        },
        {
          "role": "user", 
          "content": transcript
        }
      ],
      model: "gpt-4o-mini",
      tools: [
        {
          type: "function",
          function: {
            name: "segment_transcript",
            description: "Segment the transcript into topics with starting sentences and notes",
            parameters: {
              type: "object",
              properties: {
                topics: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      topic: { type: "string" },
                      starting_sentence: { type: "string" },
                      notes: { 
                        type: "array",
                        items: { type: "string" }
                      }
                    },
                    required: ["topic", "starting_sentence", "notes"]
                  }
                }
              },
              required: ["topics"]
            }
          },
          strict: true,
        }
      ],
      tool_choice: { type: "function", function: { name: "segment_transcript" } }
    });

    const json = JSON.parse(completion.choices[0].message.tool_calls[0].function.arguments);

    console.log("String" + JSON.stringify(json, null, 2));

    const starting_sentences = [];
    const topics = [];
    const notes = [];

    json.topics.forEach(topic => {
      starting_sentences.push(topic.starting_sentence);
      topics.push(topic.topic);
      notes.push(topic.notes);
    });

    return {starting_sentences, topics, notes};
  } catch (error) {
    console.error("Error during OpenAI API call:", error);
  }
}

