import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"; 
import { auth, provider } from '../firebase';
import PersonalAssistant from './PersonalAssistant';

const SignIn = () => {

    const [email, setEmail] = useState('');

    const handleClick = () => {
        signInWithPopup(auth, provider)
            .then((data) => {
                setEmail(data.user.email);
                localStorage.setItem('email', data.user.email);
                localStorage.setItem('name', data.user.displayName);
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

// const SignInForm = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');

//     const signIn = (e) => {
//         e.preventDefault();
//         signInWithEmailAndPassword(auth, email, password)
//             .then((userCredential) => {
//                 console.log(userCredential);
//             })
//             .catch((error) => {
//                 console.log(error);
//             });
//     }

//     return (
//         <div>
//             <h1>Sign In</h1>
//             <form onSubmit={signIn}>
//                 <input type="email" placeholder='Enter your email' value={email} onChange={(e) => setEmail(e.target.value)}/>
//                 <input type="password" placeholder='Enter your password' value={password} onChange={(e) => setPassword(e.target.value)}/>
//                 <button type="submit">Login</button>
//             </form>
//         </div>
//     )
// }