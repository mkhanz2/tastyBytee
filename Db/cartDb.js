const mongoose= require('mongoose')

const cartSchema= mongoose.Schema({
    email: String,
    imgUrl: String,
    itemName: String,
    productDescription: String,
    price: Number
})

module.exports= mongoose.model("cartItem",cartSchema)