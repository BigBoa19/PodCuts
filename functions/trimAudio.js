import * as FileSystem from 'expo-file-system';

export const trimAudio = async (audioUri, intervals) => {
  try {
    // Prepare the request body
    const body = JSON.stringify({
      audio_uri: audioUri,
      intervals: intervals
    });

    // Send a POST request to the Flask API to trim the audio
    const response = await fetch('http://127.0.0.1:5000/trim_audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    const savedFiles = [];
    for (const file of responseData) {
      const trimmedAudioUri = `${FileSystem.documentDirectory}${Date.now()}${file.filename}`;

      const base64Data = btoa(file.file);

      await FileSystem.writeAsStringAsync(trimmedAudioUri, base64Data, {encoding: FileSystem.EncodingType.Base64});
      savedFiles.push(trimmedAudioUri);
    }

    return savedFiles;
  } catch (error) {
    console.error('Error trimming audio:', error);
    throw error;
  }
};