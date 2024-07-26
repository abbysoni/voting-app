const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET_KEY = process.env.JWT_SECRET || 2020

//extract the jwt token from the request header
const jwtAuthMiddleware = (req,res,next)=>{
    //first check if the request header have authorization
    const authorization = req.headers.authorization;
    if(!authorization) return res.status(401).json({error: "No token found"});

const token = req.headers.authorization.split(' ')[1];
if(!token) return res.status(401).json({error: "Unauthorized"});
try{
    //Verify the jwt token
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    console.log("recieved jwt secret from env and token formed",JWT_SECRET_KEY)

    //Attach user information to the request object after decoding
    req.user = decoded;
    next();
}catch(err){
    console.error(err);
    res.status(500).json({error:'Invalid jwt token'});
}};

//function to generate the jwt token
const generateToken = (userData)=>{
    console.log("data recieved at generate token:",userData,JWT_SECRET_KEY,{expiresIn:30000})
    //Generate a new token using userData
   return jwt.sign(userData, JWT_SECRET_KEY);
}

module.exports = {jwtAuthMiddleware, generateToken};