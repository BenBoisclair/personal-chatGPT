import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth"; 
import { auth, provider } from '../firebase';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signUp = (e) => {
        e.preventDefault();
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log(userCredential);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    return (
        <div className="sign-in-container">
            <h1>Create Account</h1>
            <form onSubmit={signUp}>
                <input type="email" placeholder='Enter your email' value={email} onChange={(e) => setEmail(e.target.value)}/>
                <input type="password" placeholder='Enter your password' value={password} onChange={(e) => setPassword(e.target.value)}/>
                <button type="submit">Create an Account</button>
            </form>
        </div>
    );
};

export default SignUp;