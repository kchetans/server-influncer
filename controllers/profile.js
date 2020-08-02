const Profile = require('../models/Profile');
const validator = require('validator');

const jwt = require("jsonwebtoken")
const jwtKey = "influncer##321"
const jwtExpirySeconds = 3000


/**
 * POST /generate-otp
 */
exports.GenerateOTP = (req, res, next) => {
    console.log("inside generate otp",Number.isInteger(req.body.mobile))
    console.log("req.body.mobile.toString().length",req.body.mobile.toString().length)
   if (Number.isInteger(req.body.mobile)  && req.body.mobile.toString().length != 10){
       res.status(400).send({"status":"fail","message":"Mobile Number is not valid"})
   }
    var otp = Math.floor(1000 + Math.random() * 9000);
    console.log(otp);
    console.log("req.body.mobile",req.body.mobile)
    response = {"message":"","status":"","otp":0,"newUser":true}
    mobile = req.body.mobile.toString()
    Profile.findOne({"mobile":mobile}).exec((err, existProfile)=>{
        if(err){
            console.log(err)
            next(err)
        } 
        if(existProfile){
            console.log("old Profile")
 
         Profile.update({"mobile":mobile},{"$set":{"otp":otp}},function(err, doc) {
            if (err){
                response.message = err
                response.status = "fail"
                if(existProfile.profileComplete){
                    response.newUser = false
                } 
                return res.status(500).send(response);
            }
            response.message = "opt Sent"
            response.status = "pass"
            response.otp = otp
            if(existProfile.profileComplete){
                response.newUser = false
            } 
            return res.send(response);
        })}else{
            console.log("new Profile")
            profile  = new Profile({
                mobile:mobile,
                otp:otp,
                profileComplete:false
            })
       profile.save((err) => {
        if (err) {
            response.message = err
            response.status = "fail"
            return res.status(500).send(response);
        }
        response.message = "opt Sent"
        response.status = "pass"
        response.otp = otp
        return res.send(response);
        // res.send('Successfully registered');

      });
    }}
)};



/**
 * POST /verify-otp
 */
exports.VerifyOTP = (req, res, next) => {
    console.log("inside generate otp",Number.isInteger(req.body.mobile))
    console.log("req.body.mobile.toString().length",req.body.mobile.toString().length)
   if (Number.isInteger(req.body.mobile)  && req.body.mobile.toString().length != 10){
       res.status(400).send({"status":"fail","message":"Mobile Number is not valid"})
   }
    console.log("req.body.mobile",req.body.mobile)
    console.log("req.body.otp",req.body.otp)

    response = {"message":"","status":"","otp":0,"newUser":true}
    mobile = req.body.mobile.toString()
    Profile.findOne({"mobile":mobile,"otp":req.body.otp}).exec((err, verifyProfile)=>{
        if(err){
            console.log(err)
            next(err)
        } 
        console.log("verifyProfile",verifyProfile)
        if(verifyProfile){
            console.log("old Profile")

            const token = jwt.sign({ mobile }, jwtKey, {
                algorithm: "HS256",
                expiresIn: jwtExpirySeconds,
            })
            console.log("token:", token)
        	res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 })
 
    }else{
        console.log("invvalid otp")
    }
}
)};  



/**
 * POST /verify-otp
 */
exports.VerifyOTP = (req, res, next) => {
    console.log("inside generate otp",Number.isInteger(req.body.mobile))
    console.log("req.body.mobile.toString().length",req.body.mobile.toString().length)
   if (Number.isInteger(req.body.mobile)  && req.body.mobile.toString().length != 10){
       res.status(400).send({"status":"fail","message":"Mobile Number is not valid"})
   }
    console.log("req.body.mobile",req.body.mobile)
    console.log("req.body.otp",req.body.otp)

    response = {"message":"","status":"","token":""}
    mobile = req.body.mobile.toString()
    Profile.findOne({"mobile":mobile,"otp":req.body.otp}).exec((err, verifyProfile)=>{
        if(err){
            console.log(err)
            next(err)
        } 
        console.log("verifyProfile",verifyProfile)
        if(verifyProfile){
            console.log("old Profile")
            const token = jwt.sign({id: mobile }, jwtKey, {
                algorithm: "HS256",
                expiresIn: jwtExpirySeconds,
            })
            response.token = token
            response.message = "otp verified"
            response.status = "pass"
            response.profile = {
                "userName" : verifyProfile.userName,
                "gender" : verifyProfile.gender,
                "city"  : verifyProfile.city,
                "locality" : verifyProfile.locality
            }
            console.log(response)
          return res.send(response)
 
    }else{
        console.log("invalid otp !")
        response.message = "otp verified failed"
        response.status = "fail"
       return res.send(response)
    }
}
)};  
/**
 * POST /register-profile
 */
exports.RegisterProfile = (req, res, next) => {
    console.log("RegisterProfile::")
    var token = req.headers['authorization'];
    console.log("token::",token)
    console.log(JSON.stringify(req.headers));

    if (!token) return res.status(401).send({ status: "fail", message: 'No token provided.' });
    payload = jwt.verify(token, jwtKey)
    console.log("payload",payload)
    response = {"message":"","status":""}

    if (payload){
        profile  = new Profile({
            mobile:payload.id,
            profileComplete:true,
            userName:req.body.userName,
            gender:req.body.gender,
            city:req.body.city,
            locality:req.body.locality,
            referalCode:req.body.referalCode
        });

        Profile.update({"mobile":profile.mobile},{"$set":{"profileComplete":true,"userName":profile.userName,"gender":profile.gender,"city":profile.city,"locality":profile.locality,"referalCode":profile.referalCode}},function(err, doc) {
            if (err){
                console.log("update error")
                response.message = err
                response.status = "fail"
                return res.status(500).send(response);
            }
            response.message = "registered user"
            response.status = "pass"
            response.user = profile
            return res.send(response);
        })

    } else {
        response.message = "Invalid Token"
        response.status = "fail"
        return res.status(401).send(response);
    }
 };  