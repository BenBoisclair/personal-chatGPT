import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth"; 
import { auth } from '../firebase';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signIn = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log(userCredential);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    return (
        <div className="sign-in-container">
            <h1>Sign In</h1>
            <form onSubmit={signIn}>
                <input type="email" placeholder='Enter your email' value={email} onChange={(e) => setEmail(e.target.value)}/>
                <input type="password" placeholder='Enter your password' value={password} onChange={(e) => setPassword(e.target.value)}/>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default SignIn;