import mongoose from "mongoose";


const doctorvisitschema=new mongoose.Schema({
        date:{
            type:String, 
        },
        reason:{
            type: String,
        },
        doctorName:{
            type: String,
        },
        prescription:{
            type: [String],
        },
        userId:{
            type:String,
        }

});

export const DoctorVisit=mongoose.model("DoctorVisit",doctorvisitschema)