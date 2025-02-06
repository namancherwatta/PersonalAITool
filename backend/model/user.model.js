import mongoose from "mongoose";
import validator from "validator";


const userSchema=new mongoose.Schema({
        name:{
            type:String,
            required: true
        },
        email:{
            type: String,
            required: true,
            unique: true,
            validate:[validator.isEmail,"Kindly enter a valid Email"]

        },
        phone:{
            type: Number,
            required : true,
            unique: true
        },
        password:{
            type: String,
            required:true,
            select: false,
            minlength: 6
        },
        token:{
            type:String,
        }

});

export const User=mongoose.model("User",userSchema)