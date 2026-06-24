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
const cashflowController = require("../../controller/cashflow");
const authController = require("../../controller/auth");
const dashboardController = require("../../controller/dashboard");
const orderController = require("../../controller/order");
const bannerController = require("../../controller/banner");
const offerController = require("../../controller/offer");
const { verifyToken, formatResponse } = require("../../utility");
const productAdController = require("../../controller/productAd");
const academyController = require("../../controller/academy");
const digitalOfferController = require("../../controller/digitalOffer");
const walletController = require("../../controller/wallet");
const notificationController = require("../../controller/notification/notification.controller");
const categoryController = require("../../controller/category");
const companyController = require("../../controller/company");
const distributorController = require("../../controller/distributor");

const router = express.Router();


//-----------------------------------CUSTOMER-----------------------------------
router.post('/customer/register', customerController.register);
router.post('/customer/login', customerController.login);
router.get('/customer/profile', verifyToken, customerController.getProfile);

//-----------------------------------APPOINTMENT-----------------------------------
router.post('/get-booked-slots', appointmentController.getBookedSlots);
router.post('/create-appointment', verifyToken, appointmentController.createAppointment);
router.get('/get-appointments', verifyToken, appointmentController.getAppointments);
router.get('/customer/appointments', verifyToken, appointmentController.getCustomerAppointments);
router.get('/get-kanban-slots', verifyToken, appointmentController.getKanbanSlots);

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

//-----------------------------------DASHBOARD-----------------------------------------
router.get('/get-admin-stats', verifyToken, dashboardController.getAdminStats);

//--------------------------------------IMAGE-----------------------------------------
router.get('/get-image/:parent/:parent_id', verifyToken, imageController.getImage);
router.post('/create-image', verifyToken, imageController.create);
router.post('/upload-image', verifyToken, imageController.uploadImage);
router.patch('/update-image', verifyToken, imageController.updateImage);
router.delete('/delete-image', verifyToken, imageController.deleteImage);
router.delete('/delete-image-by-type', verifyToken, imageController.deleteImageByType);
router.delete('/delete-s3-file', verifyToken, imageController.deleteS3File);

//------------------------------------JOB_SEEKER---------------------------------------
router.get('/get-job-seekers', verifyToken, JobSeekerController.getAll);  //using mysql JOIN
router.get('/get-job-seeker-list/:page/:size', verifyToken, JobSeekerController.getJobSeekerDetail);   //using mysql JOIN
router.post('/create-job-seeker', verifyToken, JobSeekerController.createJobSeeker);
router.patch('/update-job-seeker', verifyToken, JobSeekerController.updateJobSeeker);

//-----------------------------------CATEGORY-------------------------------------------
router.get('/get-categories', verifyToken, categoryController.getCategories);

//-----------------------------------COMPANY-------------------------------------------
router.get('/get-companies', verifyToken, companyController.getCompanies);
router.post('/create-company', verifyToken, companyController.createCompany);
router.patch('/update-company', verifyToken, companyController.updateCompany);
router.get('/company/profile', verifyToken, companyController.getCompanyProfile);
router.patch('/companies/:id/pricing-offers', verifyToken, companyController.updateCompanyPricingOffers);

//-----------------------------------DISTRIBUTOR-------------------------------------------
router.get('/get-distributors', verifyToken, distributorController.getDistributors);
router.post('/create-distributor', verifyToken, distributorController.createDistributor);
router.patch('/update-distributor', verifyToken, distributorController.updateDistributor);
router.get('/distributor/profile', verifyToken, distributorController.getDistributorProfile);
router.get('/company/distributors', verifyToken, distributorController.getCompanyDistributors);

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
router.get('/get-salon-stats', verifyToken, salonController.getSalonStats);
router.get('/get-salon-list', verifyToken, salonController.getSalonList);   //using mysql JOIN
router.post('/get-salon-detail', verifyToken, salonController.getSalonDetail);   //using mysql JOIN
router.post('/get-by-user-id', verifyToken, salonController.getSalonByUserId);
router.post('/create-salon', verifyToken, salonController.createSalon);
router.patch('/update-salon', verifyToken, salonController.updateSalon);

//-----------------------------------SALON INVENTORY-------------------------------------------
router.get('/get-salon-inventory', verifyToken, salonController.getSalonInventory);
router.patch('/update-salon-inventory', verifyToken, salonController.updateSalonInventory);

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
router.post('/create-website-review', reviewController.createWebsiteReview);
router.get('/get-website-reviews', reviewController.getWebsiteReviews);


//-----------------------------------CASHFLOW-----------------------------------
router.get('/cashflow/get-all', verifyToken, cashflowController.getAll);
router.post('/cashflow/create', verifyToken, cashflowController.create);
router.patch('/cashflow/update', verifyToken, cashflowController.update);
router.delete('/cashflow/delete', verifyToken, cashflowController.delete);
router.get('/cashflow/summary', verifyToken, cashflowController.getSummary);
router.get('/cashflow/get-by-id/:id', verifyToken, cashflowController.getById);


const salonInventoryController = require("../../controller/salonInventory");

//-----------------------------------SALON INVENTORY (PRODUCT STOCK)-------------------------------------------
router.get('/salon-inventory/get-all', verifyToken, salonInventoryController.getInventory);
router.post('/salon-inventory/create', verifyToken, salonInventoryController.createProduct);
router.patch('/salon-inventory/update', verifyToken, salonInventoryController.updateProduct);
router.patch('/salon-inventory/update-stock', verifyToken, salonInventoryController.updateStock);

// =================================== MOBILE APP ===================================
// AUTH
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.patch('/users/profile', verifyToken, authController.updateProfile);

// SALONS (Wrapping existing paths or creating aliases)
router.get('/salons', salonController.getSalons); // Query params can be handled in controller logic if supported
router.get('/salons/:id', salonController.getSalonDetail);
router.get('/salons/:salon_id/staff', verifyToken, salonEmployeeController.getBySalonId);
router.get('/salons/:id/slots', appointmentController.getBookedSlots); 
router.get('/salons/:salon_id/reviews', reviewController.getReviewsBySalon);

// APPOINTMENTS
router.post('/appointments', verifyToken, appointmentController.createAppointment);
router.get('/appointments/my', verifyToken, appointmentController.getAppointments);

// PRODUCTS
router.get('/products', productController.getProducts); // using getProducts
// PRODUCT ADS (SPONSORED) - MUST be before /products/:id to prevent route conflict
router.get('/products/sponsored', productAdController.getSponsored);      // public
router.get('/products/:id', productController.getProducts); // Can pass id later

// ORDERS
router.post('/orders', verifyToken, orderController.createOrder);
router.get('/orders/my', verifyToken, orderController.getMyOrders);

// HOME / DISCOVERY
router.get('/banners', bannerController.getBanners);
router.get('/offers', offerController.getOffers);
router.get('/services/popular', serviceController.getAll);
router.get('/cities', cityController.getAll);

// PRODUCT ADS - ADMIN routes
router.get('/product-ads', verifyToken, productAdController.getAll);      // admin
router.post('/product-ads/create', verifyToken, productAdController.create); // admin
router.patch('/product-ads/update', verifyToken, productAdController.update); // admin
router.delete('/product-ads/delete', verifyToken, productAdController.delete); // admin
router.post('/product-ads/track-click/:id', productAdController.trackClick); // public

//-----------------------------------ACADEMY-----------------------------------
router.get('/academy/get-all', verifyToken, academyController.getAll);           // admin
router.get('/academy/public-list', academyController.getPublicList);             // public
router.post('/academy/create', verifyToken, academyController.create);           // admin
router.patch('/academy/update', verifyToken, academyController.update);          // admin
router.delete('/academy/delete', verifyToken, academyController.delete);        // admin

//-----------------------------------DIGITAL OFFERS-----------------------------------
router.get('/digital-offers/get-all', digitalOfferController.getAllOffers); 
router.get('/digital-offers/get-by-id/:id', digitalOfferController.getOfferById);
router.post('/digital-offers/create', verifyToken, digitalOfferController.createOffer);
router.patch('/digital-offers/update', verifyToken, digitalOfferController.updateOffer);
router.delete('/digital-offers/delete', verifyToken, digitalOfferController.deleteOffer);

router.post('/digital-offers/claim', verifyToken, digitalOfferController.claimOffer);
router.get('/digital-offers/my-cards', verifyToken, digitalOfferController.getUserCards);

//-----------------------------------WALLET-----------------------------------
router.get('/wallet/balance', verifyToken, walletController.getBalance);
router.get('/wallet/transactions', verifyToken, walletController.getTransactions);
router.post('/wallet/add-money', verifyToken, walletController.addMoney);
router.post('/wallet/verify-add-money', verifyToken, walletController.verifyAddMoney);
router.post('/wallet/verify-payment', verifyToken, walletController.verifyPayment);
router.post('/wallet/initiate-appointment-payment', verifyToken, walletController.initiateAppointmentPayment);
router.post('/wallet/verify-appointment', verifyToken, walletController.verifyAndBookAppointment);

//-----------------------------------NOTIFICATIONS-----------------------------------
router.post('/notifications/token', verifyToken, notificationController.saveFCMToken);
router.get('/notifications/list', verifyToken, notificationController.getUserNotifications);
router.patch('/notifications/read/:id', verifyToken, notificationController.markAsRead);

module.exports = router;
