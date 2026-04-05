import express from 'express'
import { getUserById,updateUserEmail,updateUserFullname,updateUserPassword,updateUserRole } from '../../../models/user_model.js'
import { isAdmin } from '../../../middlewares/isadmin.js';  
import { isLoggedIn } from '../../../middlewares/isloggedin.js';
import { isAuthorized } from '../../../middlewares/isAuthorized.js';

const edituser_route = express.Router()

// Use DELETE method instead of POST
edituser_route.post('/edit-user', isLoggedIn,isAuthorized(6), async (req, res) => {
    try {
        const { user_id ,newname,newemail,newpassword,newrole } = req.body

        if (!user_id) {
            return res.status(400).send({ error: "User ID is required" })
        }

        const user = await getUserById(user_id)
        if (!user) {
            return res.status(404).send({ error: "User does not exist in DB, cannot edit" })
        }

        if (newemail) await updateUserEmail(user_id, newemail);
        if (newpassword) await updateUserPassword(user_id, newpassword);
        if (newname) await updateUserFullname(user_id, newname);
        if (newrole) await updateUserRole(user_id, newrole);
      
      return res.status(200).send({ message: "Successfully edited user" })
      
        
       
    } catch (error) {
        return res.status(500).send({ error: "Error editing user", details: error.message })
    }
})

export default edituser_route
