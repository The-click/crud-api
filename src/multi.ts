import cluster from "node:cluster";
import net from "node:net";
import { availableParallelism } from "node:os";
import process from "node:process";

const numCPUs = availableParallelism();

if (cluster.isPrimary) {
    import("./main");
    const INITIAL_PORT = process.env.PORT == "4000" ? 3000 : 4000;
    const CLUSTER_PORTS: number[] = [];

    for (let i = 1; i <= numCPUs; i++) {
        cluster.fork({ CLUSTER_PORT: INITIAL_PORT + i });
        CLUSTER_PORTS.push(INITIAL_PORT + i);
    }

    const server = net.createServer((socket) => {
        console.log("Клиент подключился к балансировщику");
        const currentPort = CLUSTER_PORTS.shift();

        console.log(currentPort);

        if (!currentPort) {
            return;
        }

        const client = net.connect({ port: currentPort, noDelay: true }, () => {
            socket.pipe(client, { end: true }).pipe(socket);
        });

        socket.on("end", () => client.end());
        client.on("end", () => socket.end());

        // Обработка ошибок
        socket.on("error", (err) => {
            console.error("Socket error:", err);
            client.end();
        });
        client.on("error", (err) => {
            console.error("Client error:", err);
            socket.end();
        });

        CLUSTER_PORTS.push(currentPort);
    });

    server.listen(INITIAL_PORT, () => {
        console.log("Балансировщик запущен на порту " + INITIAL_PORT);
    });

    cluster.on("exit", (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        cluster.fork();
    });
} else {
    const server = net.createServer({ noDelay: true }, (socket) => {
        console.log(
            "Получен запрос от балансировщика. Порт " + process.env.CLUSTER_PORT
        );

        const client = net.createConnection(
            { port: +(process.env.PORT || 3000), noDelay: true },
            () => {
                socket.pipe(client, { end: true });
            }
        );

        client.on("data", (data) => {
            socket.write(data);
            socket.end();
        });

        socket.on("end", () => client.end());
        client.on("end", () => {
            socket.end();
        });

        // Обработка ошибок
        socket.on("error", (err) => {
            console.error("Socket error:", err);
            client.end();
        });
        client.on("error", (err) => {
            console.error("Client error:", err);
            socket.end();
        });
    });

    server.listen(process.env.CLUSTER_PORT, () => {
        console.log("Прокси запущен на порту  " + process.env.CLUSTER_PORT);
    });
}
