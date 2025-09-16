"use client";
import CustomButton from "@/components/button";

export default function Root() {
  return (
    <div className="flex justify-center items-center min-h-screen min-w-screen bg-gradient-to-br from-sky-100 to-indigo-100">
      <div className="flex flex-col items-center justify-center w-1/3 h-[50vh] border border-black-100 gap-10 py-4 shadow-2xl rounded-lg">
        <CustomButton text="Sign-in" color="blue" href="/signin" />
        <CustomButton text="Sign-up" color="blue" href="/signup" />
      </div>
    </div>
  );
}
