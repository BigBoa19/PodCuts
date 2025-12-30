const BASE_URL = 'https://podcuts-backend-production.up.railway.app';
const BACKEND_KEY = 'b7cf1295cdfc1b6d82c92ed666fc57fb7308afd36b2cbb3c92876d68225de09d';

export interface Sentence {
    text: string
    start: number
    end: number
}

export default async function transcribe(audioUrl: string): Promise<any | null> {
    try {
        console.log("TRANSCRIBING")
        const response = await fetch(`${BASE_URL}/api/transcribe`, {
            headers: {
                'x-podcuts-secret': `${BACKEND_KEY}`,
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ audioUrl }),
        });
        const data = await response.json();
        // console.log('Transcription data:', JSON.stringify(data, null, 2));
        return { sentences: data.sentences, transcript : data.transcript }
    } catch (error) {
        console.error('Error transcribing audio:', error);
        return null;
    }
}
// transcribe("https://assembly.ai/wildfires.mp3")
