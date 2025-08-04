const { name } = require('ejs')
const mongoose= require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/tastyBytee")

const userSchema= mongoose.Schema({
    username: String,
    name:String,
    email:String,
    password: String,
    address: String,
    number: Number,
    dob:Date
})

module.exports= mongoose.model("user", userSchema)