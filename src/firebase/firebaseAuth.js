import { getAuth,signInWithEmailAndPassword, signOut } from "firebase/auth";
import { app } from "./firebaseConfig";

export const auth = getAuth(app);

export const loginStaff = (auth, email, password) => {
    signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => { 
    if (userCredential.user.email === "admin@nanosushi.cl"){
        window.location.href = "/staff/dashboard";
    }else {
        window.location.href = "/staff/delivery";
    }
    const user = userCredential.user;
    console.log(user)
     
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error(errorCode, errorMessage);
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
