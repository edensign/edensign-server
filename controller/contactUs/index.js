/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const ContactUsModel = require("../../model/contactUs");
const Utility = require("../../utility");

const ContactUsController = {
    /** Create a new contact us entry
     */
    createContact: (req, res) => {
        return new Promise((resolve, reject) => {
            const { name, email, message } = req.body;

            if (!name || !email || !message) {
                return resolve(res.status(400).send(Utility.formatResponse(400, "Missing required fields: name, email, message")));
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return resolve(res.status(400).send(Utility.formatResponse(400, "Invalid email format")));
            }

            ContactUsModel.create({
                name,
                email,
                message
            })
                .then(contact => {
                    resolve(res.status(200).send(Utility.formatResponse(200, contact)));
                })
                .catch(err => {
                    console.log("Error creating contact entry:", err);
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },

    /** Get all contact us entries
     */
    getContacts: (req, res) => {
        return new Promise((resolve, reject) => {
            ContactUsModel.findAll({
                order: [['created_at', 'DESC']]
            })
                .then(contacts => {
                    resolve(res.status(200).send(Utility.formatResponse(200, {
                        rows: contacts || [],
                        count: contacts?.length || 0
                    })));
                })
                .catch(err => {
                    console.log("Error fetching contacts:", err);
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    }
};

module.exports = ContactUsController;
