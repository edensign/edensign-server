/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const stateController = {
  /** Get states from database based on country */
  getStates: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('state')
        .select('*')
        .eq('country_id', req.params.id);

      if (error) throw error;

      if (data && data.length > 0) {
        res.status(200).send(Utility.formatResponse(200, { list: data }));
      } else {
        res.status(404).send(Utility.formatResponse(404, `No Data Found`));
      }
    } catch (err) {
      console.error("getStates error:", err);
      res.status(500).send(Utility.formatResponse(500, err.message));
    }
  },

  /** Creating a new state record in the database. */
  createState: async (req, res) => {
    try {
      const payload = { ...req.body, created_by: req.body.id };
      delete payload.userId;
      delete payload.status; // Ensure status is removed since it's not in DB

      const { data, error } = await supabase
        .from('state')
        .insert(payload)
        .select('*')
        .single();

      if (error) throw error;

      res.status(200).send(Utility.formatResponse(200, { state: data }));
    } catch (err) {
      console.error("createState error:", err);
      res.status(409).send(Utility.formatResponse(409, err.message));
    }
  },

  /** Finding state in database, if found then updating it with newly entered data. */
  updateState: async (req, res) => {
    try {
      const payload = { ...req.body };
      delete payload.userId;
      delete payload.status; // Ensure status is removed since it's not in DB
      delete payload.id; // Primary key cannot be updated

      const { error } = await supabase
        .from('state')
        .update(payload)
        .eq('id', req.params.id);

      if (error) throw error;

      res.status(200).send(Utility.formatResponse(200, `Updated Successfully`));
    } catch (err) {
      console.error("updateState error:", err);
      res.status(500).send(Utility.formatResponse(500, err.message));
    }
  },

  /** Finding the matched id record of state in database, if found then deleting the particular record. */
  removeState: async (req, res) => {
    try {
      const { error } = await supabase
        .from('state')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;

      res.status(200).send(Utility.formatResponse(200, `Deleted Successfully`));
    } catch (err) {
      console.error("removeState error:", err);
      res.status(500).send(Utility.formatResponse(500, err.message));
    }
  },

  /** Get all the states from database for edensign website */
  getAll: async (req, res) => {
    try {
      const { data, count, error } = await supabase
        .from('state')
        .select('*', { count: 'exact' });

      if (error) throw error;

      if (count > 0) {
        res.status(200).send(Utility.formatResponse(200, { count, rows: data }));
      } else {
        res.status(404).send(Utility.formatResponse(404, `No Data Found`));
      }
    } catch (err) {
      console.error("state getAll error:", err);
      res.status(500).send(Utility.formatResponse(500, err.message));
    }
  }
};

module.exports = stateController;
