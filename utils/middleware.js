const SECRET = require('../utils/config').SECRET
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const tokenExtractor = (request, response, next) => {
    let authorization = request.get("authorization")
    
    if (authorization && authorization.startsWith("Bearer ")) {
       authorization = authorization.replace("Bearer ", "")
       request.token = jwt.verify(authorization, SECRET)
    } else {
        request.token = null
    }
    
    next()
}

const userExtractor = async (request, response, next) => {
    if(!request.token) {
        return response.status(403).end()
    }

    let userId = request.token.id

    let user = await User.findById(userId)

    request.user = user

    next()
}

module.exports = {
    tokenExtractor, userExtractor
}