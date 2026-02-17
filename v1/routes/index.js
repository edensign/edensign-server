/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const express = require("express");
const path = require('path');

const addressController = require("../../controller/address");
const amenityController = require("../../controller/amenity");
const cityController = require("../../controller/city");
const commonController = require("../../controller/common");
const countryController = require("../../controller/country");
const imageController = require("../../controller/image");
const JobSeekerController = require("../../controller/jobSeeker");
const productController = require("../../controller/product");
const productImageController = require("../../controller/productImage");
const salonController = require("../../controller/salon");
const salonEmployeeController = require("../../controller/salonEmployee");
const serviceController = require("../../controller/service");
const skillController = require("../../controller/skill");
const stateController = require("../../controller/state");
const userController = require("../../controller/user");
const appointmentController = require("../../controller/appointment");
const contactUsController = require("../../controller/contactUs");
const customerController = require("../../controller/customer");
const reviewController = require("../../controller/review");
const { verifyToken, formatResponse } = require("../../utility");

const router = express.Router();

//-----------------------------------CUSTOMER-----------------------------------
router.post('/customer/register', customerController.register);
router.post('/customer/login', customerController.login);
router.get('/customer/profile', verifyToken, customerController.getProfile);

//-----------------------------------APPOINTMENT-----------------------------------
router.post('/get-booked-slots', appointmentController.getBookedSlots);
router.post('/create-appointment', verifyToken, appointmentController.createAppointment);
router.get('/get-appointments', verifyToken, appointmentController.getAppointments);

//-----------------------------------CONTACT US-----------------------------------
router.post('/create-contact', contactUsController.createContact);
router.get('/get-contacts', verifyToken, contactUsController.getContacts);

//-----------------------------------ADDRESS---------------------------------------
router.get('/get-address/:parent/:parent_id', verifyToken, addressController.getAddress);
router.post('/create-address', verifyToken, addressController.create);
router.patch('/update-address', verifyToken, addressController.updateAddress);

//-----------------------------------AMENITY---------------------------------------
router.get('/get-amenities', verifyToken, amenityController.getAll);
router.post('/create-amenity', verifyToken, amenityController.createAmenity);
router.patch('/update-amenity', verifyToken, amenityController.updateAmenity);

//-------------------------------------CITY----------------------------------------
router.get('/get-cities', verifyToken, cityController.getAll);      //this is for edensign website
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
router.post('/upload-image', verifyToken, imageController.uploadImage);
router.patch('/update-image', verifyToken, imageController.updateImage);
router.delete('/delete-image', verifyToken, imageController.deleteImage);

//------------------------------------JOB_SEEKER---------------------------------------
router.get('/get-job-seekers', verifyToken, JobSeekerController.getAll);  //using mysql JOIN
router.get('/get-job-seeker-list/:page/:size', verifyToken, JobSeekerController.getJobSeekerDetail);   //using mysql JOIN
router.post('/create-job-seeker', verifyToken, JobSeekerController.createJobSeeker);
router.patch('/update-job-seeker', verifyToken, JobSeekerController.updateJobSeeker);

//-----------------------------------PRODUCT-------------------------------------------
router.get('/get-products', verifyToken, productController.getProducts);
router.get('/get-product-list', verifyToken, productController.getProductList);   //using mysql JOIN
router.post('/create-product', verifyToken, productController.createProduct);
router.patch('/update-product', verifyToken, productController.updateProduct);

//-----------------------------------INVENTORY-------------------------------------------
router.get('/get-inventory', verifyToken, productController.getInventory);
router.patch('/update-inventory', verifyToken, productController.updateInventory);

//-----------------------------------PRODUCT_IMAGE--------------------------------------
router.get('/get-product-image/:parent_id', verifyToken, productImageController.getProductImage);
router.post('/create-product-image', verifyToken, productImageController.create);
router.post('/upload-product-image', verifyToken, productImageController.uploadProductImage);
router.patch('/update-product-image', verifyToken, productImageController.updateProductImage);
router.delete('/delete-product-image', verifyToken, productImageController.deleteProductImage);

//--------------------------------------SALON------------------------------------------
router.get('/get-salons', verifyToken, salonController.getSalons);
router.get('/get-salon-list', verifyToken, salonController.getSalonList);   //using mysql JOIN
router.post('/get-salon-detail', verifyToken, salonController.getSalonDetail);   //using mysql JOIN
router.post('/get-by-user-id', verifyToken, salonController.getSalonByUserId);
router.post('/create-salon', verifyToken, salonController.createSalon);
router.patch('/update-salon', verifyToken, salonController.updateSalon);

//----------------------------------SALON_EMPLOYEE-------------------------------------
router.get('/get-by-id/:salon_id', verifyToken, salonEmployeeController.getBySalonId);
router.post('/create-salon-employee', verifyToken, salonEmployeeController.createSalonEmployee);
router.patch('/update-salon-employee', verifyToken, salonEmployeeController.updateSalonEmployee);
router.post('/get-salon-employee', verifyToken, salonEmployeeController.getSalonEmployee);   //using mysql JOIN

//-----------------------------------SERVICE-------------------------------------------
router.get('/get-services', verifyToken, serviceController.getAll);
router.post('/create-service', verifyToken, serviceController.createService);
router.patch('/update-service', verifyToken, serviceController.updateService);

//--------------------------------------SKILL-----------------------------------------
router.get('/get-skills', verifyToken, skillController.getAll);
router.get('/get-skill/:id', verifyToken, skillController.getSkillById);
router.post('/create-skill', verifyToken, skillController.createSkill);
router.patch('/update-skill', verifyToken, skillController.updateSkill);

//--------------------------------------STATE-------------------------------------------
router.get('/get-states', verifyToken, stateController.getAll);    //this is for edensign website
router.get('/get-states/:id', verifyToken, stateController.getStates);
router.post('/create-state', verifyToken, stateController.createState);
router.patch('/update-state/:id', verifyToken, stateController.updateState);
router.delete('/delete-state/:id', verifyToken, stateController.removeState);

//---------------------------------------USER-------------------------------------------
router.get('/get-users', verifyToken, userController.getUsers);
router.get('/profile', verifyToken, userController.profile);
router.get('/get-agreement', verifyToken, userController.getAgreement);
router.post('/register', verifyToken, userController.register);
router.post('/login', userController.login);
router.patch('/update-user', verifyToken, userController.updateUser);

//-----------------------------------REVIEW-----------------------------------
router.post('/create-review', reviewController.createReview);
router.get('/get-reviews/:salon_id', reviewController.getReviewsBySalon);


module.exports = router;
