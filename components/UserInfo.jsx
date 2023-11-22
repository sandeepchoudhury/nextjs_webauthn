"use client";
import { signOut, useSession } from "next-auth/react"
import Link from "next/link";

function UserInfo() {
  const {data:session} = useSession();
  return (
    <div className="grid place-items-center h-screen">
        <div className="shadow-lg p-8 bg-zince-300/10 flex flex-col gap-2 my-6">
          <h1 className="text-xl font-bold my-4 text-center"> Logged In: {session?.user?.is2FAEnabled}</h1>
            <div>
                Name: <span className="font-bold">{session?.user?.name}</span>
            </div>
            <div>
                Email: <span className="font-bold">{session?.user?.email}</span>
            </div>
            {/* <div>
                Member Since:
                 <span className="font-bold">
                  {session?.user?.image}
                </span>
            </div> */}
            { !session?.user?.is2FAEnabled && (
                <div className="bg-green-600 text-white font-bold cursor-pointer px-6 py-2">
                    <Link href="/2FARegister">Enable Passkey</Link>
                </div>
            )}
             { session?.user?.is2FAEnabled && (
                <div className="bg-green-600 text-white font-bold cursor-pointer px-6 py-2">Passkey Enabled Already.</div>
            )}
            <button className="bg-red-500 text-white font-bold px-6 py-2 mt-3"
              onClick={ () => signOut()}>Logout</button>

        </div>

    </div>
  )
}
export default UserInfo