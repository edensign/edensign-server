/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const express = require("express");
const userController = require("../../controller/user");
const commonController = require("../../controller/common");
const countryController = require("../../controller/country");
const { verifyToken } = require("../../utility");

const router = express.Router();


//--------------------USER-----------------
router.get('/get-users', userController.getUsers);       //verifyToken to be included
router.post('/register', userController.register);      //verifyToken to be included
router.post('/login', userController.login);
router.get('/profile', verifyToken, userController.profile);
router.patch('/update-user', userController.updateUser); // verify token to be added

// -----------------------------------Common-----------------------------------
router.get('/get-by-pk/:table/:id', commonController.getByPk);


//------------------COUNTRY-----------------
router.post('/create-country', verifyToken, countryController.countryCreate);
router.patch('/update-country/:id', verifyToken, countryController.updateCountry);
router.delete('/delete-country/:id', verifyToken, countryController.removeCountry);


module.exports = router;
