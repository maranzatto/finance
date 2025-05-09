import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Adicionado
// import { getAuth } from "firebase/auth"; // Já temos o auth sendo gerenciado no AuthContext

// Sua configuração do Firebase Web App
const firebaseConfig = {
  apiKey: "AIzaSyCI3-VNd7OnrO825GLJ8_4MY7lMj_ewUok",
  authDomain: "pagoo-dae3f.firebaseapp.com",
  projectId: "pagoo-dae3f",
  storageBucket: "pagoo-dae3f.appspot.com",
  messagingSenderId: "285544683097",
  appId: "1:285544683097:web:03ef8a92b10b954103c348"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Inicialize e exporte os serviços do Firebase
export const db = getFirestore(app); // Adicionado
// export const auth = getAuth(app); // A instância auth é criada e gerenciada no AuthContext

export default app; // Mantemos a exportação do app principal, pode ser útil
