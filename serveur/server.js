const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// Petite page pour vérifier que le serveur fonctionne
app.get("/", (req, res) => {
    res.send("Serveur de chat OK !");
});

// Quand quelqu'un se connecte
io.on("connection", (socket) => {

    console.log("Un utilisateur vient de se connecter :", socket.id);

    // Quand quelqu'un envoie un message
    socket.on("chat-message", (message) => {

        console.log("Message reçu :", message);

        // Envoie le message à TOUS les utilisateurs
        io.emit("chat-message", message);
    });

    // Quand quelqu'un se déconnecte
    socket.on("disconnect", () => {
        console.log("Utilisateur déconnecté :", socket.id);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});