import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0KPBqHNWgi6V0VEc5atg0WSARXdn1fr0",
  authDomain: "shoppingapp-2e9e9.firebaseapp.com",
  projectId: "shoppingapp-2e9e9",
  storageBucket: "shoppingapp-2e9e9.appspot.com",
  messagingSenderId: "100093618528",
  appId: "1:100093618528:web:c306305e95e0b116151605"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);