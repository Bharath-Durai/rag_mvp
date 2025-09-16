"use client";
import CustomButton from "@/components/button";
import { use } from "react";
export default function HomePage({
  params,
}: {
  params: Promise<{ params?: string[] }>;
}) {
  const resolvedParams = use(params);
  const routeParams = resolvedParams.params || [];

  const isLogged = routeParams.length > 0;

  return (
    <div className="flex justify-center items-center min-h-screen min-w-screen bg-gradient-to-br from-sky-100 to-indigo-100">
      <div className="flex flex-col items-center justify-center w-1/3 h-[50vh] border border-black-100 gap-10 py-4 shadow-2xl rounded-lg">
        {isLogged ? (
          <>
            <CustomButton
              text="Upload"
              color="blue"
              href={`/upload/${routeParams[0]}`}
            />
            <CustomButton text="Chat" color="blue" href={`/chat/${routeParams[0]}`} />
          </>
        ) : (
          <p className="text-sm text-gray-600">
            Please log in to access these features.
          </p>
        )}
      </div>
    </div>
  );
}
