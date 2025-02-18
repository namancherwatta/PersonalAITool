import mongoose from "mongoose";

 
const healthrecordschema=new mongoose.Schema({
        date:{
            type:String,
            
        },
        bloodPressure:{
            type: String,
           
           
        },
        heartRate:{
            type: String,
         
    
        },
        sugarLevel:{
            type: String,
        
        },
        userId:{
            type:String,
        }

});

export const HealthRecord=mongoose.model("HealthRecord",healthrecordschema)