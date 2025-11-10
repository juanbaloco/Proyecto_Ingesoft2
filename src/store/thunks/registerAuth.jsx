import { 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { register } from "../slices/authSlice";

export const registerAuth = (email, password, displayName) => {
  return async (dispatch) => {
    try {
      // Crear usuario en Firebase Authentication
      const response = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(auth.currentUser, { displayName });

      const uid = response.user.uid;

      // Crear documento en Firestore con rol por defecto "client"
      await setDoc(doc(db, "usuarios", uid), {
        uid,
        email,
        displayName: displayName || "Usuario",
        role: "client",  // ← Por defecto todos son clientes
        fechaCreacion: serverTimestamp(),
      });

      // Registrar en Redux con rol
      dispatch(register({ 
        uid, 
        email, 
        displayName,
        role: "client"  // ← Incluir rol en el estado
      }));

      console.log("✅ Usuario registrado exitosamente como cliente");

    } catch (error) {
      console.error("Error en el registro:", error.message);
      throw error;
    }
  };
};
