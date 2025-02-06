import mongoose from "mongoose";


const todoSchema=new mongoose.Schema({
    userId: String,
    text: String,
    completed: Boolean,

      userId:{
            type:String,
            required: true,  
        },
       text:{
            
            type: String,
            required: true,
        
        },
        completed:{
            type:  Boolean,
            required: true,
        },

});

export const Todo=mongoose.model("Todo",todoSchema)