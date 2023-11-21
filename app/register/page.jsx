import RegisterForm from "@/components/RegisterForm"
import { getServerSession } from "next-auth"
import {redirect} from "next/navigation";
import  NextAuthOptionsMyProject  from "../api/auth/[...nextauth]/route";

async function page() {
  const session = await getServerSession(NextAuthOptionsMyProject)
  if (session) redirect('/dashboard');
  return (
    <div>
        <RegisterForm/>
    </div>
  )
}
export default page