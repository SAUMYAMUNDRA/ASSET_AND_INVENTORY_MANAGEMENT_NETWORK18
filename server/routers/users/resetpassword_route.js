import express from 'express'
import {  getUserById,updateUserPassword} from '../../models/user_model.js'
import { isLoggedIn } from '../../middlewares/isloggedin.js';  

const resetuserpass_route = express.Router()

// Use DELETE method instead of POST
resetuserpass_route.post('/resetuser-pass', isLoggedIn, async (req, res) => {
    try {
        const { currentpassword, newpassword } = req.body
        const user_id=req.user.user_id;

        if (!newpassword) {
            return res.status(400).send({ error: "new password is required" })
        }

        const user = await getUserById(user_id);
        if (currentpassword !== user.password){
            return res.status(401).send({ error: "Current password is incorrect." })

        }
        if (!user) {
            return res.status(404).send({ error: "User does not exist in DB, cannot reset user password" })
        }
        if(user.password===newpassword){
            return res.status(400).send({ error: "old password and new password should not be same "})
        }
        await updateUserPassword(user_id,newpassword);
        
        return res.status(200).send({ message: "Successfully reset user password" })
    } catch (error) {
		console.log(error);
        return res.status(500).send({ error: "Error resetting user password ", details: error.message })
    }
})

export default resetuserpass_route;
