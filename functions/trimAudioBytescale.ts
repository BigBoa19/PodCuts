import * as Bytescale from "@bytescale/sdk";
import axios from 'axios';

const uploadApi = new Bytescale.UploadApi({
  apiKey: "public_kW15cAZ5kmGyBjFLobLjx4e7RDx4"
});

const uploadAudio = async (url: string) => {
  try {
    const result = await uploadApi.uploadFromUrl({
      "accountId": "kW15cAZ",
      "uploadFromUrlRequest": {
        "url": url,
        "mime": "audio/mp3",
      }
    });
    console.log('File uploaded successfully:', result.fileUrl);
    return result.fileUrl;
  } catch (e: any) {
    console.error('Error uploading file:', e.message);
    throw e;
  }
}

const getTrimedUrl = async (fileUrl: string, startTime: number, endTime: number) => {
  const audioUrl = fileUrl.replace('/raw/', '/audio/');
  return `${audioUrl}?ts=${startTime}&te=${endTime}&f=mp3`;
}

export const trimAudioBytescale = async (originalUrl: string, intervals: number[][]) => {
  const url = await uploadAudio(originalUrl);
  const trimmedUrls = [];
  try {
    for (const [start, end] of intervals) {
      const trimedUrl = await getTrimedUrl(url, start, end);
      const response = await pollForCompletion(trimedUrl);
      trimmedUrls.push(response);
    }
    return trimmedUrls;
  }catch (error) {
    console.error('Error trimming audio:', error);
    throw error;
  }
}

const pollForCompletion = async (pollUrl: string): Promise<string> => {
  const pollInterval = 3000;

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const response = await axios.get(pollUrl);
        const status = response.data.status;

        if (status === 'Succeeded') {
          const audioFileUrl = response.data.summary.result.artifactUrl;
          resolve(audioFileUrl);
        } else {
          setTimeout(poll, pollInterval);
        }
      } catch (error) {
        console.error('Failed to poll for completion:', error);
        reject(error);
      }
    };

    poll();
  });
};
