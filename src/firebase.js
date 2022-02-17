import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCN4K_nhsWVv8C8kkH9uEWozREMYxUfuv8",
    authDomain: "turinggamesautomation.firebaseapp.com",
    projectId: "turinggamesautomation",
    storageBucket: "turinggamesautomation.appspot.com",
    messagingSenderId: "775539068230",
    appId: "1:775539068230:web:75a4862a3c5f6bd3ae6947",
    measurementId: "G-6GEP2Q5LHN"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const storage = getFirestore(app);
const fileStorage = getStorage(app);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const logOut = () => {
    signOut(auth);
}


export {storage, fileStorage, auth, signInWithGoogle, logOut, ref, uploadBytesResumable, getDownloadURL};