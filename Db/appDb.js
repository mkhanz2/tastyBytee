require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("DB Error:", err));

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  address: String,
  number: Number,
  dob: Date
});

module.exports = mongoose.model("user", userSchema);
