import * as firebase from 'firebase/app';
import 'firebase/auth';
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { firebaseConfig } from './firebase.config';

const app = firebase.initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { auth, provider };