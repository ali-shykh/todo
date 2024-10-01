"use client";

import { useAuth } from "../../../lib/authContext";
import Image from "next/image";
import google from "../assets/google.png";

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="flex flex-col items-center">
      <h1 className="font-extrabold text-4xl p-4 my-10">Login</h1>
      <div
        className="flex flex-row justify-center gap-4 items-center border rounded-xl p-4 cursor-pointer"
        onClick={login}
      >
        <Image src={google} alt="Google logo" width={20} height={20} />
        <p className="text-md font-semibold">Login with Google</p>
      </div>
    </div>
  );
}
