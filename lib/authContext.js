"use client"; // Add this at the top

import { useRouter } from "next/navigation";
import { createContext, useContext, useState, useEffect } from "react";
import { auth, signInWithPopup, GoogleAuthProvider, signOut } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter(); // Now using next/navigation's useRouter

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        router.push("/"); // Redirect to home after login
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
