import "reflect-metadata";
import express from "express";
import { databaseStartup } from "@utils/database";
import authRouter from "@services/Routes/User/AuthenticationRoutes";
import userRouter from "@services/Routes/User/SecureRoutes";
import studentRouter from "@services/Routes/User/Student";
import professorRouter from "@services/Routes/User/Professor";
import adminRouter from "@services/Routes/User/Admin";
import examRouter, { open_router_secondary } from "@services/Routes/Event/Exam";
import lectureRouter from "@services/Routes/Event/Lecture";
import courseRouter from "@services/Routes/Course";
import departmentRouter from "@services/Routes/Department";
import trainingRouter from "@services/Routes/training";
import staticRouter from "@services/Routes/staticContent";
import textClassificationModelsRouts from "@services/Routes/textClassificationModel";
import eventRouter from "@services/Routes/Event/event.routes";
import passport from "@services/Auth";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(
    cors({
        origin: ["http://localhost:3000"],
        credentials: true,
        exposedHeaders: ["set-cookie"],
    })
);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use("/auth", authRouter);
// app.use("/users", userRouter);
app.use("/students", studentRouter);
app.use("/professors", professorRouter);
app.use("/admins", adminRouter);
app.use("/courses", courseRouter);
app.use("/exams", examRouter);
app.use("/exams2", open_router_secondary);
app.use("/lectures", lectureRouter);
app.use("/events", eventRouter);
app.use("/departments", departmentRouter);
app.use("/training", trainingRouter);
app.use("/text-classification-models", textClassificationModelsRouts);
app.use("/static", staticRouter);

app.use("/lecturesFiles", express.static("lectures"));

const PORT = process.env.SERVER_PORT || 3333;

// for http in dev
// uncomment this
app.listen(PORT, async () => {
    console.log(`listening on port ${PORT}`);
    await databaseStartup();
});

app.get("/sayHello", (_, res) => {
    res.send("hello");
});
