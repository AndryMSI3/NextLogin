import React, { useRef, useState } from 'react';
import styles from '../components/css/Modal.module.css';
import Select, { SingleValue,  SelectInstance  } from 'react-select';
import InputGroup from "@/components/FormElements/InputGroup";
import { Button } from '@/components/ui-elements/button';
import Image from 'next/image';

const CreateUserModal = ({ closeUserCreating }: {closeUserCreating: (valeur: boolean) => void}) => {
    const userNameRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    type PrivilegeOption = { value: number; label: string };

    const privilegeRef = useRef<SelectInstance<PrivilegeOption, false> | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [previewImage, setPreviewImage] = useState("");

    const passwordRequirements = `Le mot de passe doit contenir une lettre majuscule et minuscule, 
    un chiffre et un des caractères '!@#$%^&*()-_+=' et doit avoir une longueur d'au moins 8 caractères`;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = document.createElement("img");
                if(typeof reader.result === "string")
                {
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

    const handleCreateUser = async () => {
        console.log("create user");
        const userName = userNameRef.current?.value;
        const password = passwordRef.current?.value;
        const handleClose = () => {
            closeUserCreating(false);
        };
        
        if (!userName || !password) {
            setErrorMessage("Nom d'utilisateur et mot de passe requis.");
            return;
        }

        if (!selectedFile) {
            setErrorMessage("Veuillez sélectionner une image.");
            return;
        }

        const userNameRegex = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
        const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

        if (!userNameRegex.test(userName) || !/[a-z]/.test(userName)) {
            setErrorMessage("Seules les lettres de l'alphabet sont autorisées.");
            return;
        }
        if (!passwordRegex.test(password)) {
            setErrorMessage(passwordRequirements);
            return;
        }
        try {
            const formData = new FormData();
            const selectedValue = privilegeRef.current?.props?.value;
            const privilegeValue = Array.isArray(selectedValue)
            ? (selectedValue as PrivilegeOption[]).map((option) => option.value).join(",") // Multi-select
            : (selectedValue as PrivilegeOption)?.value; // Single-select
            formData.append("image", selectedFile);
            formData.append("userName", userName);
            formData.append("passWord", password);
            formData.append("privilege", String(privilegeValue || ""));
            const response = await fetch('http://localhost:8080/api/users/create', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

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
                            borderRadius:"20px",
                            flexDirection:"column", 
                            height:"fit-content", 
                            display: "flex",
                            backgroundColor: "white",
                            paddingBottom: "15px",
                            paddingRight: "15px",
                            paddingLeft: "15px",
                            paddingTop: "0px"
                        }} 
                    >
                            <button onClick={() => closeUserCreating(false)} className={styles.closeButton}>
                                &times;
                            </button>
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
                            <label style={{ marginTop:"5px" }}>
                                <b>Nom d&apos;utilisateur:</b>
                                <p style={{
                                    color: 'grey', fontSize: 'small', margin: 'unset'
                                }}>
                                    Seules les lettres majuscules et minuscules sont autorisées
                                </p>
                                <InputGroup
                                    inputRef={userNameRef}
                                    label=''
                                    placeholder=''
                                    type='text'
                                />
                            </label>
                            <label>
                                <b>Mot de passe:</b>
                                <p style={{
                                    color: 'grey', fontSize: 'small', margin: 'unset'
                                }}>
                                    {passwordRequirements}
                                </p>
                                <InputGroup
                                    inputRef={passwordRef}
                                    label=''
                                    placeholder=''
                                    type='password'
                                />
                            </label>
                            <label htmlFor="selectPrivilege">
                                <b>Sélectionner fonction</b><br />
                                <div data-testid="selectFunction">
                                    <Select
                                        name="selectPrivilege"
                                        inputId="selectPrivilege"
                                        ref={privilegeRef}
                                        options={privilegeOptions}
                                        styles={{
                                            control: (baseStyles, { isFocused }) => ({
                                                ...baseStyles,
                                                cursor: 'pointer',
                                                outline: 'none',
                                                borderRadius: 0,
                                                borderWidth: '1px',
                                                backgroundColor: isFocused ? 'transparent' : 'transparent',
                                                color: 'black',
                                                boxShadow: isFocused ? 'none' : 'none',
                                                borderColor: isFocused ? 'lightgray' : 'lightgray',
                                            }),
                                            clearIndicator: (baseStyles) => ({
                                                ...baseStyles,
                                                display: 'none'
                                            }),
                                            dropdownIndicator: (baseStyles) => ({
                                                ...baseStyles,
                                                display: 'none'
                                            }),
                                            menu: (baseStyles) => ({
                                                ...baseStyles,
                                                borderRadius: 0,
                                                marginTop: 0,
                                                paddingTop: 0,
                                            }),
                                            menuList: (baseStyles) => ({
                                                ...baseStyles,
                                                marginTop: 0,
                                                paddingTop: 0,
                                                marginBottom: 0,
                                                paddingBottom: 0,
                                            }),
                                            option: (baseStyles, { isSelected, isFocused }) => ({
                                                ...baseStyles,
                                                cursor: 'pointer',
                                                backgroundColor: isSelected ? 'transparent' : isFocused ? 'lightgray' : 'transparent',
                                                color: isSelected ? 'black' : 'black',
                                            }),
                                        }}
                                    />
                                </div> 
                            </label>

                            <p className={styles.error}>
                                {errorMessage}
                            </p>
                            <Button
                                label='valider'
                                onClick={() => handleCreateUser()}
                                shape={'rounded'}
                                size={'small'}
                                className='mt-4'
                            />
                        </div>
                    </div>
            </div>
        </>
    );
}

export default CreateUserModal;
