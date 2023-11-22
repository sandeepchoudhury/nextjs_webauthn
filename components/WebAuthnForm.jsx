"use client"
import {signOut,useSession} from "next-auth/react";
import {useState, useEffect} from "react";
import {
  startRegistration
} from "@simplewebauthn/browser"



function WebAuthnForm() {
  const [error,setError] = useState("");
  const {data:session}  = useSession();

  const handleClick = async (e,session) => {
    e.preventDefault();
    console.log("Name:",session?.user.name)
    const verifying = session?.user.is2FAEnabled && !session?.is2FAEnabled;
    const resp = await fetch("/api/passkeys/register");
    try {
        const data = await resp.json();
        console.log("START REGISTRATION FROM SERVER :", data)
        const attResp = await startRegistration({
            ...data
        })
        console.log("AFTER REGISTRATION :", attResp)

        await fetch("/api/passkeys/register",{
          method:"POST",
          headers:{
            "Content-Type":"application/json",
          },
          body: JSON.stringify(attResp),
        });
        window.alert("Passkey registration sucessfull. Please login with passkeys.")
        signOut();
        
    } catch (error) {
      console.log("[START REGISTRATION FROM SERVER] :", error)
    }








  }
  return (
    <div className="grid place-items-center h-screen">
        <div className="shadow-lg p-8 bg-zince-300/10 flex flex-col gap-2 my-6">
        <h1 className="text-xl font-bold my-4 text-center">Passkeys Implementation.</h1>
            <div>
                For: <span className="font-bold">{session?.user?.name}</span>
            </div>
            <div>
              <button className="bg-green-600 text-white font-bold cursor-pointer px-6 py-2" onClick={ (e) => handleClick(e,session)}>Enable Passkey</button>
            </div>
            
           
            <button className="bg-red-500 text-white font-bold px-6 py-2 mt-3"
              onClick={ () => signOut()}>Logout</button>

            { error && (
                  <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">{error}</div>
            )}
        </div>

    </div>
  )
}
export default WebAuthnForm