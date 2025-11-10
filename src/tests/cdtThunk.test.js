jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => "mockDb"),
  collection: jest.fn(() => "mockCollection"),
  doc: jest.fn(() => "mockDoc"),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDocs: jest.fn(),
  serverTimestamp: jest.fn(() => "mockTimestamp"),
}));
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({ currentUser: { uid: "uid1" } })),
}));

jest.mock("../store/thunks/userThunk", () => ({
  crearOActualizarUsuario: jest.fn(),
}));

import * as cdtSlice from "../store/slices/cdtSlice";
import * as userThunk from "../store/thunks/userThunk";
import { collection, addDoc } from "firebase/firestore"; // deben venir después del mock



import {
  crearSolicitudCDT,
  actualizarSolicitudCDT,
  eliminarSolicitudCDT,
  cargarSolicitudesCDT,
  cargarTodasSolicitudesCDT,
} from "../store/thunks/cdtThunk";



jest.mock("../store/thunks/userThunk", () => ({
  crearOActualizarUsuario: jest.fn(),
}));

jest.mock("../store/slices/cdtSlice", () => ({
  addSolicitud: jest.fn(),
  updateSolicitud: jest.fn(),
  removeSolicitud: jest.fn(),
  setSolicitudes: jest.fn(),
  setError: jest.fn(),
}));

import * as firestore from "firebase/firestore";

describe("CDT Thunks", () => {
  let dispatch;
  let getState;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = jest.fn();
    getState = jest.fn(() => ({
      auth: { uid: "uid1", email: "a@b.com", displayName: "Alice" },
    }));
  });

  describe("crearSolicitudCDT", () => {
/*
describe("crearSolicitudCDT", () => {
  test("crea solicitud correctamente", async () => {
    userThunk.crearOActualizarUsuario.mockResolvedValue({ success: true, isNew: true });
    addDoc.mockResolvedValue({ id: "sol1" });

    const addSolicitudSpy = jest.spyOn(cdtSlice, "addSolicitud");

    const solicitudData = { monto: 1000, plazo: 12, tasaInteres: 5, estado: "BORRADOR" };

    const result = await crearSolicitudCDT(solicitudData)(dispatch, getState);

    expect(userThunk.crearOActualizarUsuario).toHaveBeenCalled();
    expect(addDoc).toHaveBeenCalledWith("mockCollection", expect.objectContaining({
      monto: 1000,
      estado: "BORRADOR",
    }));
    expect(addDoc).toHaveBeenCalled();
    expect(addSolicitudSpy).toHaveBeenCalledWith(expect.objectContaining({ id: "sol1" }));
    expect(result.success).toBe(true);
    expect(result.id).toBe("sol1");
  });
});
*/




    test("maneja error si usuario no autenticado", async () => {
      getState.mockReturnValue({ auth: { uid: null } });

      const result = await crearSolicitudCDT({ monto: 1000 })(dispatch, getState);

      expect(cdtSlice.setError).toHaveBeenCalled();
      expect(result.success).toBe(false);
    });
  });

  describe("actualizarSolicitudCDT", () => {
    test("actualiza correctamente", async () => {
      const datos = { monto: 2000, tasaInteres: 10, plazo: 6, estado: "BORRADOR" };

      const result = await actualizarSolicitudCDT("sol1", datos)(dispatch, getState);

      expect(firestore.updateDoc).toHaveBeenCalled();
      expect(cdtSlice.updateSolicitud).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    test("maneja error si usuario no autenticado", async () => {
      getState.mockReturnValue({ auth: { uid: null } });
      const result = await actualizarSolicitudCDT("sol1", {})(dispatch, getState);

      expect(cdtSlice.setError).toHaveBeenCalled();
      expect(result.success).toBe(false);
    });
  });

  describe("eliminarSolicitudCDT", () => {
    test("elimina correctamente", async () => {
      const result = await eliminarSolicitudCDT("sol1")(dispatch, getState);

      expect(firestore.deleteDoc).toHaveBeenCalled();
      expect(cdtSlice.removeSolicitud).toHaveBeenCalledWith("sol1");
      expect(result.success).toBe(true);
    });

    test("maneja error si usuario no autenticado", async () => {
      getState.mockReturnValue({ auth: { uid: null } });
      const result = await eliminarSolicitudCDT("sol1")(dispatch, getState);

      expect(cdtSlice.setError).toHaveBeenCalled();
      expect(result.success).toBe(false);
    });
  });

  describe("cargarSolicitudesCDT", () => {
    test("carga solicitudes de un usuario", async () => {
      firestore.getDocs.mockResolvedValue({
        forEach: (cb) =>
          cb({ id: "sol1", data: () => ({ monto: 1000, fechaSolicitud: { toDate: () => new Date() }, fechaActualizacion: { toDate: () => new Date() } }) }),
      });

      const result = await cargarSolicitudesCDT("uid1")(dispatch);

      expect(firestore.getDocs).toHaveBeenCalled();
      expect(cdtSlice.setSolicitudes).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe("cargarTodasSolicitudesCDT", () => {
    test("carga todas las solicitudes de todos los usuarios", async () => {
      // Primer getDocs: usuarios
      firestore.getDocs
        .mockResolvedValueOnce({
          docs: [{ id: "uid1", data: () => ({ displayName: "Alice" }) }],
        })
        // Segundo getDocs: solicitudes
        .mockResolvedValueOnce({
          forEach: (cb) =>
            cb({ id: "sol1", data: () => ({ monto: 1000, fechaSolicitud: { toDate: () => new Date() }, fechaActualizacion: { toDate: () => new Date() } }) }),
        });

      const result = await cargarTodasSolicitudesCDT()(dispatch);

      expect(firestore.getDocs).toHaveBeenCalledTimes(2);
      expect(cdtSlice.setSolicitudes).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });
});
