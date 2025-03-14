"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import React, { useState, useRef, useEffect } from "react";
import useFetch from "@/components/function/fetch";
import '../components/css/Login.css';
import { useRouter } from "next/navigation";

// Interface définissant la structure de la réponse attendue du backend après la tentative de connexion
interface LoginResponse {
  user_id?: string;
  privilege?: string;
  error?: string;
}

export function SignInForm() {
  // État pour suivre si l'utilisateur est authentifié
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Hook pour la navigation entre les pages
  const router = useRouter();
  
  // État pour stocker un éventuel message d'erreur
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Références pour les champs de saisie du nom d'utilisateur et du mot de passe
  const userNameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Définition de l'URL du backend pour l'authentification
  const loginUrl = 'http://localhost:8080/users/login';
  const requestMethod = 'POST';
  const bodyKeys = ["user_name", "password"];
  let bodyValues: string[];

  // Hook personnalisé pour faire des requêtes fetch
  const [fetchData] = useFetch();

  // Vérifier si l'utilisateur est déjà authentifié en consultant le localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') { // Vérification pour éviter les erreurs côté serveur
        const data = localStorage.getItem("authenticated") || "false";
        setIsAuthenticated(JSON.parse(data)); // Conversion de la chaîne en booléen
    }
  }, []);

  // Fonction de gestion de la soumission du formulaire de connexion
  const handleLoginSubmit = async (e: React.FormEvent) => {
      e.preventDefault(); // Empêche le rechargement de la page

      // Vérifier que les champs de saisie ne sont pas vides
      if (userNameRef.current && passwordRef.current) {
          bodyValues = [userNameRef.current.value, passwordRef.current.value];

          try {
              // Envoi de la requête au serveur pour vérifier les identifiants
              const responseData: LoginResponse = await fetchData(loginUrl, requestMethod, bodyKeys, bodyValues);

              if (responseData && responseData.user_id) {
                  // Stocker les informations utilisateur en local si l'authentification réussit
                  const { user_id, privilege } = responseData;
                  localStorage.setItem('authenticated', JSON.stringify(true));
                  localStorage.setItem('userConnectedId', user_id);
                  localStorage.setItem('userPrivilege', JSON.stringify(privilege));

                  // Mettre à jour l'état pour signaler que l'utilisateur est connecté
                  setIsAuthenticated(true);
              } else {
                  // Afficher un message d'erreur si la connexion échoue
                  setErrorMessage(responseData.error || "Erreur inconnue");
              }
          } catch (err: unknown) {
              // Gestion des erreurs en cas de problème avec la requête fetch
              if (err instanceof Error) {
                  console.log(err.message);
                  setErrorMessage("Erreur de connexion, le serveur est peut-être hors ligne.");
              } else {
                  console.log("Erreur inconnue");
                  setErrorMessage("Erreur de connexion, le serveur est peut-être hors ligne.");
              }
          }
      } 
  };

  // Redirection vers le tableau de bord si l'utilisateur est authentifié
  useEffect(() => {
      if (isAuthenticated) {
          router.push("/dashboard");
      }
  }, [isAuthenticated, router]);

  return (
    <div className="mt-11">
      {/* Section contenant le formulaire de connexion */}
      <ShowcaseSection title="Sign In" boxWidth="60%" className="!p-6.5">
        <form onSubmit={handleLoginSubmit}>
          {/* Champ du nom d'utilisateur */}
          <InputGroup
            label="Username"
            type="text"
            inputRef={userNameRef}
            placeholder="Enter your username"
          />

          {/* Champ du mot de passe */}
          <InputGroup
            label="Password"
            type="password"
            inputRef={passwordRef}          
            placeholder="Enter your password"
          />

          {/* Affichage du message d'erreur en cas de problème */}
          <div className="mb-2.5 mt-4 flex items-center justify-between">
            {errorMessage && <p style={{ color: 'red', margin: 'unset' }}>{errorMessage}</p>}
          </div>

          {/* Bouton de validation du formulaire */}
          <button className="flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90">
            Sign In
          </button>
        </form>
      </ShowcaseSection>
    </div>
  );
}
