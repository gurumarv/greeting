const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080; // Change the port to 8080

app.use(bodyParser.json());
app.set('trust proxy', true);

app.get('/api/hello', async (req, res) => {
  try {
    // Get the client's IP address
    const clientIp = req.ip;

    // Dynamically import node-fetch
    const fetch = await import('node-fetch');

    // Fetch geolocation data based on IP address from ipinfo.io
    const ipInfoResponse = await fetch.default(`https://ipinfo.io/${clientIp}/json`);
    if (!ipInfoResponse.ok) {
      throw new Error('Failed to fetch geolocation data');
    }
    const ipInfoData = await ipInfoResponse.json();

    // Extract city information
    const city = ipInfoData.city || 'Unknown';

    // Fetch weather information based on city name from OpenWeatherMap API
    const weatherResponse = await fetch.default(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`);
    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }
    const weatherData = await weatherResponse.json();

    // Extract temperature information in Celsius from weather data
    const temperature = weatherData.main.temp || 'Unknown';

    // Get visitor name from query parameter
    let visitorName = req.query.visitor_name;
    if (visitorName) {
      visitorName = visitorName.replace(/^["']|["']$/g, ''); // Remove surrounding quotes
    }

    // Prepare greeting message
    const greeting = `Hello, ${visitorName || 'Guest'}!, the temperature is ${temperature} degrees Celsius in ${city}`;

    // Send a JSON response with the client's IP address, city, and greeting
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
