const User = require('../models/user')
const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')


usersRouter.post("/", async (request, response) => {
    let { name, username, password } = request.body

    if (password.length < 3) {
        return response.status(400).json({
            error: "password must be at least 3 characters"
        })
    }

    let saltRounds = 10
    let passwordHash = await bcrypt.hash(password, saltRounds)

    let newUser = new User({
        name, 
        username,
        password: passwordHash
    })

    try {
        const savedUser = await newUser.save()
        response.status(201).json(savedUser)
    } catch {
        response.status(400).json({
            error: "username must be at least 3 characters and has to be unique"
        })
    } 
})

usersRouter.get("/", async (request, response) => {
    let users = await User
        .find({}).populate("blogs")

    response.json(users)
})

module.exports = usersRouter