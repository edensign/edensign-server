/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const express = require("express");

const addressController = require("../../controller/address");
const cityController = require("../../controller/city");
const commonController = require("../../controller/common");
const countryController = require("../../controller/country");
const imageController = require("../../controller/image");
const salonController = require("../../controller/salon");
const stateController = require("../../controller/state");
const userController = require("../../controller/user");
const { verifyToken, formatResponse } = require("../../utility");

const router = express.Router();

//-----------------------------------ADDRESS---------------------------------------
router.get('/get-address/:parent/:parent_id', verifyToken, addressController.getAddress);
router.post('/create-address', verifyToken, addressController.create);
router.patch('/update-address', verifyToken, addressController.updateAddress);

//-------------------------------------CITY----------------------------------------
router.get('/get-cities/:id', verifyToken, cityController.getCities);
router.post('/create-city', verifyToken, cityController.createCity);
router.patch('/update-city/:id', verifyToken, cityController.updateCity);
router.delete('/delete-city/:id', verifyToken, cityController.removeCity);

//------------------------------------COUNTRY--------------------------------------
router.get('/get-countries', verifyToken, countryController.getCountries);
router.post('/create-country', verifyToken, countryController.createCountry);
router.patch('/update-country/:id', verifyToken, countryController.updateCountry);
router.delete('/delete-country/:id', verifyToken, countryController.removeCountry);

// ------------------------------------Common-----------------------------------------
router.get('/get-by-pk/:table/:id', commonController.getByPk);
router.get('/verify-token', verifyToken, (req, res) => res.status(200).send(formatResponse(200, `Verified`)));

//--------------------------------------IMAGE-----------------------------------------
router.get('/get-image/:parent/:parent_id', verifyToken, imageController.getImage);
router.post('/create-image', verifyToken, imageController.create);
router.patch('/update-image', verifyToken, imageController.updateImage);
router.delete('/delete-image', verifyToken, imageController.deleteImage);

//--------------------------------------SALON------------------------------------------
router.get('/get-salons', verifyToken, salonController.getSalons);
router.post('/create-salon', verifyToken, salonController.createSalon);
router.patch('/update-salon', verifyToken, salonController.updateSalon);

//--------------------------------------STATE-------------------------------------------
router.get('/get-states/:id', verifyToken, stateController.getStates);
router.post('/create-state', verifyToken, stateController.createState);
router.patch('/update-state/:id', verifyToken, stateController.updateState);
router.delete('/delete-state/:id', verifyToken, stateController.removeState);

//---------------------------------------USER-------------------------------------------
router.get('/get-users', verifyToken, userController.getUsers);
router.post('/register', verifyToken, userController.register);
router.post('/login', userController.login);
router.get('/profile', verifyToken, userController.profile);
router.patch('/update-user', verifyToken, userController.updateUser);


module.exports = router;
