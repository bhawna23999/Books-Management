const { default: mongoose } = require("mongoose")
const bookModel = require("../models/bookModel")
const userModel = require("../models/userModel")
const reviewModel = require("../models/reviewModel")

const isValid = function(value){
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length=== 0) return false 
    if(typeof value === 'number' && value.toString().trim().length === 0 ) return false 
    return true
}

const isValidRequestBody = function(requestBody){
    return Object.keys(requestBody).length > 0 
}

const isValidObjectId = function(ObjectId){
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const books = async function(req,res)
{
    try
    {
        let requestBody = req.body
        if(!isValidRequestBody(requestBody))
        return res.status(400).send({status:false, msg:"Please fill Book Details"})
    
        //Extract params
        const {title, excerpt, userId, ISBN, category, subcategory, releasedAt} = requestBody
    
        // Vlaidate Start
    
        if(!isValid(title))
        return res.status(400).send({status:false, msg:"Title is Required"})
        // check for unique title
        let uniqueTitle = await bookModel.findOne({title})
        if(uniqueTitle)
        return res.status(400).send({status:false, msg:"This Title is already exist"})

        if(!isValid(excerpt))
        return res.status(400).send({status:false, msg:"Excerpt is Required"})

        if(!isValid(userId))
        return res.status(400).send({status:false,msg:"UserId is Required"})
        if(!isValidObjectId(userId))
        return res.status(400).send({status:false, msg:"Please enter valid Id"})
        //check in DB user ID exist or not
        let userDb = await userModel.findById(userId)
        if(!userDb)
        return res.status(400).send({status:false, msg:"This user is not exist"})

        if(!isValid(ISBN))
        return res.status(400).send({status:false, msg:"ISBN is Required"})
        //Check for valid ISBN no
        if(!/^\+?([1-9]{3})\)?[-. ]?([0-9]{10})$/.test(ISBN))
        return res.status(400).send({ status: false, message: 'Please provide a valid ISBN' })        
        //check for unique ISBN
        let ISBNnum = await bookModel.findOne({ISBN})
        if(ISBNnum)
        return res.status(400).send({status:false, msg:"This ISBN no is already exist"})

        if(!isValid(category))
        return res.status(400).send({status:false, msg:"category is required"})

        if(!isValid(subcategory))
        return res.status(400).send({status:false, msg:"subcategory is required"})

        if(!isValid(releasedAt))
        return res.status(400).send({status:false, msg:"release time is required"})
        if(!/((\d{4}[-])(\d{2}[-])(\d{2}))/.test(releasedAt))
        return res.status(400).send({ status: false, message: 'Please provide a valid Date(YYYY-MM-DD)' })
        
        if (requestBody.isDeleted == true) requestBody.deletedAt = Date.now()
         
        let book = await bookModel.create(requestBody)
        res.status(201).send({status:true, message:"success", data:book})

    }
    catch(err)
    {
        console.log(err.message)
        res.status(500).send({status:false, Error: err.message})
    }

}   

const getBooks = async function(req,res)
{
    try
    {
        const filterQuery = {isDeleted:false}

        const queryParams = req.query

        if(isValidRequestBody(queryParams))
        {
            const {userId, category, subcategory} = queryParams

            if(isValid(userId)){
                if(!isValidObjectId(userId)){
                    return res.status(400).send({status:false, msg:`this ${userId} user Id is not a valid Id`})
                }
                filterQuery['userId'] = userId.trim()              
            }

            if(isValid(category)){
                filterQuery['category'] = category
            }

            if(isValid(subcategory)){
                filterQuery['subcategory'] = subcategory
            }
        }

        const books = await bookModel.find(filterQuery).select("title excerpt userId category reviews releasedAt").collation({locale : "en"}).sort({ title: 1 })

        if(!isValidRequestBody(books))
        return res.status(404).send({status:false, msg:"No book found"})

        res.status(200).send({status:true, msg:"success", data:books})

    }
    catch(err)
    {
        console.log(err.message)
        res.status(500).send({status:false, Error: err.message})
    }   
}

const getReviewBooks = async function(req,res)
{
    let pathParam = req.params.bookId

    if(!isValidObjectId(pathParam))
    return res.status(400).send({status:false, message:"This is not valid"})

    let reviewBook = await bookModel.findById(pathParam,{ISBN:0, __v:0})
    
    if(!reviewBook || reviewBook.isDeleted)
    return res.status(404).send({status:false, message:"No Book Found"})

    const {title, excerpt, userId, category, subcategory, isDeleted, reviews, releasedAt} = reviewBook

    // console.log({...reviewBook})
    // res.status(200).send({status:true, message:"success", data:reviewBook})
    // reviewBook = reviewBook.toObject()
    // reviewBook = JSON.parse(JSON.stringify(reviewBook))
    // console.log({...reviewBook})

    const reviewsData  = await reviewModel.find({ bookId: reviewBook, isDeleted: false })
    .select({ deletedAt: 0, isDeleted: 0, createdAt: 0, __v: 0, updatedAt: 0 })

    const BookDetails = {title, excerpt, userId, category, subcategory, isDeleted, reviews, releasedAt ,reviewsData }
    
    // reviewBook.reviewsData = getReviewsData

    res.status(200).send({status:true, message:"success", data:BookDetails})

}

const updateBook = async function(req,res)
{

    const paramId = req.params.bookId

    let bodyData = req.body
    // console.log(bodyData)
    if(!isValidRequestBody(bodyData))
    return res.status(400).send({status:false, msg:"Please enter data for update"})

    //Extract params
    let {title, excerpt, releasedAt, ISBN} = bodyData

    // console.log(book)
    // console.log(bodyData)

    if(title){
        if(!isValid(title)){
            return res.status(400).send({status:false, message:"Please enter valid Title"})
        }
        const checkTitle = await bookModel.findOne({title})
        if(checkTitle){
            return res.status(400).send({status:false, msg:"This title is already exist"})
        }
    }
   
    if(excerpt){
        if(!isValid(excerpt)){
            return res.status(400).send({status:false, message:"Please enter valid excerpt"})
        }
    }

    if(releasedAt){
        if(!isValid(releasedAt)){
            return res.status(400).send({status:false, message:"Please enter valid time"})
        }
        if(!/((\d{4}[-])(\d{2}[-])(\d{2}))/.test(releasedAt))
        return res.status(400).send({ status: false, message: 'Please provide a valid Date(YYYY-MM-DD)' })
    }
    
    if(ISBN){
        if(!isValid(ISBN)){             
            return res.status(400).send({status:false, message:"Please enter valid ISBN no"})
        }
        if(!/^\+?([1-9]{3})\)?[-. ]?([0-9]{10})$/.test(ISBN)){
            return res.status(400).send({ status: false, message: 'Please provide a valid ISBN' })
        }
        const checkISBN = await bookModel.findOne({ISBN})
        if(checkISBN)
        return res.status(400).send({status:false, msg:` this ${ISBN} ISBN no is already exist`})
    }
   
    const updatedBookData = {title, excerpt, ISBN, releasedAt}
    // console.log(updateData)

    const updatedBook = await bookModel.findOneAndUpdate({ _id: paramId }, updatedBookData, { new: true })

    res.status(200).send({status:false, message:"success", data:updatedBook})

}

const deleteBook = async function(req,res){

    const paramId = req.params.bookId
    // console.log(paramId)

    let bookDelete = await bookModel.findOneAndUpdate({_id:paramId},{isDeleted:true, deletedAt:new Date()},{new:true})

    res.status(200).send({status:true, messsage:"success", data:bookDelete})

}

module.exports = {books, getBooks, getReviewBooks, updateBook, deleteBook}