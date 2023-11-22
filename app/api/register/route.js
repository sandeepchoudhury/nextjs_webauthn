import { connectMongo } from "@/lib/dbConnect"
import User from "@/models/User";
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req){
    try{
        const {name,email,password} = await req.json()
        const hashpasswd = await bcrypt.hash(password,10)
        await connectMongo();
        const user = await User.create( { name,email, password:hashpasswd})
        console.log(user)
        return NextResponse.json({message: "User registered."},{status:201})
    }catch(error){
        console.log(error.MongoServerError)
        if (err.name === 'MongoError' && err.code === 11000) {
            // Duplicate email
            return  NextResponse.json({message: "Email is alsready registered."},{status:400})
          }
        return NextResponse.json({message: "Error occured while registering the user."},{status:500})
    }
}
