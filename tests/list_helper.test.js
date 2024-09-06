const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    }
  ]

  const multipleBlogsList = [
      {
        _id: "5a422a851b54a676234d17f7",
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
        __v: 0
      },
      {
        _id: "5a422aa71b54a676234d17f8",
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
        __v: 0
      },
      {
        _id: "5a422b3a1b54a676234d17f9",
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
        __v: 0
      },
      {
        _id: "5a422b891b54a676234d17fa",
        title: "First class tests",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10,
        __v: 0
      },
      {
        _id: "5a422ba71b54a676234d17fb",
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
        likes: 0,
        __v: 0
      },
      {
        _id: "5a422bc61b54a676234d17fc",
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2,
        __v: 0
      }  
    ]

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => { 
    test('when list has only one blog, equals the likes of that', () => {
      const result = listHelper.totalLikes(listWithOneBlog)
      assert.strictEqual(result, 5)
    })

    test('list with multiple blogs', () => {
        assert.strictEqual(listHelper.totalLikes(multipleBlogsList), 36)
    })

    test('if the list does not have blogs, it should return 0', () => {
        assert.strictEqual(listHelper.totalLikes([]), 0)
    })
  })

describe("favoriteBlog", () => {
    test('when list has only one blog, it should return that blog', () => {
        assert.deepStrictEqual(listHelper.favoriteBlog(listWithOneBlog), {
            _id: '5a422aa71b54a676234d17f8',
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
            likes: 5,
            __v: 0
          })
    })

    test('when the list has multiple blogs, it should return the blog with the most likes', () => {
        assert.deepStrictEqual(listHelper.favoriteBlog(multipleBlogsList), {
            _id: "5a422b3a1b54a676234d17f9",
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 12,
            __v: 0
          })
    })

    test('when the list is empty it should return null', () => {
        assert.deepStrictEqual(listHelper.favoriteBlog([]), null)
    })
})

describe("mostBlogs", () => {
  test("when list has only one blog, it should return the author of that blog", () => {
    assert.deepStrictEqual(listHelper.mostBlogs(listWithOneBlog), {
      author: "Edsger W. Dijkstra",
      blogs: 1
    })
  })

  test("when list has multiple blogs, it should return the author with the most blogs", () => {
    assert.deepStrictEqual(listHelper.mostBlogs(multipleBlogsList), {
      author: "Robert C. Martin",
      blogs: 3
    })
  })

  test("when list is empty it should return null", () => {
    assert.deepStrictEqual(listHelper.mostBlogs([]), null)
  })
})

describe("mostLikes", () => {
  test("when list has only one blog, it should return the author of that blog", () => {
    assert.deepStrictEqual(listHelper.mostLikes(listWithOneBlog), {
      author: "Edsger W. Dijkstra",
      likes: 5
    })
  })

  test("when list has multiple blogs, it should return the author with the most likes", () => {
    assert.deepStrictEqual(listHelper.mostLikes(multipleBlogsList), {
      author: "Robert C. Martin",
      likes: 12
    })
  })

  test("when list is empty, it should return null", () => {
    assert.deepStrictEqual(listHelper.mostLikes([]), null)
  })
})