import * as FileSystem from 'expo-file-system';

export const trimAudio = async (audioUri, startTime, endTime) => {
  try {
    // Prepare the request body
    const body = JSON.stringify({
      audio_uri: audioUri,
      start_time: startTime,
      end_time: endTime
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

    // Get the blob from the response
    const blob = await response.blob();

    // Generate a local URI for the trimmed audio
    const trimmedAudioUri = `${FileSystem.documentDirectory}${Date.now()}.mp3`;

    const reader = new FileReader();
    reader.readAsDataURL(blob);
    const base64Data = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
    });

    // Save the blob to a file
    await FileSystem.writeAsStringAsync(trimmedAudioUri, base64Data, {encoding: FileSystem.EncodingType.Base64});

    return trimmedAudioUri;
  } catch (error) {
    console.error('Error trimming audio:', error);
  }
};

export const handleTrimAudio = async () => {
    const audioUri = "https://www.podtrac.com/pts/redirect.mp3/pdst.fm/e/chrt.fm/track/3F7F74/traffic.megaphone.fm/SCIM9911539455.mp3?updated=1721066008";  // URL of the audio file
    const startTime = 10000;  // Start time in milliseconds
    const endTime = 30000;  // End time in milliseconds
  
    const trimmedAudioUri = await trimAudio(audioUri, startTime, endTime);
    console.log("Trimmed Audio Uri: " + trimmedAudioUri);
    return trimmedAudioUri;
};