import '@testing-library/jest-dom'; // Solo una vez
import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch';

// 🔹 Guardamos el original
const originalConsoleError = console.error;

// 🔹 Silenciar ciertos warnings
beforeAll(() => {
  console.error = jest.fn((msg, ...args) => {
    if (/Some expected warning/.test(msg)) return; // filtra warnings esperados
    originalConsoleError(msg, ...args); // llamar al original
  });
});

// 🔹 Restaurar console.error al final
afterAll(() => {
  console.error = originalConsoleError;
});

// 🔹 Forzar resolución de microtasks
afterEach(async () => {
  await new Promise((r) => setTimeout(r, 0));
});

// 🔹 Globals
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
