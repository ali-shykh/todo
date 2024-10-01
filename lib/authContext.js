"use client"; // Add this at the top

import { useRouter } from "next/navigation";
import { createContext, useContext, useState, useEffect } from "react";
import { auth, signInWithPopup, GoogleAuthProvider, signOut } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// Create AuthContext
const AuthContext = createContext();

// Session expiration time: 2 hours (in milliseconds)
const SESSION_DURATION = 2 * 60 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const loginTime = localStorage.getItem("loginTime");
        const currentTime = Date.now();

        // Check if session has expired
        if (loginTime && currentTime - loginTime > SESSION_DURATION) {
          handleLogout(); // Log the user out if session expired
        } else {
          setUser(user);
          localStorage.setItem("loginTime", currentTime.toString()); // Reset session time
          router.push("/"); // Redirect to home after login
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Google Login Functionality
  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    localStorage.setItem("loginTime", Date.now().toString()); // Store the login time
  };

  // Logout functionality with redirect to login
  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("loginTime"); // Clear session time
    setUser(null); // Reset the user state
    router.push("/login"); // Redirect to login after logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for accessing authentication
export const useAuth = () => useContext(AuthContext);
