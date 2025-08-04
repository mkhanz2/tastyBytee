const mongoose= require('mongoose')

const userSchema= mongoose.Schema({
    imgUrl: String,
    itemName: String,
    productDescription: String,
    price: Number,
    email: String
})

module.exports= mongoose.model("food-cart", userSchema)