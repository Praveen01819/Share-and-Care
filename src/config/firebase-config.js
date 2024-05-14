import { initializeApp } from 'firebase/app';
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAA2uLR7CZTkoQXk5MFyfPPyRLSdi3FRQg",
  authDomain: "share-and-care-b8956.firebaseapp.com",
  databaseURL: "https://share-and-care-b8956-default-rtdb.firebaseio.com/",
  projectId: "share-and-care-b8956",
  storageBucket: "share-and-care-b8956.appspot.com",
  messagingSenderId: "751654491055",
  appId: "1:751654491055:web:a437c33137bf4423ca555a",
  measurementId: "G-CR3MNJVLTE"
};

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const firestore = getFirestore(app);