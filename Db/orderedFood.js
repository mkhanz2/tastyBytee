const mongoose= require('mongoose')

const userSchema= mongoose.Schema({
    imgUrl:String,
    itemName: String,
    productDescription:String,
    price: Number,
    shipment: Number,
    totalPrice: Number,
    email: String
})

module.exports= mongoose.model("OrderedFood", userSchema)