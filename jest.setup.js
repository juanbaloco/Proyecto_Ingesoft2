import '@testing-library/jest-dom' // Importa las utilidades de jest-dom
import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch';


global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
