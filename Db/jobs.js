const moongose= require('mongoose')

const jobSchema= mongoose.Schema({
    Email: String,
    Title: String,
    Description: String,
    Experience: Number,
    Type: String,
    Skills: String
})

module.exports= mongoose.model("job",jobSchema)