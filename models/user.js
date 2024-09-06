const { default: mongoose } = require('mongoose')
const { MONGODB_URL } = require('../utils/config')

mongoose.connect(MONGODB_URL).then(() => {
    console.log("connected")
})

const userSchema = new mongoose.Schema({
    name: String,
    username: {
        type: String,
        required: true,
        unique: true,
        minLength: 3
    },
    password: {
        type: String,
        required: true,
        minLength: 3
    },
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog"
        }
    ]
})

userSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject._v
        delete returnedObject.password
    }
})

const User = mongoose.model("User", userSchema)

module.exports = User