const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT


app.use(bodyParser.json());
app.set('trust proxy', true);


app.get('/', (req, res) => {
    const clientIp = req.ip;
    res.json({ 
        greeting: 'Hello, Marv!',
        IpAddress: clientIp
     });
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
