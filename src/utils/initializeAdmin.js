// src/utils/initializeAdmin.js
import { doc, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/config";

/**
 * Script para crear el primer usuario administrador
 * Ejecutar solo una vez durante la configuración inicial del sistema
 */
export const createInitialAdmin = async () => {
  const adminEmail = "admin@neobank.com";
  const adminPassword = "Admin123456";  // Cambiar después del primer login
  const adminName = "Administrador Principal";

  try {
    // Verificar si ya existe un administrador
    const adminDocRef = doc(db, "usuarios", "admin-inicial");
    const adminDoc = await getDoc(adminDocRef);

    if (adminDoc.exists()) {
      console.log("✅ Usuario administrador ya existe");
      return { success: true, message: "Admin ya existe" };
    }

    // Crear usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      adminEmail, 
      adminPassword
    );

    const uid = userCredential.user.uid;

    // Crear documento en Firestore con rol de administrador
    await setDoc(doc(db, "usuarios", uid), {
      uid: uid,
      email: adminEmail,
      displayName: adminName,
      role: "admin",  // ← ROL DE ADMINISTRADOR
      fechaCreacion: new Date(),
      esAdminInicial: true,
    });

    console.log("✅ Usuario administrador creado exitosamente");
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Contraseña:", adminPassword);
    console.log("⚠️  IMPORTANTE: Cambia la contraseña después del primer login");

    return { 
      success: true, 
      uid, 
      email: adminEmail,
      message: "Admin creado exitosamente" 
    };

  } catch (error) {
    console.error("❌ Error al crear administrador:", error);

    if (error.code === "auth/email-already-in-use") {
      console.log("⚠️  El email ya está en uso. Verifica en Firestore si tiene rol admin.");
    }

    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Asignar rol de administrador a un usuario existente
 * @param {string} userEmail - Email del usuario
 */
export const promoteToAdmin = async (userEmail) => {
  try {
    // Buscar usuario por email en Firestore
    const usersRef = collection(db, "usuarios");
    const q = query(usersRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("❌ Usuario no encontrado");
      return { success: false, message: "Usuario no encontrado" };
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;

    // Actualizar rol a admin
    await updateDoc(doc(db, "usuarios", userId), {
      role: "admin",
      promovido: true,
      fechaPromocion: new Date(),
    });

    console.log("✅ Usuario promovido a administrador");
    console.log("📧 Email:", userEmail);

    return { 
      success: true, 
      userId,
      message: "Usuario promovido a admin" 
    };

  } catch (error) {
    console.error("❌ Error al promover usuario:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};
