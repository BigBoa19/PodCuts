import * as Bytescale from "@bytescale/sdk";
import ReactNativeBlobUtil from 'react-native-blob-util';
import axios from 'axios';
import { or } from "firebase/firestore";


const uploadManager = new Bytescale.UploadManager({
  apiKey: "public_kW15cAZ5kmGyBjFLobLjx4e7RDx4"
});

const uploadAudio = async (blob) => {
  try {
    const { fileUrl, filePath } = await uploadManager.upload({ data: blob, mime: 'audio/mp3' });
    console.log('File uploaded successfully:', fileUrl);
    return fileUrl;
  } catch (e) {
    console.error('Error uploading file:', e.message);
    throw e;
  }
}

const getTrimedUrl = async (fileUrl, startTime, endTime) => {
  const audioUrl = fileUrl.replace('/raw/', '/audio/');
  return `${audioUrl}?ts=${startTime}&te=${endTime}&f=mp3`;
}

export const trimAudio = async (originalUrl, startTime, endTime) => {
  const base64 = await ReactNativeBlobUtil.fetch('GET', "https://storage.googleapis.com/aai-web-samples/5_common_sports_injuries.mp3", {'Content-Type': 'BASE64'});
  const response = await base64.blob('audio/mp3', 512);
  console.log('Blob response:', response);
  const url = await uploadAudio(response);
  const trimedUrl = await getTrimedUrl(url, startTime, endTime);
  try {
    const response = await axios.get(trimedUrl)
    setTimeout(() => {
      //console.log('Audio trimmed successfully:', response.data);
    }, 10000);
    
    return response.data;
    
  } catch (error) {
    console.error('Error trimming audio:', error);
    throw error;
  }
}