const express = require('express');
const router = express.Router();
const User = require('../models/User');

const multer  = require('multer');
const path = require('path');
const config = require('../config');
const nanoid = require('nanoid');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, config.uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, nanoid() + path.extname(file.originalname));
    }
});

const upload = multer({storage});

    router.get('/', (req, res) => {
        User.findAll({
            attributes: {
                exclude: ['password']
            }
        })
            .then(users => {
                res.json(users)
            })
            .catch(err => {
                res.send('error: ' + err)
            })
    });

    router.get('/:id', (req, res) => {
        User.findOne({
            where: {
                id: req.params.id
            },
            attributes: {
                exclude: ['password']
            }
        }).then(user => {
                if (user) {
                    res.json(user)
                } else {
                    res.send('Такого пользователя нет')
                }
        }).catch(err => {
            res.status(400).send('Ошибка: ' + err)
        })

    });

    router.post('/', upload.single('avatar'), async (req, res) => {
        const user = {
            displayName: req.body.displayName,
            phoneNumber: req.body.phoneNumber,
            password: req.body.password
        };

        if (req.file) {
            user.avatar = req.file.filename;
        }
        user.token = nanoid();
        const userFromDB = await User.findOne({
            where: {
                phoneNumber: req.body.phoneNumber
            },
        });

        if(userFromDB) {
            return res.status(400).send({message: 'Пользователь уже существует'});
        }

        User.create(user)
            .then(data => {
                const user = data.toJSON();
                delete user.password;
                res.json(user);
            })
            .catch(err => {
                res.json('error: ' + err)
            });
    });

    router.post('/sessions', async (req, res) => {
        const user = await User.findOne({
            where: {
                phoneNumber: req.body.phoneNumber
            },
        });

        if(!user) {
            return res.status(400).send({message: 'Такого пользователя нет'});
        }

        const isMatch = await user.checkPassword(req.body.password);

        if(!isMatch) {
            return res.status(400).send({message: 'Неверный пароль'});
        }

        user.update({token: nanoid()});
        const copyUser = user.toJSON();
        delete copyUser.password;
        res.status(200).json(copyUser);

    });

    router.delete('/sessions', async (req, res) => {
        const token = req.get("Token");
        const success = {message: "Вы вышли из сессии"};
        if(!token) return res.send(success);

        const user = await User.findOne({
            where: {
                token: token
            },
            attributes: {
                exclude: ['password']
            }
        });

        if(!user) return res.send(success);

        user.update({token: null});

        res.send(success);
    });



module.exports = router;
