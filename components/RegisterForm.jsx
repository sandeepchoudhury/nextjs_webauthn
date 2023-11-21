'use client';
import Link from "next/link"
import { useState } from "react";
import { useRouter } from "next/navigation";
function RegisterForm() {
    const [name,setName] = useState("")
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [error,setError] = useState("")
    const router = useRouter();

    const handleSubmit = async (e) => {
        
        e.preventDefault()
        if (!name && !email && !password){
            setError("All the fields are mandatory.")
            return;
        }
       try{

            const resUseExits = await fetch("/api/userExists",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                },
                body:JSON.stringify({
                    email
                })
            })
            const {user} = await resUseExits.json()
            if (user){
                setError("User already exists.");
                return;
            }



            const res = await fetch("/api/register",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    name,email,password
                })
            });
            if (res.ok){
                console.log(e.target)
                const from = e.target;
                from.reset();
                console.log("11111")
                router.push("/");
            }else{
                console.log(res.status)
                console.log("User registration failed!.")
            }
       }catch(error){
        console.log("User registration failed!.")
        console.log(error)
       }
    }


  return (
    <div className="grid place-items-center h-screen">
        <div className="shadow-lg p-5 rounded-lg border-t-4 border-green-400">
            <h1 className="text-xl font-bold my-4 text-center">Register</h1>
        
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <input 
                type="text" 
                placeholder="Full name"
                onChange={(e) =>{ setName(e.target.value)}}
            />    
            <input 
                type="text"
                placeholder="Email"
                onChange={(e) =>{ setEmail(e.target.value)}}
            />
            <input 
                type="password" 
                placeholder="Password"
                onChange={(e) =>{ setPassword(e.target.value)}}
            />
            <button 
                className="bg-green-600 text-white font-bold cursor-pointer px-6 py-2"
                
            >
                    Register
            </button>
            { error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">{error}</div>
            )}

        </form>
        <div className="text-right">
        <Link 
            href={'/'}
            className="text-sm mt-3 text-right"
        >
            Already have an account? <span className="underline">
                Login
            </span>
        </Link></div>
        </div>
        
    </div>
  )
}
export default RegisterForm