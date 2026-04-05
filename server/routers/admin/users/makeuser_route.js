import express from 'express'
import { getUserById, updateUserRole } from '../../../models/user_model.js'
import { isAdmin } from '../../../middlewares/isadmin.js';  
import { isLoggedIn } from '../../../middlewares/isloggedin.js';
import { isAuthorized } from '../../../middlewares/isAuthorized.js';

const makeuser_route = express.Router()

makeuser_route.post('/makeadmin-user', isLoggedIn,isAuthorized(5), async (req, res) => {
    try {
        const { user_id } = req.body

        if (!user_id) {
            return res.status(400).send({ error: "User ID is required" })
        }

        const user = await getUserById(user_id)
        if (!user) {
            return res.status(404).send({ error: "User does not exist in DB" })
        }

        const updated = await updateUserRole(user_id, "user")
        if (!updated) {
            return res.status(500).send({ error: "Failed to update user role" })
        }

        return res.status(200).send({ message: `Successfully made ${user.name} a user` })
    } catch (error) {
        return res.status(500).send({ error: "Error making admin as user", details: error.message })
    }
})

export default makeuser_route
