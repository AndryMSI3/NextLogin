import React, { useRef, useState } from 'react';
import styles from '../components/css/Modal.module.css';
import Select, { SelectInstance } from 'react-select';
import InputGroup from "@/components/FormElements/InputGroup";
import { Button } from '@/components/ui-elements/button';
import Image from 'next/image';

// Définition du type des options pour le select
type PrivilegeOption = { value: number; label: string };

// Définition des props du composant
const CreateUserModal = ({ closeUserCreating }: { closeUserCreating: (valeur: boolean) => void }) => {
    // Références pour récupérer la valeur des champs d'entrée
    const userNameRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const privilegeRef = useRef<SelectInstance<PrivilegeOption, false> | null>(null);

    // États pour gérer l'image sélectionnée, les erreurs et l'aperçu de l'image
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [previewImage, setPreviewImage] = useState("");

    // Définition des exigences du mot de passe
    const passwordRequirements = `Le mot de passe doit contenir une lettre majuscule et minuscule, 
    un chiffre et un des caractères '!@#$%^&*()-_+=' et doit avoir une longueur d'au moins 8 caractères`;

    // Fonction de gestion du fichier image
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = document.createElement("img");
                if (typeof reader.result === "string") {
                    img.src = reader.result;
                }
                img.onload = () => {
                    const { width, height } = img;
                    if (width > 100 && height > 100) {
                        const url = URL.createObjectURL(file);
                        setSelectedFile(file);
                        setPreviewImage(url);
                    } else {
                        alert('Les dimensions de l\'image doivent être d\'au moins 100x100 pixels.');
                    }
                };
            };
            reader.readAsDataURL(file);
        } else {
            alert('Veuillez sélectionner un fichier image valide.');
        }
    };

    // Fonction pour gérer la création de l'utilisateur
    const handleCreateUser = async () => {
        console.log("create user");
        const userName = userNameRef.current?.value;
        const password = passwordRef.current?.value;

        // Fonction pour fermer le modal
        const handleClose = () => {
            closeUserCreating(false);
        };

        // Vérification des champs requis
        if (!userName || !password) {
            setErrorMessage("Nom d'utilisateur et mot de passe requis.");
            return;
        }

        if (!selectedFile) {
            setErrorMessage("Veuillez sélectionner une image.");
            return;
        }

        // Définition des regex pour validation des entrées
        const userNameRegex = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
        const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

        // Validation des entrées utilisateur
        if (!userNameRegex.test(userName) || !/[a-z]/.test(userName)) {
            setErrorMessage("Seules les lettres de l'alphabet sont autorisées.");
            return;
        }
        if (!passwordRegex.test(password)) {
            setErrorMessage(passwordRequirements);
            return;
        }

        try {
            // Création de FormData pour envoyer les données
            const formData = new FormData();
            const selectedValue = privilegeRef.current?.props?.value;
            const privilegeValue = Array.isArray(selectedValue)
                ? (selectedValue as PrivilegeOption[]).map((option) => option.value).join(",") // Multi-select
                : (selectedValue as PrivilegeOption)?.value; // Single-select

            formData.append("image", selectedFile);
            formData.append("userName", userName);
            formData.append("passWord", password);
            formData.append("privilege", String(privilegeValue || ""));

            // Envoi des données au backend
            const response = await fetch('http://localhost:8080/api/users/create', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            // Gestion des erreurs retournées par le backend
            if (data.errors) {
                const errors = data.errors.map((err: any) => err.msg).join(", ");
                setErrorMessage(errors);
            } else {
                setPreviewImage(data.UserPicture);
                handleClose();
            }
        } catch (error) {
            console.log("Error:", error);
        }
    };

    // Options pour le champ de sélection des privilèges
    const privilegeOptions = [
        { value: 2, label: "Développeur" },
        { value: 1, label: "Développeur en chef" }
    ];

    return (
        <>
            <div className={styles.modal}>
                <div className={styles.modalContentForCreateUser}>
                    <div
                        aria-label="user form"
                        style={{
                            borderRadius: "20px",
                            flexDirection: "column",
                            height: "fit-content",
                            display: "flex",
                            backgroundColor: "white",
                            padding: "15px",
                        }}
                    >
                        {/* Bouton de fermeture du modal */}
                        <button onClick={() => closeUserCreating(false)} className={styles.closeButton}>
                            &times;
                        </button>

                        {/* Sélection de l'image de profil */}
                        <label>
                            <b>Choisir photo de profil</b>
                            <InputGroup
                                type="file"
                                fileStyleVariant="style1"
                                label=""
                                placeholder="Attach file"
                                handleChange={handleFileChange}
                            />
                            {previewImage && (
                                <Image
                                    src={previewImage}
                                    alt="Uploaded"
                                    width={128}
                                    height={128}
                                    style={{
                                        objectFit: "cover",
                                        marginBottom: "5px",
                                        marginTop: "10px"
                                    }}
                                />
                            )}
                        </label>

                        {/* Champ du nom d'utilisateur */}
                        <label style={{ marginTop: "5px" }}>
                            <b>Nom d'utilisateur:</b>
                            <p style={{ color: 'grey', fontSize: 'small', margin: 'unset' }}>
                                Seules les lettres majuscules et minuscules sont autorisées
                            </p>
                            <InputGroup inputRef={userNameRef} label='' placeholder='' type='text' />
                        </label>

                        {/* Champ du mot de passe */}
                        <label>
                            <b>Mot de passe:</b>
                            <p style={{ color: 'grey', fontSize: 'small', margin: 'unset' }}>
                                {passwordRequirements}
                            </p>
                            <InputGroup inputRef={passwordRef} label='' placeholder='' type='password' />
                        </label>

                        {/* Sélection du privilège */}
                        <label htmlFor="selectPrivilege">
                            <b>Sélectionner fonction</b><br />
                            <div data-testid="selectFunction">
                                <Select name="selectPrivilege" inputId="selectPrivilege" ref={privilegeRef} options={privilegeOptions} />
                            </div>
                        </label>

                        {/* Affichage des erreurs */}
                        <p className={styles.error}>{errorMessage}</p>

                        {/* Bouton de validation */}
                        <Button label='valider' onClick={handleCreateUser} shape={'rounded'} size={'small'} className='mt-4' />
                    </div>
                </div>
            </div>
        </>
    );
}

export default CreateUserModal;
