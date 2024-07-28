import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({
  apiKey: 'e8f9634b365541e786bcb03981ddfbe3',
});

const FILE_URL =
  'https://storage.googleapis.com/aai-web-samples/5_common_sports_injuries.mp3';

const data = {
  audio_url: FILE_URL
}

const transcribe = async () => {
  const transcript = await client.transcripts.transcribe(data);
  console.log(transcript.text);
  return transcript.text ? transcript.text : '';
};


transcribe();