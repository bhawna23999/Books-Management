const jwt = require('jsonwebtoken')
const { default: mongoose } = require("mongoose")

const bookModel = require("../models/bookModel")

const isValidObjectId = function(ObjectId){
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const auth = function(req,res,next){
    try
    {
        let token = req.headers['x-api-key'] || req.headers['x-Api-key']

        if(!token){
            res.status(403).send({status:false , message:"Token must be present"})
        }
    
        const decoded = jwt.verify(token , "Project-3" )
    
        if(!decoded){
            res.satus(400).send({status:false, message:'Invalid authentication token in request'})
        }
        // console.log(decoded.userId)
    
        next()
    }
    catch(err)
    {
        console.log(err.message)
        res.status(500).send({status:false, Error: err.message})
    }

}

const authorization = async function(req,res,next){

    let token = req.headers['x-api-key'] || req.headers['x-Api-Key']
    if(!token)
    return res.status(401).send({status:false, message:"token  must be present"})

    let decoded = jwt.verify(token ,"Project-3")

    if(!decoded)
    return res.status(401).send({status:false, message:"Invalid authentication token in request"})

    let tokenuserId = decoded.userId
    console.log(req.userId)

    let userId = req.body.userId
    let paramId = req.params.bookId

    if(userId)
    {
        if(tokenuserId != userId) 
        return res.status(400).send({status:false, message:"This userId not matched with token userId"})
    }
    else
    {   
        if(!isValidObjectId(paramId))
        return res.status(400).send({status:false, msg:`this ${paramId} path Id is not a valid ID`})

        let book = await bookModel.findById(paramId)

        //Autherozation
        if(tokenuserId != book.userId)
        return res.status(400).send({status:false, message:"This userId of book is not matched with token user Id"})

        if(!book || book.isDeleted)
        return res.status(404).send({status:false, message:"Book does not exist"})

    }

    next()

}

module.exports = {auth, authorization}