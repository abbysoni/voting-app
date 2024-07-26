const express= require ('express');
const app = express();
require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;
const db = require('./db')

// Middleware configuration
const logRequest = (req,res,next) => {
    console.log(`Request received at ${new Date().toLocaleString()}: ${req.method} ${req.url}`)
    // console.log(`Request made to ${req.originalUrl}`)
    next() //move on to next phase  
  }
  
  app.use(logRequest)
app.get('/', (req, res) => {
    res.send('Welcome to our Voting app')
})

// app.get('/user', (req, res) => {
//     res.send('Welcome to our Voting app/user')
// })

const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes)

const candRoutes = require('./routes/candRoutes');
app.use('/', candRoutes)

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})

