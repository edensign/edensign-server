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
            const search = req.query.search || null;

            if (req.query.experience) {
                const experienceRange = req.query.experience.split(',');
                minExp = parseInt(experienceRange[0]);
                maxExp = parseInt(experienceRange[1]);
            }

            // If we have a text search, we don't query by skill IDs in the database RPC,
            // because we will perform dynamic name and skill name text matching in JavaScript.
            const data = await Utility.executeRpc('get_job_seeker_detail', {
                p_gender: gender,
                p_min_experience: minExp,
                p_max_experience: maxExp,
                p_skills: search ? null : skills
            });

            let filteredData = data || [];

            // 1. If searching, filter by name and skill/service name in JS using a smart multi-word search
            if (search && filteredData.length > 0) {
                const searchLower = search.toLowerCase();
                const { data: allSkills, error: skillsError } = await supabase
                    .from('skill')
                    .select('id, name')
                    .eq('status', 'active');

                if (!skillsError && allSkills) {
                    const skillMap = {};
                    allSkills.forEach(s => {
                        if (s.name) skillMap[s.id.toString()] = s.name.toLowerCase();
                    });

                    filteredData = filteredData.filter(row => {
                        // Combine name and all skill names for smart search
                        const rowSkillNames = [];
                        if (row.skills) {
                            row.skills.split(',').forEach(id => {
                                const skillName = skillMap[id.trim()];
                                if (skillName) rowSkillNames.push(skillName);
                            });
                        }
                        const combinedText = `${row.name || ''} ${rowSkillNames.join(' ')}`.toLowerCase();

                        // Match every word in the search query against the combined text
                        const searchWords = searchLower.split(/\s+/).filter(w => w.length > 0);
                        return searchWords.every(word => combinedText.includes(word));
                    });
                }
            }

            // 2. If skills parameter (dropdown filter) is provided and search was also used
            // (since p_skills was set to null in the RPC call for the search path)
            if (skills && search && filteredData.length > 0) {
                const selectedSkillIds = skills.split(',');
                filteredData = filteredData.filter(row => {
                    if (!row.skills) return false;
                    const rowSkillIds = row.skills.split(',');
                    return selectedSkillIds.some(id => rowSkillIds.includes(id.trim()));
                });
            }

            if (filteredData && filteredData.length > 0) {
                // Apply pagination manually since RPC handles the complex joins
                const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));
                const paginatedData = filteredData.slice(offset, offset + limit);
                // Also update the result_count to reflect pagination size
                paginatedData.forEach(row => { row.result_count = filteredData.length });
                
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
