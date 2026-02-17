/**
 * Copyright © 2026, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const AppointmentModel = require("../../model/appointment");
const Utility = require("../../utility");
const { Op } = require("sequelize");

const AppointmentController = {
    /** Get booked slots for a specific employee and date
     */
    getBookedSlots: (req, res) => {
        return new Promise((resolve, reject) => {
            const { employee_id, date } = req.body;

            if (!employee_id || !date) {
                return resolve(res.status(400).send(Utility.formatResponse(400, "Missing employee_id or date")));
            }

            // Create date range for the entire day
            const searchDate = new Date(date);
            const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

            AppointmentModel.findAll({
                where: {
                    salon_employee: employee_id,
                    date: {
                        [Op.between]: [startOfDay, endOfDay]
                    }
                },
                attributes: ['time_slot']
            })
                .then(appointments => {
                    const bookedSlots = appointments.map(a => a.time_slot);
                    resolve(res.status(200).send(Utility.formatResponse(200, bookedSlots)));
                })
                .catch(err => {
                    console.log("Error fetching booked slots:", err);
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },

    /** Create a new appointment
     */
    createAppointment: (req, res) => {
        return new Promise((resolve, reject) => {
            const { date, time_slot, services, salon_employee, booked_for } = req.body;

            if (!date || !time_slot || !salon_employee) {
                return resolve(res.status(400).send(Utility.formatResponse(400, "Missing required fields: date, time_slot, salon_employee")));
            }

            // Check if slot is already booked
            const searchDate = new Date(date);
            const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

            AppointmentModel.findOne({
                where: {
                    salon_employee: salon_employee,
                    time_slot: time_slot,
                    date: {
                        [Op.between]: [startOfDay, endOfDay]
                    }
                }
            })
                .then(existingAppointment => {
                    if (existingAppointment) {
                        return resolve(res.status(409).send(Utility.formatResponse(409, "This slot is already booked")));
                    }

                    // Create the appointment
                    AppointmentModel.create({
                        date: new Date(date),
                        time_slot,
                        services: services || '',
                        salon_employee,
                        booked_for: booked_for || 'self',
                        customer_id: req.userId  // Get from verified token
                    })
                        .then(appointment => {
                            resolve(res.status(200).send(Utility.formatResponse(200, appointment)));
                        })
                        .catch(err => {
                            console.log("Error creating appointment:", err);
                            reject(res.status(500).send(Utility.formatResponse(500, err)));
                        });
                })
                .catch(err => {
                    console.log("Error checking existing appointment:", err);
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },

    /** Get all appointments with salon and employee details
     */
    getAppointments: (req, res) => {
        return new Promise((resolve, reject) => {
            const queryString = `
                SELECT 
                    a.id,
                    a.date,
                    a.time_slot,
                    a.services,
                    a.booked_for,
                    a.customer_id,
                    c.username as customer_name,
                    c.contact_no as customer_contact,
                    se.name as employee_name,
                    se.contact_no as employee_contact,
                    s.name as salon_name,
                    s.area as salon_area
                FROM appointment a
                LEFT JOIN customer c ON a.customer_id = c.id
                LEFT JOIN salon_employee se ON a.salon_employee = se.id
                LEFT JOIN salon s ON se.salon_id = s.id
                ORDER BY a.date DESC, a.time_slot ASC
            `;

            Utility.executeQuery(queryString)
                .then(response => {
                    resolve(res.status(200).send(Utility.formatResponse(200, {
                        rows: response || [],
                        count: response?.length || 0
                    })));
                })
                .catch(err => {
                    console.log("Error fetching appointments:", err);
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    }
};

module.exports = AppointmentController;
