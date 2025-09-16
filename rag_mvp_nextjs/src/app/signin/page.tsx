"use client";

import TextInput from '@/components/text_input';
import React, { useState } from 'react';
// import { useRouter } from "next/navigation";
// import { resolve } from 'path';
import CustomButton from '@/components/button';
import { useRouter } from 'next/navigation';

export default function SignIN() {
    const [email , setEmail] = useState<string | null>(null);
    const [password , setPassword] = useState<string | null>(null);
    const [loading , setLoading] = useState<boolean>(false);
    const [error,setError] = useState<string|null>(null);
    const router = useRouter();
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

    const handleSubmit = async(e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        if(!email && !password){
            setError("Email and Password should not empty");
            setLoading(false);
            return;
        }
        try{
            const res = await fetch(
                `${baseURL}/auth/signin`,
                {
                    method : "POST",
                    headers : {"Content-Type" : "application/json"},
                    body : JSON.stringify({
                        "orgEmail" : email,
                        "password" : password
                    })
                }
            );

            if(!res.ok){
                const data = await res.json();
                setError(data.message || "Login failed");
                return;
            }
            const data = await res.json();
            if(data.status){
                const orgID = data.orgID;
                router.push(`/home/${orgID}`);
                console.log("Login success:", data);
            }
            else{
                setError(data.message || "Login failed");
            }
        } catch(err : any){
            setError(err.message || "Something went wrong")
        } finally{
            setLoading(false);
        }
    };

    return (
        <div className='flex justify-center items-center min-h-screen min-w-screen bg-gradient-to-br from-sky-100 to-indigo-100'>
            <form 
            onSubmit={handleSubmit}
            className='flex flex-col items-center justify-center w-1/3 h-[50vh] border border-black gap-10 py-4 shadow-2xl rounded-lg'>
            
                <TextInput  label={"Email"} type='email' value={email || ""} updateVal={setEmail}/>
                <TextInput label={"Password"} type='password' value={password || ""} updateVal={setPassword}/>
                
                {error && <p className='text-red-600 text-sm'>{error}</p>}
                <CustomButton color='blue' text='submit' type='submit' disabled={loading}/>
                
            </form>
            
        </div>
    );
}