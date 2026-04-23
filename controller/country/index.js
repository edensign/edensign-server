/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const countryController = {
  /** Get countries from database */
  getCountries: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('country')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        res.status(200).send(Utility.formatResponse(200, { list: data }));
      } else {
        res.status(404).send(Utility.formatResponse(404, `No Data Found`));
      }
    } catch (err) {
      console.error("getCountries error:", err);
      res.status(500).send(Utility.formatResponse(500, err.message));
    }
  },

  /** Creating new country in the database */
  createCountry: async (req, res) => {
    try {
      const payload = { ...req.body, created_by: req.body.id };
      delete payload.userId; // Cleanup

      const { data, error } = await supabase
        .from('country')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      res.status(200).send(Utility.formatResponse(200, { country: data }));
    } catch (err) {
      console.error("createCountry error:", err);
      res.status(409).send(Utility.formatResponse(409, err.message));
    }
  },

  /** Finding country in database, if found then updating it with newly entered data. */
  updateCountry: async (req, res) => {
    try {
      const payload = { ...req.body };
      delete payload.userId;

      const { error } = await supabase
        .from('country')
        .update(payload)
        .eq('id', req.params.id);

      if (error) throw error;
      res.status(200).send(Utility.formatResponse(200, `Updated Successfully`));
    } catch (err) {
      console.error("updateCountry error:", err);
      res.status(500).send(Utility.formatResponse(500, err.message));
    }
  },

  /** Finding the matched id record of country in database, if found then deleting the particular record. */
  removeCountry: async (req, res) => {
    try {
      const { error } = await supabase
        .from('country')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;
      res.status(200).send(Utility.formatResponse(200, `Deleted Successfully`));
    } catch (err) {
      console.error("removeCountry error:", err);
      res.status(500).send(Utility.formatResponse(500, err.message));
    }
  }
};

module.exports = countryController;
