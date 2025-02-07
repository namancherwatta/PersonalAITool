import mongoose from "mongoose";


const todoSchema=new mongoose.Schema({


      userId:{
            type:String,
            required: true,  
        },
       text:{
            
            type: String,
            required: true,
            unique: true
        
        },
        completed:{
            type:  Boolean,
            required: true,
        },

});

export const Todo=mongoose.model("Todo",todoSchema)