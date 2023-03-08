import * as firebase from 'firebase/app';
import 'firebase/auth';
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { firebaseConfig } from './firebase.config.js';

const app = firebase.initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
    prompt: 'select_account'
});

export { auth, provider, app };