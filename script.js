// --- 1. OUVRIR / FERMER LE CHAT ---
const toggleBtn = document.getElementById('toggle-chat-btn');
const blocChat = document.getElementById('bloc-chat-complet');

toggleBtn.addEventListener('click', () => {
    blocChat.classList.toggle('hidden');
});

// --- 2. FONCTION POUR LES JEUX ---
function lancerJeu(url) {
    document.getElementById('texte-attente').style.display = 'none';
    const iframe = document.getElementById('iframe-jeu');
    iframe.src = url;
    iframe.style.display = 'block';
}

// --- 3. REDIMENSIONNER LE CHAT À LA SOURIS / AU TACTILE ---
const handle = document.getElementById('resize-handle');
let isResizing = false;

handle.addEventListener('mousedown', initResize);
handle.addEventListener('touchstart', initResize);

function initResize(e) {
    isResizing = true;
    document.addEventListener('mousemove', StartResize);
    document.addEventListener('touchmove', StartResize);
    document.addEventListener('mouseup', stopResize);
    document.addEventListener('touchend', stopResize);
}

function StartResize(e) {
    if (!isResizing) return;
    // Gère à la fois la souris et le tactile de l'iPad
    let clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let largeurCalculee = window.innerWidth - clientX;
    
    // Limites de taille
    if (largeurCalculee > 250 && largeurCalculee < window.innerWidth * 0.7) {
        blocChat.style.width = largeurCalculee + 'px';
    }
}

function stopResize() {
    isResizing = false;
    document.removeEventListener('mousemove', StartResize);
    document.removeEventListener('touchmove', StartResize);
}

// --- 4. GESTION DES POPUPS (OUVRIR/FERMER) ---
function ouvrirPopup(id) {
    document.getElementById(id).style.display = 'block';
}
function fermerPopup(id) {
    document.getElementById(id).style.display = 'none';
}

// --- 5. SYSTEME DE DRAG & DROP POUR LES POPUPS (iPad friendly) ---
let activePopup = null;
let currentX, currentY, initialX, initialY;
let xOffset = {}, yOffset = {};

function dragStart(e, id) {
    activePopup = document.getElementById(id);
    
    // Initialise les offsets s'ils n'existent pas pour cette popup
    if (!xOffset[id]) xOffset[id] = 0;
    if (!yOffset[id]) yOffset[id] = 0;

    let clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let clientY = e.touches ? e.touches[0].clientY : e.clientY;

    initialX = clientX - xOffset[id];
    initialY = clientY - yOffset[id];

    if (e.target.classList.contains('popup-header') || e.target.parentNode.classList.contains('popup-header')) {
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchend', dragEnd);
    }
}

function drag(e) {
    if (!activePopup) return;
    e.preventDefault();

    let clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let clientY = e.touches ? e.touches[0].clientY : e.clientY;

    currentX = clientX - initialX;
    currentY = clientY - initialY;

    let id = activePopup.id;
    xOffset[id] = currentX;
    yOffset[id] = currentY;

    activePopup.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
}

function dragEnd() {
    activePopup = null;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
}

// ==========================================
// CHAT EN TEMPS RÉEL
// ==========================================

// Adresse du serveur
// Pour l'instant, on mettra l'adresse Render ici
const SERVEUR_CHAT = "https://TON-SERVEUR.onrender.com";

const socket = io(SERVEUR_CHAT);

// Récupération des éléments du chat
const messages = document.querySelector(".messages");
const inputChat = document.querySelector(".input-chat input");
const boutonEnvoyer = document.querySelector(".input-chat button");


// ------------------------------------------
// ENVOYER UN MESSAGE
// ------------------------------------------

function envoyerMessage() {

    const texte = inputChat.value.trim();

    if (texte === "") {
        return;
    }

    // Envoie le message au serveur
    socket.emit("chat-message", texte);

    // Vide la zone de texte
    inputChat.value = "";
}


// Bouton Envoyer
boutonEnvoyer.addEventListener("click", envoyerMessage);


// Touche Entrée
inputChat.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        envoyerMessage();
    }

});


// ------------------------------------------
// RECEVOIR UN MESSAGE
// ------------------------------------------

socket.on("chat-message", (message) => {

    const nouveauMessage = document.createElement("p");

    nouveauMessage.innerHTML = `
        <b>Utilisateur :</b> ${echapperHTML(message)}
    `;

    messages.appendChild(nouveauMessage);

    // Descendre automatiquement en bas
    messages.scrollTop = messages.scrollHeight;

});


// ------------------------------------------
// PROTECTION CONTRE LE HTML
// ------------------------------------------

function echapperHTML(texte) {

    const div = document.createElement("div");

    div.textContent = texte;

    return div.innerHTML;
}


// ------------------------------------------
// ÉTAT DE LA CONNEXION
// ------------------------------------------

socket.on("connect", () => {

    console.log("Connecté au serveur de chat !");

});


socket.on("disconnect", () => {

    console.log("Déconnecté du serveur.");

});