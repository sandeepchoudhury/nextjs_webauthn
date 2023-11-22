import LoginForm from "@/components/LoginForm"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import  NextAuthOptionsMyProject from "@/app/api/auth/[...nextauth]/options"


export default async function Home() {
  const session = await getServerSession(NextAuthOptionsMyProject);
  if (session ) redirect("/dashboard")
  return (
    <main>  
      <LoginForm/>
    </main>
  )
}
