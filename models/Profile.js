const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    mobile: { type: String, unique: true },
    name: String,
    userName: String,
    gender: String,
    city: String,
    locality: String,
    referalCode: String,
    profileComplete:Boolean,
    otp:Number,
    status:String
  }, { timestamps: true });
  

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
