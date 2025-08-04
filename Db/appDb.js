require('dotenv').config(); 
const { name } = require('ejs')
const mongoose= require('mongoose')

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

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