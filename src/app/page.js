"use client";
import { useAuth } from "../../lib/authContext";
import Todo from "./todo/page";

export default function Home() {
  const { logout } = useAuth();

  return (
    <>
      <div className="flex justify-end p-4">
        <button
          onClick={logout}
          className="bg-red-700 text-white p-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      <div className="flex justify-center">
        <Todo />
      </div>
    </>
  );
}
