import express from 'express';
import { createUser, getUserByEmail, addUserPermissions } from '../../../models/user_model.js';
import { isLoggedIn } from '../../../middlewares/isloggedin.js';
import { isAuthorized } from '../../../middlewares/isAuthorized.js';

const createuser_route = express.Router();
createuser_route.post('/create-user', isLoggedIn, isAuthorized(2),async (req, res) => {
    try {
        const { fullname, email, password, role, city_id, permissions } = req.body;

        if (!fullname || !email || !password || !role) {
            return res.status(400).send({ error: "All fields are required" });
        }

        const user = await getUserByEmail(email);
        if (user) {
            return res.status(400).send({ error: "User already exists" });
        }

        const userId = await createUser(fullname, email, password, role, city_id, permissions || []);

       

        return res.status(201).send({
            message: "Successfully created new user",
            userId
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Error creating new user",
            details: error.message
        });
    }
});


export default createuser_route;
