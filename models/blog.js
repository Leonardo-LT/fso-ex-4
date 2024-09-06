const { default: mongoose, Schema } = require('mongoose')
const { MONGODB_URL } = require('../utils/config')
const logger = require('../utils/logger')

mongoose.connect(MONGODB_URL).then(() => {
    logger.info("connected")
})

const blogSchema = new mongoose.Schema({
  title: { 
    type: String,
    required: true
  },
  author: String,
  url: {
    type: String,
    required: true
  },
  likes: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
})

blogSchema.set("toJSON", { getters: true, transform: (doc, ret) => {
  ret.id = ret._id
  delete ret._id
  return ret
} })

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog