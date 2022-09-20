const express = require('express');
const connectDB = require('./config/db');
const app = express();

//Connect to database
connectDB();

//Init Middleware
//it's like body parser so that we can parse through the body
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

//Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));

//it will look for an env variable called port if no port is set it will go to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Started on port ${PORT}`));
