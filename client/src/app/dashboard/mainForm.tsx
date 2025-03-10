"use client"

import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import React, { useState, useRef, useEffect } from "react";
import '../components/css/Login.css';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui-elements/button";
import CreateUserModal from "./CreateUserModal";

interface LoginResponse {
  user_id?: string;
  privilege?: string;
  error?: string;
}

export function MainForm() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const [isUserCreationOpen, setIsUserCreationOpen] = useState(false);

  const closeUserCreation = () => {
      setIsUserCreationOpen(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const data = localStorage.getItem("authenticated") || "false";
        setIsAuthenticated(JSON.parse(data));
    }
  }, []);

  useEffect(() => {
      if (isAuthenticated) {
          router.push("/dashboard");
      }
  }, [isAuthenticated, router]);
  const handleLogout = () => {
    localStorage.removeItem("authenticated");
    localStorage.removeItem("userConnectedId");
    localStorage.removeItem("userPrivilege");
    localStorage.removeItem("InitialLoaded");
    localStorage.removeItem("epr_ru");
    router.push("/");
  };
  return (
    <>  
      {isUserCreationOpen && (
          <CreateUserModal
              closeUserCreating={closeUserCreation}
          />
      )}      
      <div className="mt-11">
        <ShowcaseSection title="Interface Principale" boxWidth="60%" className="!p-6.5">
          <Button label="Créer un utilisateur" variant="outlineDark" shape="rounded" className="flex w-full mb-5" onClick={() => setIsUserCreationOpen(true)}/>
          <Button label="Déconnexion" variant="outlinePrimary" shape="rounded" className="flex w-full" onClick={handleLogout}/>
        </ShowcaseSection>
      </div>
    </>
  );
}
