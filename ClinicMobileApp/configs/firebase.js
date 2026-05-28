import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD3bJ0Fa3e6BLXZhoBI_HvJQbF-4_-UFos",
  authDomain: "clinicapp-a9ca2.firebaseapp.com",
  projectId: "clinicapp-a9ca2",
  storageBucket: "clinicapp-a9ca2.firebasestorage.app",
  messagingSenderId: "26842822772",
  appId: "1:26842822772:web:a1334831d8d9a883bd3921",
  measurementId: "G-YF58KE172T"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true
});