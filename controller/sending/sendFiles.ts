import { Socket } from "socket.io-client/build/socket";
/**
 * Sending video to a server socket
 * *NOTE:* this function expects an ack to happen to call the callback function
 * @param socket the client socket
 * @param file the file to be sent
 * @param usrId the id for the user associated with that video
 * @param callback a function to be called after the client socket receive a ack status as ok
 */
const sendVideo = (socket: Socket, file: any, usrId: string, callback: any) => {
  socket.emit("receive_video_file", { file, id: usrId }, (ack: any) => {
    if (ack.status === "ok") callback();
  });
};

// testing
export default sendVideo;
