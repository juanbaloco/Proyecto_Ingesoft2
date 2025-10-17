export default {
    testEnvironment: 'jest-environment-jsdom', // El entorno de pruebas que simula un navegador
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Archivo de configuración de Jest
    moduleNameMapper: {
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/test/__mocks__/fileMock.js', // El mock para los archivos de imagen y fuentes
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy', // El mock para los archivos de estilos
        '^@/(.*)$': '<rootDir>/src/$1' // [opcional] Alias para los archivos de la carpeta src
    }
}