import express from 'express'
import { getUserById, updateUserRole } from '../../../models/user_model.js'
import { isAdmin } from '../../../middlewares/isadmin.js';  
import { isLoggedIn } from '../../../middlewares/isloggedin.js';
import { isAuthorized } from '../../../middlewares/isAuthorized.js';

const makeadmin_route = express.Router()

makeadmin_route.post('/makeuser-admin', isLoggedIn, isAuthorized(4),async (req, res) => {
    try {
        const { user_id } = req.body

        if (!user_id) {
            return res.status(400).send({ error: "User ID is required" })
        }

        const user = await getUserById(user_id)
        if (!user) {
            return res.status(404).send({ error: "User does not exist in DB" })
        }

        const updated = await updateUserRole(user_id, "admin")
        if (!updated) {
            return res.status(500).send({ error: "Failed to update user role" })
        }

        return res.status(200).send({ message: `Successfully made ${user.name} an admin` })
    } catch (error) {
        return res.status(500).send({ error: "Error making user admin", details: error.message })
    }
})

export default makeadmin_route
