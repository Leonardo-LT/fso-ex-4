const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require("./test_helper")
const User = require('../models/user')
const SECRET = require('../utils/config').SECRET
const jwt = require('jsonwebtoken')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})

    for (let blog of helper.multipleBlogsList) {
        let blogObject = new Blog(blog)
        await blogObject.save()
    }
})

describe("GET /api/blogs", () => {
    test("it should return a list of blog posts in JSON format", async () => {
        await api.get("/api/blogs")
            .expect(200)
            .expect("Content-Type", /application\/json/)
    })

    test("it should return all the available blog posts", async () => {
        let response = await api.get("/api/blogs")

        assert.strictEqual(response.body.length, helper.multipleBlogsList.length)
    })

    test("the unique identifier property should be named 'id'", async () => {
        let response = await api.get("/api/blogs")

        assert(response.body[0].id)
        assert.strictEqual(response.body[0]._id, undefined)
    })
})

describe("POST /api/blogs", async () => {
    let userForToken
    let token
    beforeEach(async () => {
        await User.deleteOne({ username: "leonaa" })
        let user = new User({
            name: "leona",
            username: "leonaa",
            password: "1234"
        })
    
        user = await user.save()
        userForToken = {
            username: user.username,
            id: user.id
        }
    
        token = jwt.sign(userForToken, SECRET)
    })

    test("it should add a valid blog correctly", async () => {
        const newBlog = {
            title: "Eating",
            author: "John",
            url: "url",
            likes: 71,
        }

        await api
            .post("/api/blogs")
            .send(newBlog)
            .auth(token, { type: "bearer"})
            .expect(201)

        let availableBlogs = await helper.getBlogsInDB()
        assert.strictEqual(availableBlogs.length, helper.multipleBlogsList.length + 1)     
        
        let blogTitles = availableBlogs.map(blog => blog.title)
        assert(blogTitles.includes("Eating"))
    })

    test("if the likes are missing it should default to 0", async () => {
        const newBlog = {
            title: "Eating",
            author: "John",
            url: "url"
        }

        await api.post("/api/blogs")
            .send(newBlog)
            .auth(token, { type: "bearer"})
            .expect(201)
        
        let availableBlogs = await helper.getBlogsInDB()
        assert.strictEqual(availableBlogs[availableBlogs.length - 1].likes, 0)
    })

    test("if the url or title property are missing it should respond with 400", async () => {
        let newBlog = {
            author: "John"
        }

        await api.post("/api/blogs")
            .send(newBlog)
            .auth(token, { type: "bearer"})
            .expect(400)

        newBlog = {
            title: "NewBlog",
            ...newBlog
        }

        await api.post("/api/blogs")
            .send(newBlog)
            .auth(token, { type: "bearer"})
            .expect(400)

        newBlog = {
            ...newBlog,
            title: undefined,
            url: "url"
        }

        await api.post("/api/blogs")
            .send(newBlog)
            .auth(token, { type: "bearer"})
            .expect(400)
    })

    test("if the user has a valid token it should add correctly a blog, the blog should have the use id", async () => {
        const newBlog = {
            title: "a",
            author: "John",
            url: "url"
        }
        
        let response = await api.post("/api/blogs")
            .send(newBlog)
            .auth(token, { type: "bearer" })
            .expect(201)

        assert.strictEqual(response.body.user, userForToken.id)
    })
})

describe("DELETE /api/blogs/:id", () => {
    let user
    let userBlogId
    let token
    beforeEach(async () => {
        await Blog.deleteOne({ id: userBlogId })
        await User.deleteOne({ username: "leonaa" })
        let newUser = new User({
            name: "leona",
            username: "leonaa",
            password: "1234"
        })
    
        newUser = await newUser.save()
        user = {
            username: newUser.username,
            id: newUser.id
        }

        token = jwt.sign(user, SECRET)

        let newBlog = {
            title: "newBlog",
            author: "user",
            url: "url"
        }
        
        let blogResponse = await api.post("/api/blogs")
            .auth(token, { type: "bearer" })
            .send(newBlog)

        userBlogId = blogResponse.body.id
    })

    test("if the id is valid it should remove the right blog", async () => {
        await api.delete(`/api/blogs/${userBlogId}`)
            .auth(token, { type: "bearer" })
            .expect(204)

        let availableBlogs = await helper.getBlogsInDB()
        assert(availableBlogs.every(blog => blog.id !== userBlogId))
    })

    test("it should not let unauthorized users delete blogs", async () => {
        let newUser = new User({
            name: "giovanni",
            username: "giovannino",
            password: "1234"
        })
    
        newUser = await newUser.save()
        let user2 = {
            username: newUser.username,
            id: newUser.id
        }
        let token2 = jwt.sign(user2, SECRET)
    
        let user2Blog = {
            title: "user2Blog",
            author: "user2",
            url: "url"
        }
    
        let blogResponse = await api.post("/api/blogs")
            .auth(token2, { type: "bearer"})
            .send(user2Blog)
            .expect(201)
        
        let createdBlogId = blogResponse.body.id
           
        await api.delete(`/api/blogs/${createdBlogId}`)
            .auth(token, { type: "bearer"})
            .expect(403) 
    
        let blogStillExists = await Blog.findById(createdBlogId)
        assert(blogStillExists, "Blog should still exist after unauthorized delete attempt")
    
        await User.deleteOne({ username: user2.username})
        await Blog.deleteOne({ _id: createdBlogId })
    })
    
    test("it should let authorized users delete their own blogs", async () => {
        let blogs = await Blog.find({ author: "user" })
        let blogToDelete = blogs[0]
    
        await api.delete(`/api/blogs/${blogToDelete._id}`)
            .auth(token, { type: "bearer"})
            .expect(204)
    
        let blogStillExists = await Blog.findById(blogToDelete._id)
        assert(!blogStillExists, "Blog should be deleted after authorized delete")
    })
})

describe("PUT /api/blogs/:id", () => {
    test("if the new value for likes property is valid it should update the blog likes property", async () => {
        let blogs = await helper.getBlogsInDB()
        let id = blogs[0].id

        await api.put(`/api/blogs/${id}`)
            .send({ likes: 23 })
            .expect(201)

        let availableBlogs = await helper.getBlogsInDB()
        let updatedBlogLikes = availableBlogs[0].likes

        assert.strictEqual(updatedBlogLikes, 23)
    })
})

describe("POST /api/users", () => {
    beforeEach(async () => {
        await User.deleteMany({})
    })

    test("creation succeed with a valid username", async () => {
        let newUser = {
            username: "juan",
            name: "juan nua",
            password: "mooh"
        }

        await api.post("/api/users")
            .send(newUser)
            .expect(201)

        let availableUsers = await helper.getUserInDB()
        let usernames = availableUsers.map(user => user.username)
        assert(usernames.includes("juan"))
    })

    test("creation fails if the username is shorter than 3 characters", async () => {
        let newUser = {
            username: "ja",
            name: "jacob",
            password: "gelato"
        }

        await api.post("/api/users")
            .send(newUser)
            .expect(400)
    })

    test("creation fails if the password is shorter than 3 characters", async () => {
        let newUser = {
            username: "jaca",
            name: "jacob",
            password: "ge"
        }

        await api.post("/api/users")
            .send(newUser)
            .expect(400)
    })

    test("creation fails it the username was already used", async () => {
        let newUser = {
            username: "jaca",
            name: "jacob",
            password: "gelato"
        }

        await api.post("/api/users")
            .send(newUser)
            .expect(201)

        await api.post("/api/users")
            .send(newUser)
            .expect(400)
    })
})

after(async () => {
    await mongoose.connection.close()
})
