import '@testing-library/jest-dom' // Importa las utilidades de jest-dom
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
