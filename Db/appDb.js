require('dotenv').config(); 
const { name } = require('ejs')
const mongoose= require('mongoose')

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
   useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
  tlsAllowInvalidCertificates: false
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