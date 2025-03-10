"use client"

import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import React, { useState, useRef, useEffect } from "react";
import useFetch from "@/components/function/fetch";
import '../components/css/Login.css';
import { useRouter } from "next/navigation";

interface LoginResponse {
  user_id?: string;
  privilege?: string;
  error?: string;
}

export function SignInForm() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const userNameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const loginUrl = 'http://localhost:8080/users/login';
  const requestMethod = 'POST';
  const bodyKeys = ["user_name", "password"];
  let bodyValues: string[];

  const [fetchData] = useFetch();
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const data = localStorage.getItem("authenticated") || "false";
        setIsAuthenticated(JSON.parse(data));
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (userNameRef.current && passwordRef.current) {
          bodyValues = [userNameRef.current.value, passwordRef.current.value];

          try {
              const responseData: LoginResponse = await fetchData(loginUrl, requestMethod, bodyKeys, bodyValues);
              if (responseData && responseData.user_id) {
                  const { user_id, privilege } = responseData;
                  localStorage.setItem('authenticated', JSON.stringify(true));
                  localStorage.setItem('userConnectedId', user_id);
                  localStorage.setItem('userPrivilege', JSON.stringify(privilege));
                  setIsAuthenticated(true); // Authentification réussie
              } else {
                  setErrorMessage(responseData.error || "Erreur inconnue");
              }
          } catch (err: unknown) {
              if (err instanceof Error) {
                  console.log(err.message); // Affiche le message d'erreur
                  setErrorMessage("Erreur de connexion, le serveur est peut-être hors ligne.");
              } else {
                  // Si l'erreur n'est pas une instance d'Error
                  console.log("Erreur inconnue");
                  setErrorMessage("Erreur de connexion, le serveur est peut-être hors ligne.");
              }
          }
      } 
  };

  useEffect(() => {
      if (isAuthenticated) {
          router.push("/dashboard");
      }
  }, [isAuthenticated, router]);

  return (
    <div className="mt-11">
      <ShowcaseSection title="Sign In" boxWidth="60%" className="!p-6.5">
        <form onSubmit={handleLoginSubmit} >
          <InputGroup
            label="Username"
            type="text"
            inputRef={userNameRef}
            placeholder="Enter your username"
          />

          <InputGroup
            label="Password"
            type="password"
            inputRef={passwordRef}          
            placeholder="Enter your password"
          />
          <div className="mb-2.5 mt-4 flex items-center justify-between">
            {errorMessage && <p style={{ color: 'red', margin: 'unset' }}>{errorMessage}</p>}
          </div>
          <button className="flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90">
            Sign In
          </button>
        </form>
      </ShowcaseSection>
    </div>
  );
}
