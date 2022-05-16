const express = require('express')
const router = express.Router();
const userController = require("../controllers/userController")
const bookController = require("../controllers/bookController")
const reviewController = require("../controllers/reviewController")
const authentication = require("../middleware/authentication")



router.get("/test-me",function(req,res){
    res.send("My first ever api!")
})

//user
router.post("/register", userController.register)

router.post("/login", userController.login)

//book
router.post("/books" , authentication.auth,authentication.authorization,bookController.books)

router.get("/getBooks", authentication.auth, bookController.getBooks)

router.get("/getReviewBooks/:bookId", authentication.auth,bookController.getReviewBooks)

router.put("/updateBook/:bookId" , authentication.auth,authentication.authorization,bookController.updateBook)

router.delete("/deleteBook/:bookId",authentication.auth, authentication.authorization,bookController.deleteBook)

//review
router.post("/books/:bookId/review", reviewController.reviewBoook)

router.put("/books/:bookId/review/:reviewId", reviewController.bookReviewBook)

router.delete("/books/:bookId/review/:reviewId" , reviewController.deleteReview)


module.exports = router;