const lodash = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((acc, blog) => {
        return blog.likes + acc
    }, 0)
}

const favoriteBlog = (blogs) => {
    let favorite = null
    blogs.forEach(blog => {
        if (!favorite || blog.likes > favorite.likes) {
            favorite = blog
        }
    });

    return favorite
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) return null

    let groupedBlogs = lodash.countBy(blogs, 'author')
    let blogsArray = lodash.toPairs(groupedBlogs)

    let result = lodash.maxBy(blogsArray, lodash.nth(1))

    return {
        author: result[0],
        blogs: result[1]
    }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) return null

    let groupedBlogs = lodash.groupBy(blogs, 'author')
    let temp = lodash.transform(groupedBlogs, (result, value, key) => {
        result[key] = lodash.sumBy(value, 'likes')
    }, {})

    let result = lodash.maxBy(lodash.toPairs(temp), lodash.nth(1))

    return {
        author: result[0],
        likes: result[1]
    }
}

module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}

