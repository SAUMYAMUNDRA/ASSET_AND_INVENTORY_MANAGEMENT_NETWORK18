import express from 'express'
import { deleteUser, getUserById } from '../../../models/user_model.js'
import { isAdmin } from '../../../middlewares/isadmin.js';  
import { isLoggedIn } from '../../../middlewares/isloggedin.js';
import { isAuthorized } from '../../../middlewares/isAuthorized.js';

const deleteuser_route = express.Router()

// Use DELETE method instead of POST
deleteuser_route.post('/delete-user',isLoggedIn,isAuthorized(3), async (req, res) => {
    try {
        const { user_id } = req.body

        if (!user_id) {
            return res.status(400).send({ error: "User ID is required" })
        }

        const user = await getUserById(user_id)
        if (!user) {
            return res.status(404).send({ error: "User does not exist in DB, cannot delete" })
        }

        await deleteUser(user_id)
        
        return res.status(200).send({ message: "Successfully deleted user" })
    } catch (error) {
        return res.status(500).send({ error: "Error deleting user", details: error.message })
    }
})

export default deleteuser_route
