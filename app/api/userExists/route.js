import { connectMongo } from "@/lib/DBConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req){
    try {
        await connectMongo();
        const {email} = await req.json()
        const user = await User.findOne({email:email}).select("_id");
        console.log(user)
        return NextResponse.json({user},{status:201})
    } catch (error) {
        console.log(error)
        return NextResponse.json({message: "Error occured while registering the user."},{status:500})
    }
}