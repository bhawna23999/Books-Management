const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")

const isValid = function(value)
{
    if(typeof value === 'undefined' || value === null)
    return false
    if(typeof value === 'string' && value.trim().length === 0)
    return false
    return true
}

let isValidRequestBody = function(requestBody){
    return Object.keys(requestBody).length > 0
}

let isValidTitle = function(title){
    return ["Mr", "Mrs", "Miss"].indexOf(title) !== -1
}

const register = async function(req,res)
{
    try
    {
        let requestBody = req.body

        //Validation Start

        if(!isValidRequestBody(requestBody))
        return res.status(400).send({status:false, msg:"Please enter User details"})

        //Extract params
        const {title, name, phone, email, password, address} = requestBody

        if(!isValid(title))
        return res.status(400).send({status:false, msg:"Title is Required"})
        if(!isValidTitle(title))
        return res.status(400).send({status:false, msg:"title should be among Mr, Mrs, Miss"})

        if(!isValid(name))
        return res.status(400).send({status:false, msg:"Name is Required"})

        if(!isValid(phone))
        return res.status(400).send({status:false, msg:"Phone No is Required"})
        //check for Phone no is valid or not
        if(!(/^[6-9]\d{9}$/.test(phone)))
        return res.status(400).send({status:false, msg:"This Number is not valid"})
        // check for unique phone no
        let number = await userModel.findOne({phone})
        if(number)
        return res.status(400).send({status:false, msg:"This Number is already registered"})

        if(!isValid(email))
        return res.status(400).send({status:false, msg:"Mail is Required"})
        //check for mail is valid or not
        if(!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/))
        return res.status(400).send({status:false, msg:"Invalid MailId"})
        //check for unique mail
        let mail = await userModel.findOne({email})
        if(mail)
        return res.status(400).send({status:false, msg:"This mail is already registered"})

        if(!isValid(password))
        return res.status(400).send({status:false, msg:"Password is Required"})
        //check for password length
        if(!(password.length >= 8) || !(password.length <= 15))
        return res.status(400).send({status:false, msg:"Password should have length in range 8 to 15"})

        // Validation Ends

        let userDATA = {title, name, phone, email, password, address}

        let userCreated = await userModel.create(userDATA)
        res.status(201).send({status:true, message:"success", data:userCreated})


    }
    catch(err)
    {
        console.log(err.message)
        res.status(500).send({status:false, Error: err.message})
    }
}

const login = async function(req,res)
{
    try
    {
        let requestBody = req.body
        if(!isValidRequestBody(requestBody))
        return res.status(400).send({status:false, msg:"Please Enter Login Details"})

        // Extract params
        const { email, password } = requestBody

        // Validate starts

        if(!isValid(email))
        return res.status(400).send({ status: false, message: 'Email is required' })
   
        if(!isValid(password))
        return res.status(400).send({ status: false, message: 'Password is required' })
         
        // Validation ends

        let user = await userModel.findOne({email, password})
        if(!user)
        return res.status(401).send({status:false, msg:"Invalid login credentials"})

        let token = await jwt.sign(

            {
                userId : user._id,
                iat : Math.floor(Date.now()/1000),
                exp : Math.floor(Date.now()/1000) * 10 * 60 * 60
            },
            "Project-3"    
        )

        // if(!token)
        // return res.status(400).send({status:false, msg:"token must be present"})

        res.setHeader("x-api-key", token)
        res.status(200).send({status:true, message:"success", data:token})
    }
    catch(err)
    {
        console.log(err.message)
        res.status(500).send({status:false, Error: err.message})
    }
    
}

module.exports = {register, login}