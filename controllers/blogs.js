const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')


blogsRouter.get('/', async (request, response) => {
  let blogs = await Blog
  .find({}).populate("user")
  response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  let userId = request.user.id

  if(!(userId)) {
    response.status(401).json({
      error: "invalid token"
    })
  } 

  let user = await User.findById(userId)

  try {
    let newBlog = {
      likes: 0,
      user: user.id,
      ...request.body
    }
  
    let blogObj = new Blog(newBlog)
  
    let result = await blogObj.save()
    response.status(201).send(result)
  } catch {
    response.status(400).end()
  }
})

blogsRouter.delete('/:id', middleware.userExtractor,async (request, response) => {
  try {
    let id = request.params.id
    let blog = await Blog.findById(id)
    let userId = request.user.id

    if (blog.user.toString() === userId) {
      await Blog.findByIdAndDelete(id)
      response.status(204).end()
    } else {
      response.status(403).end()
    }
    
  } catch {
    response.status(400).end()
  }
})

blogsRouter.put("/:id", async (request, response) => {
  let id = request.params.id
  let update = {
    likes: request.body.likes
  }

  try {
    await Blog.findByIdAndUpdate(id, update)
    response.status(201).end()
  } catch {
    response.status(400).end()
  }
})

module.exports = blogsRouter