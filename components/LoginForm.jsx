"use client"

import Link from "next/link"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { startAuthentication } from "@simplewebauthn/browser"

function LoginForm() {
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [error,setError] = useState("")
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await signIn('credentials',{
                                        email,
                                        password,
                                        redirect:false,
                                    })
            if (res.error){
                setError("Invalid Credentials.");
                return;
            }
            router.replace("dashboard")
        } catch (error) {
            console.log(error)
        }
    }

    const handlePasskey = async (e) => {
        e.preventDefault();
        console.log("Loging in via Passkey.")
        try {
            const res = await fetch("api/passkeys/authenticate",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({email})
            });

            if (res.ok){
                const data = await res.json();
                try {
                    console.log("START BROWSER AUTHENTICATION OPTIONS :", data)
                    const assResp = await startAuthentication(data )
                    console.log(("START BROWSER AUTHENTICATION  :", assResp))
                    await signIn("webauthn",{
                        verification:JSON.stringify(assResp),
                        email:JSON.stringify(email)
                    });
                    router.replace("dashboard")
                    
                } catch (error) {
                    console.log("AUTHENTICATION:", error)
                    setError("Invalid Credentials.")
                }
               
            } else{
                setError("Invalid Credentials.")
            }
        } catch (error) {
            console.log("AUTHENTICATION:", error)
            setError("Invalid Credentials.")
        }
    
    }

  return (
    <div className="grid place-items-center h-screen">
        <div className="shadow-lg p-5 rounded-lg border-t-4 border-green-400">
            <h1 className="text-xl font-bold my-4 text-center">Login</h1>
        
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <input type="text" placeholder="Email"  
                    onChange={(e) =>{ setEmail(e.target.value)}}
            />
            <input 
                    type="password" 
                    placeholder="Password"
                    onChange={(e) =>{ setPassword(e.target.value)}}
            />
            <button className="bg-green-600 text-white font-bold cursor-pointer px-6 py-2">Login</button>
            <button className="bg-green-600 text-white font-bold cursor-pointer px-6 py-2" onClick={handlePasskey}>Login by Passkey.</button>
           
           { error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">{error}</div>
            )}
            </form>
        <div className="text-right">
        <Link 
            href={'/register'}
            className="text-sm mt-3 text-right"
        >
            Don't have an account? <span className="underline">
                Register
            </span>
        </Link></div>
        </div>
        
    </div>
  )
}
export default LoginForm