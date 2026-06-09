import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

// ✅ SIGNUP
export const registerUser = async (name, email, password) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name,
    email,
    createdAt: new Date(),
  });

  return user;
};

// ✅ LOGIN
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return userCredential.user;
};

// ✅ GET USER DATA
export const getUserData = async (uid) => {
  const docRef = doc(db, "users", uid);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    return snap.data();
  }
  return null;
};

// ✅ LOGOUT
export const logoutUser = async () => {
  return signOut(auth);
};