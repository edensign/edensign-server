/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const JobSeekerController = {
    /** Get Job Seekers from database based on query type, page, size and search if provided */
    getAll: async (req, res) => {
        try {
            const { page, size, search } = req.query;
            const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));

            let query = supabase
                .from('job_seeker')
                .select('*', { count: 'exact' })
                .eq('status', 'active');

            if (search) {
                query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,status.ilike.${search}%`);
            }

            const { data, count, error } = await query
                .order('updated_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;

            if (count > 0) {
                res.status(200).send(Utility.formatResponse(200, { count, rows: data }));
            } else {
                res.status(404).send(Utility.formatResponse(404, `No Data Found`));
            }
        } catch (err) {
            console.error("jobSeeker getAll error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Creating Job Seeker in the database */
    createJobSeeker: async (req, res) => {
        try {
            const payload = { ...req.body, created_by: req.body.userId };
            delete payload.userId;

            const { data, error } = await supabase
                .from('job_seeker')
                .insert(payload)
                .select('id')
                .single();

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, { id: data.id }));
        } catch (err) {
            console.error("createJobSeeker error:", err);
            res.status(409).send(Utility.formatResponse(409, err.message));
        }
    },

    /** Updating Job Seeker in the database */
    updateJobSeeker: async (req, res) => {
        try {
            const payload = { ...req.body, updated_by: req.body.userId, updated_at: new Date().toISOString() };
            const id = payload.id;
            delete payload.userId;
            delete payload.id;

            const { error } = await supabase
                .from('job_seeker')
                .update(payload)
                .eq('id', id);

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, `Updated Successfully`));
        } catch (err) {
            console.error("updateJobSeeker error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get all the job seekers & their associated addresses by performing left outer join on both tables */
    getJobSeekerDetail: async (req, res) => {
        try {
            const { page, size } = req.params;
            const gender = req.query.gender || null;
            let minExp = null;
            let maxExp = null;
            const skills = req.query.skills || null;

            if (req.query.experience) {
                const experienceRange = req.query.experience.split(',');
                minExp = parseInt(experienceRange[0]);
                maxExp = parseInt(experienceRange[1]);
            }

            const data = await Utility.executeRpc('get_job_seeker_detail', {
                p_gender: gender,
                p_min_experience: minExp,
                p_max_experience: maxExp,
                p_skills: skills
            });

            if (data && data.length > 0) {
                // Apply pagination manually since RPC handles the complex joins
                const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));
                const paginatedData = data.slice(offset, offset + limit);
                // Also update the result_count to reflect pagination size
                paginatedData.forEach(row => { row.result_count = data.length });
                
                res.status(200).send(Utility.formatResponse(200, paginatedData));
            } else {
                res.status(404).send(Utility.formatResponse(404, `No Data Found`));
            }

        } catch (err) {
            console.error("getJobSeekerDetail error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = JobSeekerController;
