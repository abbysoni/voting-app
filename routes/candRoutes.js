const express = require('express');
const router = express.Router();

const {jwtAuthMiddleware } = require('../config/jwt')

const Cands = require('../models/candidate')
const User = require('../models/user')

//check if the role of user is admin or candidate then only let him add new cadidate
const checkAdminRole = async (userID) =>{
    try {
        const user = await User.findById(userID);
        return user && (user.role === 'admin' || user.role === 'candidate');

    } catch (error) {
        console.error("Error checking admin role", error);
        return false;
    }
} 
router.get('/', (req, res) => {
    res.send('Welcome to our Voting app/Candidate')
})

// {
//     "candName":"Candy1",
//      "age": 35,
//      "party":"BJD",
// }
//get the token via user login route using email id and password
//     "email":"abby1@yopmail.com",
//     "password":"12345"
// token will provide the id from user database

router.post('/add',jwtAuthMiddleware,async(req,res)=>{
    try {
        const userID = req.user.id; // extract id from jwt token
        if(!( await checkAdminRole(userID)))
          return res.status(404).json({error: "USER DOES NOT HAVE ADMIN ROLE"});  // Forbidden as user does not have admin role to add new candidate
        
      const data = req.body // extract data from request body
      console.log("Received data on signup", data, "for userID :", userID);
  
      const newCand = new Cands(data)
  
      const response = await newCand.save();
      console.log("Data saved", response);

      res.status(200).json({ message: "user created successfully", response: response})
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    }
});

router.get('/list',jwtAuthMiddleware, async (req, res) => {
    try{
        
        const data = await Cands.find();
        res.status(200).json(data)
      }catch(error) {
        console.log("Error finding person", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
});

router.put('/:id',jwtAuthMiddleware,async(req,res)=>{
try {
    const userID = req.user.id; // extract id from jwt token
    if(!( await checkAdminRole(userID)))
        return res.status(404).json({error: "USER DOES NOT HAVE ADMIN ROLE"});  // Forbidden as user does not have admin role to add new candidate

    const personId = req.params.id;
    const updatedPersonData = req.body;

    const response = await Cands.findByIdAndUpdate(personId, updatedPersonData,{
        new:true, //return the updated document
        runValidators: true, //run mongoose validation
    })

    if (!response){
        return res.status(404).json({error:"user not found"})
    }

    console.log("Data updated")
    res.status(200).json(response)

} catch (error) {
    console.error("Error saving user's data", error)
    res.status(500).json({ error: "Internal Server Error" })
}
})


// Delete by id
router.delete('/:id',jwtAuthMiddleware, async(req,res)=>{
    try {
        const userID = req.user.id; // extract id from jwt token
        if(!( await checkAdminRole(userID)))
        return res.status(404).json({error: "USER DOES NOT HAVE ADMIN ROLE"});  // Forbidden as user does not have admin role to add new candidate

        const candId = req.params.id;
    
        const response = await Cands.findByIdAndDelete(candId)
        
        if (!response){
            return res.status(404).json({error:"user not found"})
        }
    
        console.log("Candidate deleted:",candId,"Deleted by user: ", userID)
        res.status(200).json(response)
    
    } catch (error) {
        console.error("Error deleting data", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

//voting routes
router.post('/vote/:candId',jwtAuthMiddleware,async(req,res)=>
    {
        //no admin can vote
        //user can vote only once

        const candId = req.params.candId; //from params after vote/:candId
        const userId = req.user.id; //extract user ID from jwt token
        try {
            //find the candidate with specified candId
            const candidate = await Cands.findById(candId);
            if(!candidate){
                return res.status(404).json({error: "Candidate not found"})
            }
            //check if user is available with given ID in jwt token
            const user = await User.findById(userId);
            if(!user){
                return res.status(404).json({error: "USER not found"})
            }

            //check if user has already voted
            if(user.isVoted){
                return res.status(403).json({error: "User has already voted"})
            } 

            //check if user is an admin or candidate
            if(user.role == "admin"||user.role == "candidate"){
                return res.status(404).json({error: "Admin and candidate are not allowed to vote"})
            }
            //Update candidate document
            candidate.votes.push({user: userId})
            candidate.voteCount++;
            await candidate.save();

            //update the user document
            user.isVoted = true;
            await user.save();
            
            res.status(200).json({message: "Vote Recorded successfully"});
            
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error" });
        }

    }),

    router.get('/vote/count', async(req, res) => {
        try{
            const candidate = await Cands.find().sort({voteCount:'desc'});
            // const voteCount = candidate.reduce((acc, curr) => acc + curr.voteCount, 0);

            //map the candidates to only return their name and voteCount
            const voteRecord = candidate.map((data)=>{
                return {
                    name: data.candName,
                    party:data.party,
                    voteCount: data.voteCount}
            })
            
            res.status(200).json(voteRecord);
            
        }catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    router.get('/vote/party', async(req, res) => {
        console.log("GET /vote/party")
        try{
            const candidate = await Cands.find().sort({voteCount:'desc'});
            // Group by party and sum the vote counts
            const aggregatedVotes = candidate.reduce((acc, curr) => {
             if (acc[curr.party]) {
                acc[curr.party].voteCount += curr.voteCount;
                } else {
                acc[curr.party] = { party: curr.party, voteCount: curr.voteCount };
                }
            return acc;
            }, {});

            // Convert the object back into an array
            const voteRecord = Object.values(aggregatedVotes).map(data => {
                return {
                  party: data.party,
                  voteCount: data.voteCount
                };
              });
            

            console.log(voteRecord);
            //map the candidates to only return their name and voteCount
            // const voteRecord = candidate.map((data)=>{
            //     return {
            //         party:data.party,
            //         // name: data.candName, 
            //         voteCount: data.voteCount}
            // })
            
            res.status(200).json(voteRecord);
            
        }catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });


module.exports = router;