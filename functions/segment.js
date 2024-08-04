const axios = require('axios');

const segmentText = async (text) => {
    const url = "https://api.ai21.com/studio/v1/summarize-by-segment";
  
    const payload = {
      sourceType: "TEXT",
      source: text
    };
  
    const headers = {
      'Authorization': `Bearer qP2VfckUdkeVoYIVKUaOyyaayaVZmu0A`,
      'Content-Type': 'application/json'
    };
  
    try {
      const response = await axios.post(url, payload, { headers });
      console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
    }
};