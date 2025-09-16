import { getAuth,signInWithEmailAndPassword, signOut } from "firebase/auth";
import { app } from "./firebaseConfig";

export const auth = getAuth(app);

export const loginStaff = (auth, email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log(user);
            return userCredential;
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error(errorCode, errorMessage);
            throw error;
        });
};

export const LogoutStaff = (auth) => {
    signOut(auth)
    .then(() => {
        // Sign-out successful.
        window.location.href = "/staff/login";
    }).catch((error) => {
        console.error(error);
    });
};
