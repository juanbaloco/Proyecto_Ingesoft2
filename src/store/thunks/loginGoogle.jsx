import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { register } from "../slices/authSlice";

export const loginWithGoogle = () => {
  return async (dispatch) => {
    try {
      const provider = new GoogleAuthProvider();
      const response = await signInWithPopup(auth, provider);
      const { uid, email, displayName } = response.user;

      // Verificar si el usuario ya existe en Firestore
      const userDocRef = doc(db, "usuarios", uid);
      const userDoc = await getDoc(userDocRef);

      let role = "client";

      if (userDoc.exists()) {
        // Usuario existente - cargar rol
        role = userDoc.data().role || "client";
      } else {
        // Usuario nuevo - crear documento con rol "client"
        await setDoc(userDocRef, {
          uid,
          email,
          displayName: displayName || "Usuario",
          role: "client",
          fechaCreacion: serverTimestamp(),
          metodoRegistro: "Google",
        });
      }

      // Registrar en Redux con rol
      dispatch(register({ 
        email, 
        uid, 
        displayName,
        role
      }));

      console.log("✅ Login con Google exitoso");

    } catch (error) {
      console.error("Error en login con Google:", error.message);
      throw error;
    }
  };
};
