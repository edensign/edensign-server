/**
 * Copyright © 2026, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const AppointmentModel = require("../../model/appointment");
const SalonEmployeeModel = require("../../model/salonEmployee");
const SalonModel = require("../../model/salon");
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
    createAppointment: async (req, res) => {
        try {
            const { date, time_slot, services, salon_employee, booked_for, customer_name, customer_contact } = req.body;

            if (!date || !time_slot || !salon_employee) {
                return res.status(400).send(Utility.formatResponse(400, "Missing required fields: date, time_slot, salon_employee"));
            }

            let customerId = req.userId;

            // Check if user is Admin or Salon
            // effective way is to check if customer_contact is provided, if so, we treat it as an Admin/Salon creating for a customer
            if (customer_contact && customer_name) {
                // Check if customer exists
                let customer = await require("../../model/customer").findOne({ where: { contact_no: customer_contact } });

                if (!customer) {
                    // Create new customer (Guest)
                    // We need a password for the model, so we generate a random one or a default
                    const randomPassword = Math.random().toString(36).slice(-8);
                    const hashedPassword = await Utility.createHash(randomPassword);

                    customer = await require("../../model/customer").create({
                        username: customer_name,
                        contact_no: customer_contact,
                        password: hashedPassword,
                        created_at: new Date()
                    });
                }
                customerId = customer.id;
            }

            // Check if slot is already booked
            const searchDate = new Date(date);
            const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

            const existingAppointment = await AppointmentModel.findOne({
                where: {
                    salon_employee: salon_employee,
                    time_slot: time_slot,
                    date: {
                        [Op.between]: [startOfDay, endOfDay]
                    }
                }
            });

            if (existingAppointment) {
                return res.status(409).send(Utility.formatResponse(409, "This slot is already booked"));
            }

            // Create the appointment
            const appointment = await AppointmentModel.create({
                date: new Date(date),
                time_slot,
                services: services || '',
                salon_employee,
                booked_for: booked_for || 'self',
                customer_id: customerId
            });

            return res.status(200).send(Utility.formatResponse(200, appointment));

        } catch (err) {
            console.log("Error creating appointment:", err);
            return res.status(500).send(Utility.formatResponse(500, err));
        }
    },

    /** Get all appointments with salon and employee details
     */
    getAppointments: (req, res) => {
        return new Promise((resolve, reject) => {
            const { salonId } = req.query;
            let condition = "";

            if (salonId) {
                condition = `WHERE s.id = ${salonId}`;
            }

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
                ${condition}
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
    },
    /** Get Kanban slots: all stylists for a salon on a given date with their appointments
     * Query params: date (YYYY-MM-DD), salonId
     * Returns: { stylists, appointments, salonHours }
     */
    getKanbanSlots: async (req, res) => {
        try {
            const { date, salonId } = req.query;

            if (!date || !salonId) {
                return res.status(400).send(Utility.formatResponse(400, "Missing required query params: date, salonId"));
            }

            // Fetch salon details for opening/closing hours
            const salon = await SalonModel.findOne({ where: { id: salonId } });
            const salonHours = salon ? {
                opening_time: salon.opening_time,
                closing_time: salon.closing_time,
                closed_on: salon.closed_on
            } : null;

            // Fetch all stylists for this salon
            const stylists = await SalonEmployeeModel.findAll({
                where: { salon_id: salonId },
                attributes: ['id', 'name', 'services', 'contact_no']
            });

            if (!stylists || stylists.length === 0) {
                return res.status(200).send(Utility.formatResponse(200, {
                    stylists: [],
                    appointments: [],
                    salonHours
                }));
            }

            const stylistIds = stylists.map(s => s.id);

            // Build date range for the selected day
            const searchDate = new Date(date);
            const startOfDay = new Date(date + 'T00:00:00.000Z');
            const endOfDay = new Date(date + 'T23:59:59.999Z');

            // Fetch all appointments for those stylists on that date (with customer info)
            const queryString = `
                SELECT
                    a.id,
                    a.time_slot,
                    a.services,
                    a.booked_for,
                    a.salon_employee,
                    a.date,
                    c.username as customer_name,
                    c.contact_no as customer_contact
                FROM appointment a
                LEFT JOIN customer c ON a.customer_id = c.id
                WHERE a.salon_employee IN (${stylistIds.join(',')})
                AND DATE(a.date) = '${date}'
                ORDER BY a.time_slot ASC
            `;

            const appointments = await Utility.executeQuery(queryString);

            return res.status(200).send(Utility.formatResponse(200, {
                stylists: stylists.map(s => s.toJSON ? s.toJSON() : s),
                appointments: appointments || [],
                salonHours
            }));

        } catch (err) {
            console.log("Error fetching kanban slots:", err);
            return res.status(500).send(Utility.formatResponse(500, err.message || err));
        }
    }
};

module.exports = AppointmentController;
