import { Socket } from "socket.io-client/build/socket";
import axios from "axios";
import fs from "fs";
const fsPromises = fs.promises;
const FormData = require("form-data");
/**
 * @deprecated
 * In the new design HTTP request was used
 *
 * Sending video to a server socket
 * **NOTE:** this function expects an ack to happen to call the callback function
 * @param socket the client socket
 * @param file the file to be sent
 * @param usrId the id for the user associated with that video
 * @param callback a function to be called after the client socket receive a ack status as ok
 */
export const sendFileWebSocket = (
  socket: Socket,
  file: any,
  usrId: string,
  callback: any
) => {
  socket.emit("receive_video_file", { file, id: usrId }, (ack: any) => {
    if (ack.status === "ok") callback();
  });
};

export interface ExamFileInfo {
  examId: string;
  chunkIndex: number;
  lastChunk: boolean;
  chunk: Buffer;
  chunkStartTime: Date;
  chunkEndTime: Date;
}

export interface StorageCallback {
  (chunk: any, examId: string, userId: string): Promise<any>;
}

export interface ResultCallback {
  (result: string, start: Date, end: Date): Promise<any>;
}

/**
 * @description
 * send file with http post
 * NOTE: sends only chunks with even indices to the next server
 * @param userId
 * @param receiverBaseUrl
 * @param fileInfo
 * @param storageCallback
 * @param resultCallback
 */
export const sendFileHttpMethods = async (
  userId: string,
  receiverBaseUrl: string,
  fileInfo: ExamFileInfo,
  storageCallback: StorageCallback,
  resultCallback: ResultCallback
) => {
  if (fileInfo.chunkIndex % 2 == 0) {
    const fileName = `/tmp/${fileInfo.examId}-${userId}-${fileInfo.chunkIndex}.webm`;
    await fsPromises.writeFile(fileName, fileInfo.chunk);
    const fd = new FormData();
    fd.append("chunk", fs.createReadStream(fileName));
    try {
      const res = await axios({
        method: "post",
        headers: fd.getHeaders(),
        data: fd,
        url: `${receiverBaseUrl}/exams/${userId}`,
      }).then((resp) => resp.data);
      resultCallback(res, fileInfo.chunkStartTime, fileInfo.chunkEndTime);
    } catch (e) {
      console.error(e);
    } finally {
      fs.unlink(fileName, (err) => {
        if (err) console.log(err);
      });
    }
  }
  await storageCallback(fileInfo.chunk, fileInfo.examId, userId);
};
