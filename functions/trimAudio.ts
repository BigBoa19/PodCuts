import * as Bytescale from "@bytescale/sdk";
import axios from 'axios';
import { or } from "firebase/firestore";

const uploadApi = new Bytescale.UploadApi({
  apiKey: process.env.EXPO_PUBLIC_BYTESCALE_KEY || "",
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

function getCurrentDatePath() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}/${month}/${day}`;
}


const getTrimedUrl = async (fileUrl: string, startTime: number, endTime: number) => {
  const audioUrl = fileUrl.replace('/raw/', '/audio/');
  return `${audioUrl}&ts=${startTime}&te=${endTime}&f=mp3`;
}

export const trimAudio = async (originalUrl: string, intervals: number[][]) => {

  const url = `https://upcdn.io/W142inz/raw/https://anchor.fm/s/f58d3330/podcast/play/86882626/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2024-4-17%2F377951130-44100-2-8a54489544fe3.mp3`; //external HTTP URL
  console.log('OG URL: ' + url);
  //const url = `https://upcdn.io/W142inz/raw/uploads/${getCurrentDatePath()}/${originalUrl}`; //external HTTP URL
  //const url = await uploadAudio(originalUrl); // Upload
  const trimmedUrls = [];
  try {
    for (const [start, end] of intervals) {
      const trimedUrl = await getTrimedUrl(url, start, end);
      const response = await testGet(trimedUrl);
      trimmedUrls.push(response);
    }
    return trimmedUrls;
  }catch (error) {
    console.error('Error trimming audio:', error);
    throw error;
  }
}


const testGet = async (url: string) => {
  console.log('Getting:', url);
  const config = {
    headers: { Authorization: `Bearer public_W142inz6B6b8nLWCvnBLugJqMQ33` }
  };
  try {
    const response = await axios.get(url, config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

const pollForCompletion = async (pollUrl: string): Promise<string> => {
  const pollInterval = 3000;

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const response = await axios.get(pollUrl)
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
