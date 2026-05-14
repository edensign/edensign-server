/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const SalonEmployeeController = {
    /** Finding salon in the database from user id that is received */
    getBySalonId: async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('salon_employee')
                .select('*')
                .eq('salon_id', req.params.salon_id);

            if (error) throw error;

            if (data && data.length > 0) {
                res.status(200).send(Utility.formatResponse(200, data));
            } else {
                // Return success with empty array if not found to avoid breaking multiple API calls on frontend
                res.status(200).send(Utility.formatResponse(200, []));
            }
        } catch (err) {
            console.error("Error fetching salon employee:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Create salon employee in the database */
    createSalonEmployee: async (req, res) => {
        try {
            const payload = { ...req.body, created_by: req.body.userId };
            delete payload.userId;

            const { error } = await supabase
                .from('salon_employee')
                .insert(payload);

            if (error) throw error;
            res.status(200).send(Utility.formatResponse(200, `Success`));
        } catch (err) {
            console.error("createSalonEmployee error:", err);
            res.status(409).send(Utility.formatResponse(409, "Error"));
        }
    },

    /** Updating salon employee in the database based on parent */
    updateSalonEmployee: async (req, res) => {
        try {
            const payload = { ...req.body, updated_by: req.body.userId, updated_at: new Date().toISOString() };
            const id = payload.id;
            delete payload.userId;
            delete payload.id;

            const { error } = await supabase
                .from('salon_employee')
                .update(payload)
                .eq('id', id);

            if (error) throw error;
            res.status(200).send(Utility.formatResponse(200, `Updated Successfully`));
        } catch (err) {
            console.error("updateSalonEmployee error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get salon employees from the salon_employee table in the database, this api is for edensign website */
    getSalonEmployee: async (req, res) => {
        try {
            const salonCode = req.body.code;
            const serviceId = req.body.service_id;

            const data = await Utility.executeRpc('get_salon_employee', {
                p_salon_code: salonCode,
                p_service_id: serviceId
            });

            if (data && data.length > 0) {
                res.status(200).send(Utility.formatResponse(200, data));
            } else {
                res.status(404).send(Utility.formatResponse(404, `No Data Found`));
            }
        } catch (err) {
            console.error("getSalonEmployee error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = SalonEmployeeController;
