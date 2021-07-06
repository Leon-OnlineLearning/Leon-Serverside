import CoursesLogic from "@controller/BusinessLogic/Course/courses-logic";
import CourseLogicImpl from "@controller/BusinessLogic/Course/courses-logic-impl";
import Course from "@models/Course";
import {
    destructDBMSConnection,
    initializeDBMSConnection,
} from "@utils/database-connection";

describe("get last test results", () => {
    beforeAll(async () => {
        try {
            await initializeDBMSConnection();
        } catch (e) {
            console.error(e);
        }
    });
    afterAll(async () => {
        try {
            await destructDBMSConnection();
        } catch (e) {
            console.error(e);
        }
    });

    test("should return null if there is no test results", async () => {
        try {
            const dummyObject = { ASD: "ASD" };
            const courseLogic: CoursesLogic = new CourseLogicImpl();
            let sample_course = new Course();
            sample_course.name = "dummy course";
            sample_course.year = 2021;
            sample_course.lastSentenceTestResults = dummyObject;
            sample_course = await new CourseLogicImpl().createCourse(
                sample_course
            );
            const res = await courseLogic.getLastTestSentenceResult(
                sample_course.id
            );
            expect(res).toEqual(dummyObject);
        } catch (e) {
            throw e;
        }
    });
});
