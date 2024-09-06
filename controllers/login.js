const loginRouter = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const SECRET = require('../utils/config').SECRET

loginRouter.post("/", async (request, response) => {
    let { username, password } = request.body

    let user = await User.findOne({ username })
    let isPasswordCorrect = user === null ? false : bcrypt.compare(password, user.password)

    if (!(user && isPasswordCorrect)) {
        response.status(401).json({
            error: "invalid password or username"
        })
    }

    let userForToken = {
        username: user.username,
        id: user.id
    }

    let token = jwt.sign(userForToken, SECRET)

    response.status(200).json({
        token, username: user.username, name: user.name
    })
})

module.exports = loginRouter