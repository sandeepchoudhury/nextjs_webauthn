
import { NextResponse } from "next/server";
import {rpID }    from "@/app/api/auth/[...nextauth]/options"
import { connectMongo } from "@/lib/DBConnect";
import User from "@/models/User";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import {fromBase64} from "@/lib/convert"

export async function POST(req) {
    try {

        await connectMongo();
        const {email} = await req.json();
        console.log("EMAIL -> ", email);
        const user = await User.findOne({email}).select("authenticators")
        if (user.authenticators == null){
            return new NextResponse("no Authenticators or users registered.",{status:401})
        }
        const existingAuthenticators = user.authenticators;
        const options = await generateAuthenticationOptions({
            allowCredentials: existingAuthenticators.map((existingAuthenticator) => ({
              id: fromBase64(existingAuthenticator.authenticatorID),
              type: "public-key",
              transports:existingAuthenticator.transports
            })),
            userVerification: "preferred",
            rpID,
          });

        user.currentChallenge = options.challenge;
        user.save()
        console.log("[AUTHENTICATION OPTIONS] ", options)
        return new NextResponse(JSON.stringify(options),{status:200})
    } catch (error) {
        console.log("[AUthentication Options] ", error)
        return new NextResponse(error, { status: 401 });
    }
}