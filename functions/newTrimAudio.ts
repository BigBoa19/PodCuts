export async function callTrimAudioEndpoint(audio_uri: string, intervals: number[][]){
    const payload = {
        audio_uri: audio_uri,
        intervals: [
          [0, 30000],      // Trim from 0ms to 10,000ms (10 seconds)
          [30000, 100000]   // Trim from 10,000ms to 20,000ms
        ]
    };
    const trimmedAudio: string[] = [];
    try {
        const response = await fetch("http://172.29.59.146:8000/trim_audio", {
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
        console.log("Trimmed audio URLs:",data);

        data.forEach((file: string) => {
            trimmedAudio.push(file);

        });

        return trimmedAudio;
    } catch (error) {
        console.error('Error trimming audio:', error);
    }
}
