// Archivo para manejar la configuración de la API y el estado global del partido
const API_URL = "http://127.0.0.1:8000";

let partidoId = null;

export function setPartidoId(id) {
    partidoId = id;
}

export function getPartidoId() {
    return partidoId;
}

export { API_URL };