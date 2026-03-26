const clients = new Set();

export function addClient(socket) {
    clients.add(socket);
    socket.on('close', () => clients.delete(socket));
    socket.on('error', () => clients.delete(socket));
}

export function broadcast(message) {
    const data = JSON.stringify(message);
    for (const client of clients) {
        try {
            if (client.readyState === 1) {
                client.send(data);
            }
        } catch {
            clients.delete(client);
        }
    }
}

export function getConnectedClients() {
    return clients.size;
}
