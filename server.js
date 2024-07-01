const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.set('trust proxy', true);

app.get('/api/hello', async (req, res) => {
  try {
    const clientIp = req.ip;

    const fetch = await import('node-fetch');

    const ipInfoResponse = await fetch.default(`https://ipinfo.io/${clientIp}/json`);
    if (!ipInfoResponse.ok) {
      throw new Error('Failed to fetch geolocation data');
    }
    const ipInfoData = await ipInfoResponse.json();

    const city = ipInfoData.city || 'Unknown';

    const weatherResponse = await fetch.default(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`);
    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }
    const weatherData = await weatherResponse.json();

    const temperature = weatherData.main.temp || 'Unknown';

    let visitorName = req.query.visitor_name;
    if (visitorName) {
      visitorName = visitorName.replace(/^["']|["']$/g, ''); // Remove surrounding quotes
    }

    const greeting = `Hello, ${visitorName || 'Guest'}!, the temperature is ${temperature} degrees Celsius in ${city}`;

    res.json({ 
      client_ip: clientIp,
      location: city,
      greeting: greeting
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch data'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
