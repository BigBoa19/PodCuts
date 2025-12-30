const BASE_URL = 'https://podcuts-backend-production.up.railway.app';
const BACKEND_KEY = 'b7cf1295cdfc1b6d82c92ed666fc57fb7308afd36b2cbb3c92876d68225de09d';

export default async function summarize(audioUrl: string) {
    try {
        console.log("SUMMARIZING")
        const response = await fetch(`${BASE_URL}/api/summarize`, {
            headers: {
                'x-podcuts-secret': `${BACKEND_KEY}`,
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ audioUrl }),
        });
        const data = await response.json();
        console.log('Summarization data:', JSON.stringify(data, null, 2));
        return data;
    } catch (error) {
        console.error('Error summarizing audio:', error);
        return null;
    }
}