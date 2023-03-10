import React, { useState, useEffect } from 'react';

import { signInWithPopup } from "firebase/auth"; 
import { auth, provider, app } from '../firebase';
import { getFirestore } from "firebase/firestore";
import { doc, setDoc, getDoc } from "firebase/firestore";

import PersonalAssistant from './PersonalAssistant';

const SignIn = () => {

    const [email, setEmail] = useState('');

    async function getDocSnap(data) {
        const user = data.user;
        const userEmail = user.email;
        const userDisplayName = user.displayName;
        const userPhoto = user.photoURL;
        const userUID = user.uid;
        setEmail(userEmail);
        localStorage.setItem('email', userEmail);
        localStorage.setItem('name', userDisplayName);
        localStorage.setItem('photo', userPhoto);
        localStorage.setItem('uid', userUID);
        const db = getFirestore(app);
        const userRef = doc(db, 'users', userUID);
        const docSnap = await getDoc(userRef);
        console.log(docSnap.data().chatLog)
        if (docSnap.exists()) {
            console.log('Document data:', docSnap.data());
            const existingChatLog = docSnap.data().chatLog;
            setDoc(userRef, {
                chatLog: existingChatLog, // merge existing chat log with new data
            }, { merge: true });
            // setChatHistory(existingChatLog); // set the chat history state
        } else {
            console.log('No such document!')
            setDoc(userRef, {
                email: userEmail,
                name: userDisplayName,
                photo: userPhoto,
                chatLog: [],
            }, { merge: true });
        }
    }

    async function handleClick() {
        await signInWithPopup(auth, provider)
        .then((data) => {
            getDocSnap(data);
        })
        .catch((error) => {
            console.log(error);
        });
    }

    useEffect(() => {
        setEmail(localStorage.getItem('email'));
    })

    return (
        <div className="sign-in-container">
            {email ? <PersonalAssistant /> :
            <button onClick={handleClick}>Login with Google</button>
            }
        </div>
    );
};

export default SignIn;
