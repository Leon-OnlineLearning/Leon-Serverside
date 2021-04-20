import sendVideoWebsocket from "@controller/sending/sendFiles";
import fs from "fs";
import { createServer } from "http";
import { AddressInfo } from "net";
import { Server, Socket } from "socket.io";
import { io as Client } from "socket.io-client";
import {Socket as ClientSocket} from "socket.io-client/build/socket"
require("dotenv").config();

describe("Video over websocket testing", () => {
  let io: Server, serverSocket: Socket, serverUrl: string, clientSocket: ClientSocket;
  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer, { maxHttpBufferSize: 1e8 });
    httpServer.listen(() => {
      serverUrl = `http://localhost:${
        (httpServer.address() as AddressInfo).port
      }`;
      clientSocket = Client(serverUrl);
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  const prepareFile = (filePath: string) => {
    return fs.readFileSync(filePath);
  };

  test("it should send valid file", (done) => {
    const id = "userId";
    const fileName = __dirname + "/videoTst.webm";

    serverSocket.on("receive_video_file", (data, cb) => {
      expect(data.file).toEqual(prepareFile(fileName));
      expect(data.id).toEqual(id);
      cb({
        status: "ok",
      });
    });

    sendVideoWebsocket(clientSocket, prepareFile(fileName), id, done);

  });
});
