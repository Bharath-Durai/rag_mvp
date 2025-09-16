import React from "react";
import { useRouter } from "next/navigation";

interface ButtonProps {
  text: string;
  href? : string;
  onClick? : () => void;
  type? : "button" | "submit";
  color: "red" | "blue" | "green" | "purple";
  disabled? : boolean
}

export default function CustomButton({
  text,
  href,
  color = "blue",
  disabled = false,
  onClick,
  type = "button"
}: ButtonProps) {
    const router = useRouter();
    const baseColor = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    red: "bg-red-600 hover:bg-red-700",
    purple: "bg-purple-600 hover:bg-purple-700",
  }[color];
  const handleClick = () => {
    if(href){
        router.push(href);
    }
  }
  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`${baseColor} rounded-lg text-white px-10 py-3 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50`}
    >
      {text}
    </button>
  );
}
