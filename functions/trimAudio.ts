import * as Bytescale from "@bytescale/sdk";
import axios from 'axios';
import { or } from "firebase/firestore";

const getTrimedUrl = async (fileUrl: string, startTime: number, endTime: number) => {
  const audioUrl = fileUrl.replace('/raw/', '/audio/');
  return `${audioUrl}?ts=${startTime}&te=${endTime}&f=mp3`;
}

export const trimAudio = async (originalUrl: string, intervals: number[][]) => {
  const url = `https://upcdn.io/FW25cEn/raw/https://d3ctxlq1ktw2nl.cloudfront.net/staging/2024-4-17/377951130-44100-2-8a54489544fe3.mp3`; //external HTTP URL
  //const url = `https://upcdn.io/W142inz/raw/${originalUrl}`; //external HTTP URL
  console.log('OG URL: ' + url);
  const trimmedUrls = [];
  try {
    for (const [start, end] of intervals) {
      if(start === -1 || end === -1){
        trimmedUrls.push("No Url Available");
        console.log("No Url Available");
        continue;
      }
      const trimedUrl = await getTrimedUrl(url, start, end);
      const response = await pollForCompletion(trimedUrl);
      console.log('Trimmed URL:', response);
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
  const config = {
    headers: { Authorization: `Bearer public_FW25cEn9GHymJ3erfJkPVDUGPByp` }
  };
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const response = await axios.get(pollUrl, config);
        if (response.data.status === 'Succeeded') { //if get succeeded
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
