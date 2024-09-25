const { createClient } = require("@deepgram/sdk");

export const transcribeUrl = async (audioUrl: string) => {
  // STEP 1: Create a Deepgram client using the API key
  const apiKey = "2e586604120576786ec9521e61fae75cb7b70da1"
  const deepgram = createClient(apiKey);

  // STEP 2: Call the transcribeUrl method with the audio payload and options
  const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
    {
      url: audioUrl,
    },
    // STEP 3: Configure Deepgram options for audio analysis
    {
      model: "nova-2",
      smart_format: true,
    }
  );

  if (error) throw error;
  // STEP 4: Print the results


  if (!error) {
    console.dir(result, { depth: null });
    return result;
  }
};


// transcript:result.results.channels[0].alternatives[0].transcript
// sentences: result.results.channels[0].alternatives[0].paragraphs.paragraphs


function generateIntervals(startingSentences: string[], jsonData: JSON){
  const intervals = [];
  let previousInterval = -1;
  for (const startingSentence of startingSentences){
    if(previousInterval !== 1){
      intervals.push([previousInterval, getStartTime(startingSentence, jsonData)]);
    }
    previousInterval = getStartTime(startingSentence, jsonData) //this function that kevin made should return the proper starting time the sentence is spoken
  }

  return intervals;
}

const getStartTime = (startingSentence: string, data: any) => {
 for (const entry of data){
  for (const sentence of entry.sentences){
    if(sentence.text === startingSentence){
      return entry.start;
    }
  }
  return null
 }
};