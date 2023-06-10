/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const Utility = require("../../utility");

const commonController = {
    /** Get user information of specified table from database
     */
    getByPk: (req, res) => {
        const Model = Utility.getModel(req.params.table);
        let exclude = {};
        return new Promise((resolve, reject) => {
            Model.findByPk(req.params.id, { attributes: exclude })
                .then(data => {
                    if (!data) {
                        resolve(res.status(404).send(Utility.formatResponse(404, `Data Not Found`)));
                    } else {

                        resolve(res.status(200).send(Utility.formatResponse(200, data)));
                    };
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },
}

module.exports = commonController;
