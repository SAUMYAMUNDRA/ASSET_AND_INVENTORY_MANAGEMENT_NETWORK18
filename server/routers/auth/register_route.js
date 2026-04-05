import express from 'express';
import * as authModel from '../../models/user_model.js';
const register_route = express.Router();

register_route.post('/register',async (req,res)=>{
    
    try {
    const {fullname,email,password}=req.body;
    if(!fullname || !email || !password){
        return res.status(400).json({error:"All fields are required"});
    }
    const exisitingUser=await authModel.getUserByEmail(email);
    if(exisitingUser){
         console.log("user already exist with same email");
         res.status(401).json({ error: "User already exists with the same email. Please log in." });
    }
    const newUser=await authModel.createUser(fullname,email,password);
    if(newUser){
    res.status(200).json({ message: "User registered successfully" });
    }else{
        res.status(500).json({ error: "Error registering user" });
    }

    } catch (error) {
        console.log("error registring user",error);
        res.status(401).json({ error: "Error registering user" });
    }
})

export default register_route;