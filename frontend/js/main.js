import { state, resetMatch, clearState } from './state.js';
import { render } from './ui.js';
import * as events from './events.js';
import * as modals from './modals.js';
import { setPartidoId, API_URL } from './api.js'; // Importamos la URL y el setter

/**
 * Asigna manejadores de eventos a los elementos de la UI.
 */
function setupEventListeners() {
    document.body.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const action = button.dataset.action;
        const teamId = button.closest('[data-team-id]')?.dataset.teamId;

        if (['open-serve-modal', 'open-lineup-modal'].includes(action) && !events.checkRostersComplete()) {
            alert("Por favor, carga las plantillas completas antes de continuar.");
            return;
        }

        const actionMap = {
            'add-point': () => events.applyScoreChange(teamId, 1),
            'subtract-point': () => events.applyScoreChange(teamId, -1),
            'timeout': () => events.useControl(teamId, 'timeout'),
            'substitution': () => modals.openSubsModal(teamId),
            'edit-players': () => modals.openPlayerModal(teamId),
            'libero': () => modals.openLiberoModal(teamId),
            'open-serve-modal': modals.openServeModal,
            'swap-sides': events.swapSides,
            'open-stats-summary': modals.openStatsSummaryModal,
            'export-pdf': events.exportPDF,
            'reset-match': resetMatch,
            'clear-data': clearState,
        };

        if (actionMap[action]) {
            actionMap[action]();
        }
    });
}

/**
 * Función para crear un nuevo partido en el backend
 */
async function crearPartido() {
    try {
        const response = await fetch(`${API_URL}/partidos`, { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                equipo_local: state.teamA.name || "Equipo Local",
                equipo_visitante: state.teamB.name || "Equipo Visitante",
                estado: "en_vivo"
            })
        });

        const data = await response.json();
        console.log("Partido creado en el servidor:", data);

        // AQUÍ es donde guardamos el ID que nos dio el backend
        setPartidoId(data.id); 

        return data;
    } catch (error) {
        console.error("Error creando partido:", error);
    }
}

function init() {
    setupEventListeners();
    render();
    
    // Al iniciar, creamos el registro en el backend
    crearPartido();

    if (!events.checkRostersComplete()) {
        console.warn("Plantillas incompletas.");
    }
}

document.addEventListener('DOMContentLoaded', init);