import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SolicitudCDT {
  id: string;
  monto: number;
  plazo: number;
  tasaInteres: number;
  estado: string;
  userId: string;
  displayName: string;
  fechaSolicitud: any;
  fechaActualizacion: any;
  interesEstimado?: number;
  totalAlVencimiento?: number;
}

interface CdtState {
  solicitudes: SolicitudCDT[];
  solicitudActual: SolicitudCDT | null;
  status: "idle" | "succeeded" | "failed";
  error: string | null;
  filtroEstado: string;
}

const initialState: CdtState = {
  solicitudes: [],
  solicitudActual: null,
  status: "idle",
  error: null,
  filtroEstado: "TODOS",
};

export const cdtSlice = createSlice({
  name: "cdt",
  initialState,
  reducers: {
    setSolicitudes: (state, action: PayloadAction<SolicitudCDT[]>) => {
      state.solicitudes = action.payload;
      state.status = "succeeded";
      state.error = null;
    },
    addSolicitud: (state, action: PayloadAction<SolicitudCDT>) => {
      state.solicitudes.unshift(action.payload);
      state.status = "succeeded";
      state.error = null;
    },
    updateSolicitud: (state, action: PayloadAction<any>) => {
      const index = state.solicitudes.findIndex(
        (sol) => sol.id === action.payload.id
      );
      if (index !== -1) {
        state.solicitudes[index] = {
          ...state.solicitudes[index],
          ...action.payload,
        };
      }
      state.status = "succeeded";
      state.error = null;
    },
    removeSolicitud: (state, action: PayloadAction<string>) => {
      state.solicitudes = state.solicitudes.filter(
        (sol) => sol.id !== action.payload
      );
      state.status = "succeeded";
      state.error = null;
    },
    setSolicitudActual: (state, action: PayloadAction<SolicitudCDT | null>) => {
      state.solicitudActual = action.payload;
    },
    clearSolicitudActual: (state) => {
      state.solicitudActual = null;
    },
    setFiltroEstado: (state, action: PayloadAction<string>) => {
      state.filtroEstado = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCdtState: (state) => {
      state.solicitudes = [];
      state.solicitudActual = null;
      state.status = "idle";
      state.error = null;
      state.filtroEstado = "TODOS";
    },
  },
});

export const {
  setSolicitudes,
  addSolicitud,
  updateSolicitud,
  removeSolicitud,
  setSolicitudActual,
  clearSolicitudActual,
  setFiltroEstado,
  setError,
  clearError,
  clearCdtState,
} = cdtSlice.actions;

export default cdtSlice.reducer;