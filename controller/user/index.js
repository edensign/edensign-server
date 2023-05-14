const UserModel = require("../../model/user");
const Utility = require("../../utility/index");


const userController = {
    register: (req, res) => {
        return new Promise((resolve, reject) => {
            const payload = req.body;
            UserModel.findOne({
                where: { email: req.body.email }
            }).then(user => {
                if (!user) {
                    Utility.createHash(payload.password)
                        .then((hash) => {
                            payload.password = hash;
                            UserModel.create(payload)
                                .then((user) => {
                                    const token = Utility.getSignedToken(user.id);
                                    resolve(res.status(200).send({ auth: true, token: token }));
                                })
                                .catch((err) => {
                                    reject(res.status(204).send("Error ", err));
                                })
                            })
                            .catch(err => {
                                reject(err);
                            })
                        } else {
                            resolve(res.status(501).send("This Email Is Already Used!"));
                        }
                    })
                    .catch(err => {
                        reject(res.status(204).send("Error ", err));
                })
            })
        },
    login: (req, res) => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({
                where: { username: req.body.username }
                }).then((user) => {
                    if (user) {
                        Utility.comparePassword(req.body.password, user.password)
                            .then((isMatch) => {
                                if (isMatch) {
                                    const token = Utility.getSignedToken(user.id);
                                    resolve(res.status(200).send({ auth: true, token: token }));
                                } else {
                                    resolve(res.status(200).send("No Match Found"));
                                }
                            })
                    } else {
                        reject(res.status(204).send("Error"));
                    }
                })
            })
        },
    profile: (req, res) => {
        return new Promise((resolve, reject) => {
          UserModel.findByPk(req.body.userId, { attributes: { exclude: ['password'] }})
            .then(user => {
                if(!user)  resolve(res.status(404).send("User Not Found"));
                else  resolve(res.status(200).send(user));
            })
            .catch(err => {
                reject(err);
            })
        })
    },
    updateUser: (req, res) => {
        return new Promise((resolve, reject) => {
            UserModel.findByPk(req.body.userId)
                .then(user => {
                    if(user) {
                    const updatedUserObject = {...user, ...req.body};
                    UserModel.update({ ...updatedUserObject }, { where: { id: req.body.userId } })
                        .then(updatedData=> {
                            resolve(res.status(200).send("Updated Successfully!"));
                        })
                        .catch(err => {
                            reject(res.status(500).send('Error ', err));
                        })
                    }
                })
                .catch(err => {
                    reject(res.status(500).send('Error ', err));
                })
        })
    }
}

module.exports = userController;
