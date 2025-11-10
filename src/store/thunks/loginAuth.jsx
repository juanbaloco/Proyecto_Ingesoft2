import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { register } from "../slices/authSlice";

export const loginWithEmailAndPassword = (email, password) => {
  return async (dispatch) => {
    try {
      // Autenticar usuario
      const response = await signInWithEmailAndPassword(auth, email, password);
      const { uid, displayName } = response.user;

      // Cargar datos del usuario desde Firestore (incluyendo rol)
      const userDocRef = doc(db, "usuarios", uid);
      const userDoc = await getDoc(userDocRef);

      let role = "client";  // Valor por defecto

      if (userDoc.exists()) {
        const userData = userDoc.data();
        role = userData.role || "client";  // ← Cargar rol desde Firestore

        console.log("✅ Usuario autenticado:", {
          email,
          displayName: displayName || userData.displayName,
          role,
        });
      } else {
        console.warn("⚠️  Documento de usuario no encontrado en Firestore");
      }

      // Registrar en Redux con rol
      dispatch(register({ 
        email, 
        uid, 
        displayName: displayName || userDoc.data()?.displayName || "Usuario",
        role  // ← Incluir rol en el estado
      }));

    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      throw new Error("Login failed");
    }
  };
};
