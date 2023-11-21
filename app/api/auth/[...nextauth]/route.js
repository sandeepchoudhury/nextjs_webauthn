import NextAuth from "next-auth/next";
import NextAuthOptionsMyProject from "./options"


const handler = NextAuth(NextAuthOptionsMyProject);
export {handler as GET, handler as POST}

