// for (let i = 0; i < data.length; i++) {
//             const base64Audio = data[i].file;
//             const filePath = `${RNFS.DocumentDirectoryPath}/trimmed_audio_${i}.mp3`;
//             await RNFS.writeFile(filePath, base64Audio, 'base64');
//             console.log(`Audio file saved to ${filePath}`);
//             trimmedAudio.push(filePath);
//         }