// Desarrollo local — el proxy.conf.json redirige /api a localhost:8080
export const environment = {
  production: false,
  apiUrl: '',  // vacío = rutas relativas, el proxy hace el trabajo
};
