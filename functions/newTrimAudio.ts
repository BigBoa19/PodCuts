import RNFS from 'react-native-fs';

const payload = {
    audio_uri: 'https://storage.googleapis.com/aai-web-samples/5_common_sports_injuries.mp3',
    intervals: [
      [0, 10000],      // Trim from 0ms to 10,000ms (10 seconds)
      [10000, 20000]   // Trim from 10,000ms to 20,000ms
    ]
};

export async function callTrimAudioEndpoint() {
    const trimmedAudio: string[] = [];
    try {
        const response = await fetch("http://127.0.0.1:5000/trim_audio", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(data);
        
        for (let i = 0; i < data.length; i++) {
            const base64Audio = data[i].file;
            const filePath = `${RNFS.DocumentDirectoryPath}/trimmed_audio_${i}.mp3`;
            await RNFS.writeFile(filePath, base64Audio, 'base64');
            console.log(`Audio file saved to ${filePath}`);
            trimmedAudio.push(filePath);
        }
        return trimmedAudio;
    } catch (error) {
        console.error('Error trimming audio:', error);
    }
}
