import { Socket } from "socket.io-client/build/socket";
import axios from "axios";
import fs from "fs";
import StudentLogic from "@controller/BusinessLogic/User/Student/students-logic";
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl";
import Embedding from "@models/Users/Embedding";
const fsPromises = fs.promises;
const FormData = require("form-data");


export interface ExamFileInfo {
  examId: string;
  chunkIndex: number;
  lastChunk: boolean;
  chunk?: Buffer;
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
 * send exam file and delete it
 * NOTE: sends only chunks with even indices to the next server
 * @param userId
 * @param receiverBaseUrl
 * @param fileInfo
 * @param filePath
 * @param resultCallback
 */
export const sendExamFile = async (
  userId: string,
  receiverBaseUrl: string,
  fileInfo: ExamFileInfo,
  filePath: string,
  embedding: Embedding,
  resultCallback: ExamChunkResultCallback
) => {
  if (fileInfo.chunkIndex % 2 == 0) {
    
    // const fileName = `${fileInfo.examId}-${userId}-${fileInfo.chunkIndex}.webm`;

    await sendFileHttpMethod(
      filePath,
      "chunk",
      `${receiverBaseUrl}/exams/${userId}`,
      async (res) => {
        await resultCallback(
          userId,
          fileInfo.examId,
          res,
          fileInfo.chunkStartTime,
          fileInfo.chunkEndTime,
        );
      },
      undefined,
      embedding.vector
    );
  }
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
    "student_video",
    `${serverBaseUrl}/users`,
    async (res) => {
      await resultCallback(studentId, res.embedding);
    },
    video,
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
  fieldName: string,
  url: string,
  callback: (res: any) => Promise<void>,
  buffer? : Buffer,
  additionalFields?: any,
) {
  if (buffer){
    fileName = `/tmp/${fileName}`
    await fsPromises.writeFile(fileName, buffer);
  }
  const fd = new FormData();
  fd.append(fieldName, fs.createReadStream(fileName));
  
  // DELETEME
  console.log(fs.readFileSync(fileName))
  
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
      if (buffer)
        await fsPromises.unlink(`${fileName}`);
    } catch (e) {
      console.error(e);
    }
  }
}
