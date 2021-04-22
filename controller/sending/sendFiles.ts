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

export interface ExamChunkResultCallback {
  (
    studentId: string,
    examId: string,
    result: string,
    start: Date,
    end: Date
  ): Promise<any>;
}

/**
 * @description
 * send exam file
 * NOTE: sends only chunks with even indices to the next server
 * @param userId
 * @param receiverBaseUrl
 * @param fileInfo
 * @param storageCallback
 * @param resultCallback
 */
export const sendExamFile = async (
  userId: string,
  receiverBaseUrl: string,
  fileInfo: ExamFileInfo,
  storageCallback: StorageCallback,
  resultCallback: ExamChunkResultCallback
) => {
  if (fileInfo.chunkIndex % 2 == 0) {
    const fileName = `/tmp/${fileInfo.examId}-${userId}-${fileInfo.chunkIndex}.webm`;
    await sendFileHttpMethod(
      fileName,
      fileInfo.chunk,
      "chunk",
      `${receiverBaseUrl}/exams/${userId}`,
      async (res) => {
        await resultCallback(
          userId,
          fileInfo.examId,
          res,
          fileInfo.chunkStartTime,
          fileInfo.chunkEndTime
        );
      }
    );
  }
  await storageCallback(fileInfo.chunk, fileInfo.examId, userId);
};

export async function sendInitialVideo(
  video: Buffer,
  studentId: string,
  serverBaseUrl: string,
  resultCallback: (userId: string, embedding: number[]) => Promise<void>
) {
  const fileName = `video-${studentId}-${Date.now()}.webm`;
  await sendFileHttpMethod(
    fileName,
    video,
    "student_video",
    `${serverBaseUrl}/users`,
    async (res) => {
      await resultCallback(studentId, res);
    }
  );
}

/**
 * @description
 * send file with http
 *
 * @param fileName
 * @param buffer
 * @param fieldName
 * @param url
 * @param callback
 * @param additionalFields
 */
export async function sendFileHttpMethod(
  fileName: string,
  buffer: Buffer,
  fieldName: string,
  url: string,
  callback: (res: any) => Promise<void>,
  additionalFields?: any
) {
  await fsPromises.writeFile(fileName, buffer);
  const fd = new FormData();
  fd.append(fieldName, fs.createReadStream(fileName));
  for (const key in additionalFields) {
    fd.append(key, additionalFields[key]);
  }
  try {
    let res = await axios({
      method: "post",
      headers: fd.getHeaders(),
      data: fd,
      url: url,
    });
    // FIXME this will not throw error if server is closed
    await callback(res.data);
  } catch (e) {
    console.error(e);
  } finally {
    try {
      await fsPromises.unlink(fileName);
    } catch (e) {
      console.error(e);
    }
  }
}
