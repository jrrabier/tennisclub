const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const transporter = require('../services/emailService');
const validationService = require('../services/validationService');
const errorMsg = require('../assets/messages/error-messages.json');
const successMsg = require('../assets/messages/success-messages.json');
const infoMsg = require('../assets/messages/info-messages.json');
const mixinService = require('../services/mixinService')

const User = require('../models/users');

// Register
router.post('/register', (req, res, next) => {
    let newUser = req.body;
    let isMailValid = validationService.isMailValid(newUser.mail);


    User.addUser(newUser, (err, user) => {
        if (err) {
            res.status(200).json({success: false, msg: errorMsg.accountNotCreated});
        } else {
            res.status(201).json({success: true, msg: successMsg.accountCreated});
        }
    });
});

router.post('/authenticate', (req, res, next) => {
    const login = req.body;

    User.getUserByMail(login.mail, (err, user) => {
        if (err) {
            throw err;
        }
        if (user == undefined) {
            return res.status(200).json({success: false, msg: errorMsg.noAccount})    
        }

        User.comparePassword(login.psw, user.psw, (err, isMatch) => {
            if (err) {
                throw err;
            }
            if (isMatch) {
                const token = jwt.sign({user}, config.secret, {
                    expiresIn: 604800 // 1 semaine
                });

                res.json({
                    success: true,
                    token: `Bearer ${token}`,
                    user: {
                        id: user.id,
                        lastname: user.lastname,
                        firstname: user.firstname,
                        mail: user.mail,
                        avatar: user.avatar,
                        sex: user.sex_id
                    }
                });
            } else {
                return res.status(200).json({success: false, msg: errorMsg.incorrectLogin})  
            }
        });
    });
});

router.get('/profile', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.json(req.user);
});

router.post('/update', (req, res) => {
    let updatedUser = req.body;
    if (updatedUser.psw) {
        mixinService.validateAndHashPassword(updatedUser.psw, (err, hash) => {
            if (err) {
                res.status(200).json({success: false, msg: err.message});
            }
            updatedUser.psw = hash;

            User.updateUser(updatedUser, (err, result) => {
                if (err) {
                    throw err;
                }
                return res.status(200).json({success: true, msg: successMsg.accountUpdated});
            });
        });
    } else {
        User.updateUser(updatedUser, (err, result) => {
            if (err) {
                throw err;
            }
            return res.status(200).json({success: true, msg: successMsg.accountUpdated});
        });
    }
});

router.route('/forgot-password')
    .post((req, res) => {
        const mail = req.body.mail;

        User.getUserByMail(mail, (err, user) => {
            if (err) {
                throw err;
            }
            if (!user) {
                return res.status(200).json({success: false, msg: errorMsg.noAccount})
            } else {
                const token = jwt.sign({user}, config.secret, {
                    expiresIn: 2 * 60 * 60 // 2 heures
                });

                let mailOptions = {
                    from: '"Tennis Club Selles-sur-Cher" <jrmrabier@gmail.com>',
                    to: mail,
                    subject: 'Test',
                    html: transporter.forgotPasswordTemplate(`Bearer ${token}`)
                }
                transporter.sendMail(mailOptions, (err, info) => {
                    if (!err) {
                        return res.status(200).json({success: true, msg:`Un mail vient de vous être envoyé à l'adresse fournie`});
                    } else {
                        return info;
                    }
                });
            }
        });
    })

router.route('/reset-password')
    .post(passport.authenticate('jwt', {session: false}), (req, res) => {
        let isSamePassword = req.body.newPsw === req.body.newPswConfirm;
        
        if (isSamePassword) {
            if (validationService.isPasswordValid(req.body.newPsw)) {
                console.log(req.user, req.body);
                User.updatePassword(req.user, req.body.newPsw, (err, doc) => {
                    if (err) {
                        throw err;
                    }
                    if (doc) {
                        return res.status(200).json({success: true, msg: `Votre mot de passe a bien été mis à jour`})
                    }
                });
            } else {
                return res.status(200).json({success: false, msg: errorMsg.invalidPsw});
            }
        } else {
            return res.status(200).json({success: false, msg:`Les deux mots de passe doivent être identiques`});
        }
    })

module.exports = router;