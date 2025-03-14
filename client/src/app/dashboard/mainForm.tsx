"use client"

import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import React, { useState, useRef, useEffect } from "react";
import '../components/css/Login.css';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui-elements/button";
import CreateUserModal from "./CreateUserModal";

// Interface pour la réponse de connexion
interface LoginResponse {
  user_id?: string;
  privilege?: string;
  error?: string;
}

export function MainForm() {
  // État pour savoir si l'utilisateur est authentifié
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Hook pour la navigation
  const router = useRouter();

  // État pour afficher ou cacher le modal de création d'utilisateur
  const [isUserCreationOpen, setIsUserCreationOpen] = useState(false);

  // Fonction pour fermer le modal de création d'utilisateur
  const closeUserCreation = () => {
    setIsUserCreationOpen(false);
  };

  // Vérifie l'authentification de l'utilisateur au chargement du composant
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem("authenticated") || "false";
      setIsAuthenticated(JSON.parse(data));
    }
  }, []);

  // Redirige vers le tableau de bord si l'utilisateur est authentifié
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    // Suppression des données d'authentification du localStorage
    localStorage.removeItem("authenticated");
    localStorage.removeItem("userConnectedId");
    localStorage.removeItem("userPrivilege");
    localStorage.removeItem("InitialLoaded");
    localStorage.removeItem("epr_ru");

    // Redirection vers la page d'accueil après déconnexion
    router.push("/");
  };

  return (
    <>  
      {/* Affichage du modal de création d'utilisateur si l'état est activé */}
      {isUserCreationOpen && (
        <CreateUserModal closeUserCreating={closeUserCreation} />
      )}

      <div className="mt-11">
        {/* Section principale de l'interface */}
        <ShowcaseSection title="Interface Principale" boxWidth="60%" className="!p-6.5">
          {/* Bouton pour ouvrir le modal de création d'utilisateur */}
          <Button 
            label="Créer un utilisateur" 
            variant="outlineDark" 
            shape="rounded" 
            className="flex w-full mb-5" 
            onClick={() => setIsUserCreationOpen(true)}
          />
          
          {/* Bouton de déconnexion */}
          <Button 
            label="Déconnexion" 
            variant="outlinePrimary" 
            shape="rounded" 
            className="flex w-full" 
            onClick={handleLogout}
          />
        </ShowcaseSection>
      </div>
    </>
  );
}
