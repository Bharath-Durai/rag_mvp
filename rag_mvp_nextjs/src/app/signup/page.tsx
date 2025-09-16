"use client";

import CustomButton from "@/components/button";
import TextInput from "@/components/text_input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUP() {
  const [orgName, setOrgName] = useState<string|null>(null);
  const [orgEmail,setOrgEmail] = useState<string|null>(null);
  const [password,setPassword] = useState<string|null>(null);
  const [confirmPassoword,setConfirmPassword] = useState<string|null>(null);
  const [loading,setLoading] = useState<boolean>(false);
  const [error,setError] = useState<string|null>(null);

  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;


  const handleSubmit = async(e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if(!orgName && !orgEmail && !password && !confirmPassoword){
        setError("Field can not be empty");
        setLoading(false);
        return;
    }
    if(password !== confirmPassoword){
        setError("password doesn't match");
        setLoading(false);
        return;
    }
    try {
        const res = await fetch(
            `${baseUrl}/auth/signup`,
            {
                method : "POST",
                headers : {"Content-type" : "application/json"},
                body : JSON.stringify({
                    "orgEmail" : orgEmail ,
                    "orgName" : orgName,
                    "password" : password
                })
            }
        );

        if(!res.ok){
            const data = await res.json();
            setError(data.message || "SignUP failed");
            return;
        }

        const data = await res.json();
        if(data.status && data.orgID){
            const orgID = data.orgID;
            
            router.push(`/home/${orgID}`);
            console.log("Sign up success:", data);

        }
        else{
            setError(data.message || "Sign up failed");
        }
    } catch (error : any) {
        setError(error.message || "Something went wrong");
    }
    finally{
        setLoading(false);
    }
  }

  return (
          <div className='flex justify-center items-center min-h-screen min-w-screen bg-gradient-to-br from-sky-100 to-indigo-100'>
              <form 
              onSubmit={handleSubmit}
              className='flex flex-col items-center justify-center w-1/3 h-[50vh] border border-black gap-6 py-4 shadow-2xl rounded-lg'>
                  <TextInput  label={"Org Name"} type='text' value={orgName || ""} updateVal={setOrgName}/>
                  <TextInput  label={"Org Email"} type='email' value={orgEmail || ""} updateVal={setOrgEmail}/>
                  <TextInput label={"Password"} type='password' value={password || ""} updateVal={setPassword}/>
                  <TextInput label={"Confirm Password"} type='password' value={confirmPassoword || ""} updateVal={setConfirmPassword}/>
            
                  {error && <p className='text-red-600 text-sm'>{error}</p>}
                  <CustomButton color='blue' text='submit' type='submit' disabled={loading}/>
                  
              </form>
              
          </div>
      );
}
