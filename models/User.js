import mongoose, { Schema, models } from "mongoose";

const Authenticator = new Schema({
    credentialID:{
        type:Buffer,
    },
    credentialPublicKey:{
        type:Buffer
    },
    counter:{
        type:Number,
        default:0
    },
    credentialBackedUp:{
        type:Boolean,
    },
    credentialDeviceType:{
        type:String
    },
    transports:{
        type:[String]
    }
})

const userSchema = new Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    image:{
        type:String,
        default:"/next.svg",
    },
    emailVerified:{
        type:Boolean,
        default:false
    },
    is2FAEnabled:{
        type:Boolean,
        default:false
    },
    currentChallenge:{
        type:String,
    },
    authenticators:{
        type:[Authenticator],
        default:undefined
    }
    
}, {timestamps:true})

const user = models.User || mongoose.model("User",userSchema)

export default user;

