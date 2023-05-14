const express = require("express");
const userController = require("./controller/user");
const { verifyToken } = require("./utility/index");

const router = express.Router();


//--------------------USER-----------------
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', verifyToken, userController.profile);
router.post('/update-user', verifyToken, userController.updateUser);

module.exports = router;
