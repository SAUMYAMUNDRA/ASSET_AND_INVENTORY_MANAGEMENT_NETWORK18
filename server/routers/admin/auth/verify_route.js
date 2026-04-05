import express from 'express';
import { isAdmin } from '../../../middlewares/isadmin.js';  
import { isLoggedIn } from '../../../middlewares/isloggedin.js';

const verify_router = express.Router();

verify_router.post('/verify', isLoggedIn, (req, res) => {
  res.status(200).send({ message: "success" });
});

export default verify_router;