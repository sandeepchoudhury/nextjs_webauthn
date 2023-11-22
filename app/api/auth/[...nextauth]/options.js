import { connectMongo } from "@/lib/DBConnect";
import User from "@/models/User";
import NextAuth,{AuthOptions} from "next-auth";
import CredentialsProvider  from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"
import { verifyAuthenticationResponse } from "@simplewebauthn/server";

export const rpName = "NextAuth.js + MongoDB + SimpleWebAuthn Example";
export const rpID = process.env.NODE_ENV === "production" ? "nextjs-webauthn-eta.vercel.app" : "localhost";
export const origin = process.env.NODE_ENV === "production" ? `https://${rpID}` : `http://${rpID}`;
export const expectedOrigin = process.env.NODE_ENV === "production" ? origin : `${origin}:3000`;



const NextAuthOptionsMyProject = {    
    providers: [
        CredentialsProvider({
            name:"credentials",
            credentials: {},

            async authorize(credentials){
                // const user = {id:"1"}
                // return user;
                const {email,password} =  credentials;

                try {
                    await connectMongo();
                    const user = await User.findOne({ email });
                    
                    if (!user) return null
                    const passwordMatch = await bcrypt.compare(password,user.password);
                    if (!passwordMatch) return null
                    console.log(user)
                    return user;


                } catch (error) {
                    console.log(error)
                    return null
                }
            },
        }),
        CredentialsProvider({
            id: "webauthn",
            name: "WebAuthn",
            credentials: {},
            async authorize(credentials, request) {
                console.log("calling from WebAuthn Next Auth Option file.")
                const authenticationResponse = JSON.parse(request.body?.verification);
                const emailFromBrowser = JSON.parse(request.body?.email);
                console.log("[authenticationResponse]",authenticationResponse);
                console.log("[emailFromBrowser]",emailFromBrowser);
                
                try {
                    await connectMongo();
                    const _creadentialID = authenticationResponse.id
                    const user = await User.findOne({email:emailFromBrowser,"authenticators.authenticatorID":_creadentialID})

                    if (!user) { console.log("Email not in DB"); return null}
                    const expectedChallenge = user.currentChallenge
                    const authenticationByUser = user.authenticators

                    if (!authenticationByUser?.length){ console.log("No Authenticators in DB", user.email); return null}
                    if (!authenticationResponse.id === authenticationByUser[0].authenticatorID) { console.log("ID of response not mathcing ID in DB", authenticationResponse.id); return null}
                    
                    let verification;
                    try {
                        verification = await verifyAuthenticationResponse({
                            response:authenticationResponse,
                            expectedChallenge,
                            expectedOrigin,
                            expectedRPID:rpID,
                            authenticator:{
                                credentialID: new Uint8Array(Buffer.from(authenticationByUser[0].credentialID)),
                                credentialPublicKey: new Uint8Array(Buffer.from(authenticationByUser[0].credentialPublicKey)),
                                counter:authenticationByUser[0].counter
                            }
                        });
                        console.log("[AUTHENTICATION SERVER RESPONSE] :",verification)

                    } catch (error) {
                        console.error(error)
                        return null
                    }

                    const {verified} = verification || {};
                    if (verified){
                        user.currentChallenge =""
                        //user.authenticators[0].counter = Number(verification.auth)
                        user.save();
                        return user
                    }
                } catch (error) {
                    console.log("[OPTION.JS:WENAUNTHN] ", error)
                    return null
                }
            }
        })
        
    ],
    session:{
        strategy: "jwt"
    },
    callbacks:{
        async jwt({token,user,session}){
            if (user){
                token.id = user._id;
                token.is2FAEnabled = user.is2FAEnabled
            }
            return token
        },
        async session({ session, user, token}){
            session.id = token?.sub;
            session.user.isLoggedIn = "true";
            session.user.is2FAEnabled = token.is2FAEnabled
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages:{
        signIn:"/"
    }
}

export default NextAuthOptionsMyProject

