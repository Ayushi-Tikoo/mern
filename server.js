const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('API Running'));

//it will look for an env variable called port if no port is set it will go to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Started on port ${PORT}`));
