var Account = require('../models/Account');
const bcrypt = require("bcrypt");
var jsonwebtoken = require('jsonwebtoken');
var constant = require('../config/constant');
var helper = require('../router/helper');

const createAccount = async (req, res) => {
    var account = new Account({
        // _id: mongoose.Types.ObjectId,
        username: constant.defaultUserName,
        avatar: constant.defaultUserAvatar,
        email: req.body.email,
        password: req.body.password
    });

    await bcrypt.hash(account.password, 3).then((hash) => {
        account.password = hash
    });

    if (await Account.findOne({email: account.email})) {
        helper.emailUsedError(res);
    } else {
        return account.save().then((newAccount) => {
            jsonwebtoken.sign({email: account.email}, constant.appKey, { expiresIn: '2 days' }, (error, token) => {
                if (error) throw error;
                req.session.token = token;
                req.session.user = account;
                helper.registerSuccess(res, token, newAccount)
            });
        }).catch((error) => {
            console.log(`Create account error: ${JSON.stringify(error, null, 2)}`);
            helper.serverError(res)
        })
    }
};

const updateInformation = async (req, res) => {
    console.log(`req body: ${JSON.stringify(req.body, null, 2)}`);
    const id = req.body.userID;
    const updateObject = req.body.content;
    Account.updateOne({ _id: id }, { $set: updateObject })
        .exec().then(() => {
        Account.findById(id).then((updatedInformation) => {
            helper.updatePersonalInfSuccess(res, updatedInformation);
        })
    }).catch((error) => {
        console.log(`update profile error: ${JSON.stringify(error, null, 2)}`);
        helper.serverError(res)
    })
};

const signin = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    var userAccount = await Account.findOne({email: email}).lean();
    try {
        if (userAccount) {
            const match = await bcrypt.compare(password, userAccount.password);
            if (match) {
                jsonwebtoken.sign({email: email}, constant.appKey, { expiresIn: '2 days' }, (error, token) => {
                    if (error) console.log(`error: ${JSON.stringify(error, null, 2)}`);
                    delete userAccount.password;
                    req.session.user = userAccount;
                    req.session.token = token;
                    // console.log(`token: ${JSON.stringify(token)}`);
                    // console.log(`account: ${JSON.stringify(userAccount, null, 2)}`);
                    res.status(200).json({
                        success: true,
                        message: 'Đăng nhập tài khoản thành công',
                        data: {
                            token: token,
                            Account: userAccount
                        }
                    })
                });
            } else {
                helper.passwordNotMatchError(res)
            }
        } else {
            helper.notExistsEmailError(res)
        }
    } catch (error) {
        console.log(`error: ${JSON.stringify(error, null, 2)}`);
        helper.serverError(res)
    }
};

const getUserInf = async (req, res) => {
    const userID = req.body.userID;
    try {
        Account.findById(userID).then((account) => {
            helper.getProfileSuccessfull(res, account)
        }).catch((error) => {
            helper.notFoundAccountError(res, error)
        });
    } catch (error) {
        console.log(`Find user profile error: ${JSON.stringify(error, null, 2)}`);
        helper.serverError(res)
    }
};

module.exports = {
    createAccount,
    updateInformation,
    signin,
    getUserInf
};

