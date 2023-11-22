import { getServerSession} from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import NextAuthOptionsMyProject , { expectedOrigin, rpID, rpName }    from "@/app/api/auth/[...nextauth]/options"
import { connectMongo } from "@/lib/dbConnect";
import User from "@/models/User";
import { generateRegistrationOptions,verifyRegistrationResponse } from "@simplewebauthn/server";
import { toBase64 } from "@/lib/convert";

export async function GET(req){
    const session = await getServerSession(NextAuthOptionsMyProject);
    if(!session){
        return new NextResponse("Unauthorized no session found",{status:401})
    }

    const userId = session.id;
    if(!userId){
        return new NextResponse("Unauthorized no user found",{status:401})
    }

    await connectMongo();
    const user = await User.findById({"_id":userId})
    const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: user.id,
        userName: user.name ?? "",
        // Don't prompt users for additional information about the authenticator
        // (Recommended for smoother UX)
        attestationType: "none",
        // Prevent users from re-registering existing authenticators
        excludeCredentials: [],
        authenticatorSelection: {
          // "Discoverable credentials" used to be called "resident keys". The
          // old name persists in the options passed to `navigator.credentials.create()`.
          residentKey: "required",
          userVerification: "preferred",
        },
      });
      user.currentChallenge = options.challenge;
      user.save()
      console.log("REGISTER GET ", options)
      return new NextResponse(JSON.stringify(options),{
        headers:{
            "Content-Type": "application/json",
        }
      })
}


export async function POST(req){
    const session = await getServerSession(NextAuthOptionsMyProject);
    if(!session){
        return new NextResponse("Unauthorized no session found",{status:401})
    }
    const userId = session.id;
    if(!userId){
        return new NextResponse("Unauthorized no user found",{status:401})
    }
    await connectMongo();
    const user = await User.findById({"_id":userId})
    
    
    const response = await req.json()
    const expectedChallenge = user.currentChallenge;
    console.log("REGISTRATION POST :", response)

    let verification;
    try {
        if (expectedChallenge)
            verification = await verifyRegistrationResponse({
            response,
            expectedChallenge,
            expectedOrigin,
            expectedRPID: rpID,
            requireUserVerification: true,
            });
            console.log("VERIFICATION RESPONSE :", verification)
    } catch (error) {
        console.error(error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
    }

    if (!verification) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const { verified } = verification;
    const { registrationInfo } = verification;
    const {
            credentialPublicKey,
            credentialID,
            counter,
            credentialBackedUp,
            credentialDeviceType,
        } = registrationInfo || {};
    

        // Save the authenticator info so that we can
        // get it by user ID later
        if (!credentialID || !credentialPublicKey) {
            return new Response("Unauthorized", { status: 401 });
        }

        const authenticator =[{
            credentialID:Buffer.from(credentialID),
            credentialPublicKey:Buffer.from(credentialPublicKey),
            counter: counter ?? 0,
            credentialBackedUp: credentialBackedUp ?? false,
            credentialDeviceType: credentialDeviceType ?? "singleDevice",
            authenticatorID:toBase64(credentialID),
            transports:response.response.transports
        }]

        if (user.authenticators === undefined){
            user.authenticators = authenticator
        }else {
            user.authenticators.push(authenticator)
        }

        user.is2FAEnabled = true;
        user.currentChallenge ="";
        user.save();

        return new NextResponse(JSON.stringify({verified}),{status:200})
}
