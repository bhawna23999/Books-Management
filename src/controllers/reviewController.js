const { default: mongoose } = require("mongoose")
const bookModel = require("../models/bookModel")
const reviewModel = require("../models/reviewModel")

const isValid = function(value){
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidRequestBody = function(requestBody){
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function(ObjectId){
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const validateRating = function(rating){
    return /^[12345]$/.test(rating)
}

const reviewBoook = async function(req,res)
{
    let paramId = req.params.bookId

    if(!isValidObjectId(paramId))
    return res.status(400).send({status:false, msg:"Please enter valid path Id"})

    let findBook = await bookModel.findById(paramId).select({__v:0})
    console.log(findBook)

    if(!findBook || findBook.isDeleted)
    return res.status(404).send({status:false, msg:"Book does not exist"})
   
    // res.status(200).send({status:true, data:findBook})
    const requestBody = req.body

    if(!isValidRequestBody(requestBody))
    return res.status(400).send({status:false, msg:"Please fill Details"})

    const {bookId, reviewedBy, reviewedAt, rating, review, isDeleted} = requestBody

    if(!isValid(bookId))
    return res.status(400).send({status:false, msg:"Please enter book Id"})
    // check for valid Id
    if(!isValidObjectId(bookId))
    return res.status(400).send({status:false, msg:"Please enter valid book Id"})
    // check with path id
    if(bookId !== paramId)
    return res.status(400).send({status:false, msg:"Plese enter book Id same as Path Id"})

    if(!isValid(reviewedBy))
    return res.status(400).send({status:false, msg:"Plese enter reviewer name"})

    if(!isValid(reviewedAt))
    return res.status(400).send({status:false, msg:"Plese enter review time"})

    if(!isValid(rating))
    return res.status(400).send({status:false, msg:"Plese enter Rating"})
    if(!(!isNaN(Number(rating))))
    return res.status(400).send({status:false, msg:"Please enter only natural no's"})   
    if(!validateRating(rating))
    return res.status(400).send({status:false, msg:"Plese enter rating from 1 to 5 in int form only"})    

    let reviewCreated = await reviewModel.create(requestBody)
   
    // await bookModel.findOneAndUpdate({_id:findBook},{$inc:{reviews:1}},{new:true})
    findBook.reviews = findBook.reviews + 1
    await findBook.save()

    let printReview = await reviewModel.findOne({_id:reviewCreated}).select({__v: 0,createdAt: 0,updatedAt: 0,isDeleted: 0})

    findBook = findBook.toObject()

    findBook.reviewsData = printReview


    res.status(200).send({status:true, message:"success", data:findBook})

}

const bookReviewBook = async function(req,res)
{
    const bookParamId = req.params.bookId

    if(!isValidObjectId(bookParamId))
    return res.status(400).send({status:false, msg:`this ${bookParamId} book Param Id is not valid`})

    let findBook = await bookModel.findById(bookParamId)

    if(!findBook || findBook.isDeleted)
    return res.status(404).send({status:false, message:"Book does not exist"})

    // res.status(200).send({status:false, message:"success", data:findBook})

    const reviewId = req.params.reviewId

    if(!isValidObjectId(reviewId))
    return res.status(400).send({status:false, msg:`This ${reviewId} Review Id is not a valid Id`})
 
    var findReview = await reviewModel.findOne({_id:reviewId, bookId:bookParamId, isDeleted:false})
    
    if(!findReview)
    return res.status(400).send({status:false, msg:"No review is found"})

    // res.status(200).send({status:false, message:"success" , data:findReview})

    const reviewedBody =  req.body

    if(!isValidRequestBody(reviewedBody))
    return res.status(400).send({status:false, message:"Please fill details for update review"})

    const {review, rating, reviewedBy} = reviewedBody

    if(review){
        if(!isValid(review)){
            return res.status(400).send({status:false, message:"Please enter Valid Review"})
        }
    }

    if(rating){
        if(!isValid(rating)){
            return res.status(400).send({status:false, message:"Please enter valid rating"})

        }
        if(!validateRating(rating)){
            return res.status(400).send({status:false, message:"Please enter rating from 1 to 5"})
        }
    }

    if(reviewedBy){
        if(!isValid(reviewedBy)){
            return res.status(400).send({status:false, message:"Please enter valid Reviewer's name"})
        }
    }
   
    const updatedData = {review, rating, reviewedBy}

    const updateReviewDetails = await reviewModel.findOneAndUpdate({_id:findReview},updatedData,{new:true})

    res.status(200).send({status:false, message:"Success", data:updateReviewDetails})

}

const deleteReview = async function(req,res)
{
    const bookId = req.params.bookId

    if(!isValidObjectId(bookId))
    return res.status(400).send({status:false, message:`This ${bookId} Book Id is not a valid Id`})

    let findBook = await bookModel.findById(bookId)

    if(!findBook || findBook.isDeleted)
    return res.status(404).send({status:false, message:"Book does not exist"})

    // res.status(200).send({status:true, message:"Success", data:findBook})

    const reviewId = req.params.reviewId

    if(!isValidObjectId(reviewId))
    return res.status(400).send({status:false, message:`This ${reviewId} is not a valid Review Id`})

    var findReview = await reviewModel.findOne({_id:reviewId, bookId:bookId, isDeleted:false})

    if(!findReview)
    return res.status(404).send({status:false, message:"Review does not exist"})

    // res.status(200).send({status:true, message:"false" , data:findReview})

    const deleteData = await reviewModel.findOneAndUpdate({_id:findReview},{isDeleted:true, deletedAt:Date.now()},{new:true})

    // res.status(200).send({status:false, message:"success", data: deleteData})

    // let updateBook = await bookModel.findOneAndUpdate({_id:findBook},{$inc:{reviews:-1}},{new:true})
    findBook.reviews = findBook.reviews === 0 ? 0 : findBook.reviews -1
    await findBook.save()

    res.status(200).send({status:true, message:"Success", data:"Data deleted Successfully"})
}

module.exports = {reviewBoook, bookReviewBook, deleteReview}