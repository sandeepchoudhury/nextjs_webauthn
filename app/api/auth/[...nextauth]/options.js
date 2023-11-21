import { connectMongo } from "@/lib/DBConnect";
import User from "@/models/User";
import NextAuth,{AuthOptions} from "next-auth";
import CredentialsProvider  from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"

export const rpName = "NextAuth.js + MongoDB + SimpleWebAuthn Example";
export const rpID = process.env.NODE_ENV === "production" ? "next-auth-webauthn.vercel.app" : "localhost";
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
            async authorize(_, request) {
                console.log("calling from WebAuthn Next Auth Option file.")
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

