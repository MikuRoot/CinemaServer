var express = require('express');
var accountController = require('../../controllers/accountController');
var helper = require('../helper');

const router = express.Router();

router.post('/profile', async function (req, res) {
    if (!req.headers.token)
        helper.unauthorizedError(res);
    else
        await accountController.getUserInf(req, res);
});

router.post('/profile/update', async function (req, res) {
    if (!req.headers.token)
        helper.unauthorizedError(res);
    else
        await accountController.updateInformation(req, res);
});

router.post(`/create`, async function (req, res) {
    if (!req.body.email || req.body.email === "")
        helper.notFoundEmailError(res);
    else
        await accountController.createAccount(req, res)
        // next(createAccount)
});

router.post(`/signin`, async function (req, res) {
    if (!req.body.email || req.body.email === "")
        helper.notFoundEmailError(res);
    else
        await accountController.signin(req, res)
});

module.exports = router;
