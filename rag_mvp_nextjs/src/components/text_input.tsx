"use client";

import { Dispatch, SetStateAction, useState } from "react";


interface TextInputProps {
    label : string,
    type? : string,
    value : string,
    updateVal : Dispatch<SetStateAction<string|null>>
}

export default function TextInput(
    {label,type,value,updateVal} : TextInputProps
){


    return (
        <div className="flex flex-col space-y-1">
            <label htmlFor="inputField" className="text-sm font-medium text-gray-700">
                {label}
            </label>
            <input type={type || "text"}
                   id={label}
                   style={{
                    background:"white"
                   }}
                    value={value}
                    onChange={(e)=>updateVal(e.target.value)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 "
            />
        </div>
    );
}