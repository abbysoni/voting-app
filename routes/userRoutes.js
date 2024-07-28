const express = require('express');
const router = express.Router();

const {jwtAuthMiddleware, generateToken} = require('../config/jwt')

const User = require('../models/user')

router.get('/', (req, res) => {
    res.send('Welcome to our Voting app/user')
})

// {
//     "name":"abby1",
//     "email":"abby1@yopmail.com",
//     "password":"12345"
// }
router.post('/signup',async(req,res)=>{
    try {
      const data = req.body
      console.log("Received data on signup", data);
  
      const newUser = new User(data)
  
      const response = await newUser.save();
      console.log("Data saved", response);
  
      const payload = {
        id:response.id,
        }
        console.log("Data sent as payload", JSON.stringify(payload));
      const token = generateToken(payload);
      console.log("Token sent", token);

      res.status(200).json({ message: "user created successfully",token: token, response: response})
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    }
});

router.post('/login', async(req, res) => {
    try {
      //extract username and password from request
      const { name, password } = req.body;
      console.log("Received data on login", { name, password });
  
      //find user by name
      const userData = await User.findOne({ name:name });

      if (!userData || !(await userData.comparePassword(password))) {
        return res.status(401).json({ error: "Invalid name or password" });
      }
  
      //generate token
      const payload = {
        id: userData.id,
        name: userData.name
      }
  
      console.log("Payload for token :", JSON.stringify(payload));
  
      const token= generateToken(payload);
  
      //pass the token
      res.json({token})
  
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Internal Server Error" });
    }
  })


router.get('/profile',jwtAuthMiddleware, async (req, res) => {
    try { 
      const userData = req.user;
      const userId = userData.id;
      console.log("Received data after decoding", userData);

      const user = await User.findById(userId);
  
      res.status(200).json({user})
    } catch (error) {
      console.error("Error getting data", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
});

router.put('/profile/password',jwtAuthMiddleware, async (req, res) => {
    try { 
      const userID = req.user.id; // extract id from jwt token
      const {currPassword,newPassword} = req.body; // extract current and new password from request body

      // Check if currentPassword and newPassword are present in the request body
      if (!currPassword || !newPassword) {
        return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
        }

      const user = await User.findById(userID);

      //if password doesn't match return error
      if (!(await user.comparePassword(currPassword))) {
        return res.status(401).json({ error: "Invalid name or password" });
      }
      
      //if matched then update password
      user.password = newPassword;
      await user.save();
      
      console.log("Password updated successfully");
      res.status(200).json({message: "Password updated successfully for",user})
  
    } catch (error) {
      console.error("Error getting data", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
});

// // Update operation via parameter ID
// router.put('/:id',async(req,res)=>{
// try {
//     const personId = req.params.id;
//     const updatedPersonData = req.body;

//     const response = await user.findByIdAndUpdate(personId, updatedPersonData,{
//         new:true, //return the updated document
//         runValidators: true, //run mongoose validation
//     })

//     if (!response){
//         return res.status(404).json({error:"user not found"})
//     }

//     console.log("Data updated")
//     res.status(200).json(response)

// } catch (error) {
//     console.error("Error saving user's data", error)
//     res.status(500).json({ error: "Internal Server Error" })
// }
// })


// Delete by id
// router.delete('/:id',async(req,res)=>{
//     try {
//         const personId = req.params.id;
    
//         const response = await user.findByIdAndDelete(personId)
        
//         if (!response){
//             return res.status(404).json({error:"user not found"})
//         }
    
//         console.log("DATA DELETED")
//         res.status(200).json(response)
    
//     } catch (error) {
//         console.error("Error deleting data", error)
//         res.status(500).json({ error: "Internal Server Error" })
//     }
// })



//   console.log(JSON.stringify(payload));
//     //you can use anything unique to generate token inplace of username
//     const token = generateToken(payload);
//     console.log("Token is : ", token);

    
//     res.status(200).json({response:response, token:token})

//   } catch (error) {
//     console.error("Error saving user's data", error)
//     res.status(500).json({ error: "Internal Server Error" })
//   }
// })


module.exports = router;