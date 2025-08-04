mongoose= require('mongoose')

const userSchema=mongoose.Schema({
    itemName: String,
    productDescription: String,
    price: String,
    shipment: Number,
    totalPrice: Number,
    imgUrl: String,   
    email: String
})

module.exports= mongoose.model("itemsOrdered", userSchema)