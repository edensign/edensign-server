/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const cityController = {
  /** Creating city in the database */
  createCity: async (req, res) => {
    try {
      const payload = { ...req.body, created_by: req.body.id };
      delete payload.userId; // Ensure userId is removed if present

      const { data, error } = await supabase
        .from('city')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      res.status(200).send(Utility.formatResponse(200, { city: data }));
    } catch (err) {
      console.error("createCity error:", err);
      res.status(409).send(Utility.formatResponse(409, err.message));
    }
  },

  /** Get cities from database */
  getCities: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('city')
        .select('*')
        .eq('state_id', req.params.id);

      if (error) throw error;

      if (data && data.length > 0) {
        res.status(200).send(Utility.formatResponse(200, { list: data }));
      } else {
        res.status(404).send(Utility.formatResponse(404, `No Data Found`));
      }
    } catch (err) {
      console.error("getCities error:", err);
      res.status(500).send(Utility.formatResponse(500, err.message));
    }
  },

  /** Updating city in database */
  updateCity: async (req, res) => {
    try {
      const payload = { ...req.body };
      delete payload.userId; // Cleanup

      const { error } = await supabase
        .from('city')
        .update(payload)
        .eq('id', req.params.id);

      if (error) throw error;
      res.status(200).send(Utility.formatResponse(200, `Updated Successfully`));
    } catch (err) {
      console.error("updateCity error:", err);
      res.status(500).send(Utility.formatResponse(500, err.message));
    }
  },

  /** Finding the matched id record of city in database then deleting the particular record */
  removeCity: async (req, res) => {
    try {
      const { error } = await supabase
        .from('city')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;
      
      // Supabase delete doesn't return count easily without another query or checking data,
      // but if no error is thrown, we assume success or it was already deleted.
      res.status(200).send(Utility.formatResponse(200, `Deleted Successfully`));
    } catch (err) {
      console.error("removeCity error:", err);
      res.status(500).send(Utility.formatResponse(500, err.message));
    }
  },

  /** Get all the cities from database for edensign website */
  getAll: async (req, res) => {
    try {
      const { data, count, error } = await supabase
        .from('city')
        .select('*', { count: 'exact' });

      if (error) throw error;

      if (count > 0) {
        res.status(200).send(Utility.formatResponse(200, { count, rows: data }));
      } else {
        res.status(404).send(Utility.formatResponse(404, `No Data Found`));
      }
    } catch (err) {
      console.error("city getAll error:", err);
      res.status(500).send(Utility.formatResponse(500, err.message));
    }
  }
};

module.exports = cityController;
