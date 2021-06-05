import CoursesLogic from "@controller/BusinessLogic/Course/courses-logic";
import CourseLogicImpl from "@controller/BusinessLogic/Course/courses-logic-impl";
import ModelLogic from "@controller/BusinessLogic/TextClassification/models-logic";
import ModelLogicImpl from "@controller/BusinessLogic/TextClassification/models-logic-impl";
import Course from "@models/Course";
import TextClassificationModel from "@models/TextClassification/TextClassificationModel";
import {
    destructDBMSConnection,
    initializeDBMSConnection,
} from "@utils/database-connection";

describe("text classification model", () => {
    beforeAll((done) => {
        initializeDBMSConnection()
            .then(() => {
                done();
            })
            .catch((err) => {
                console.error(err);
            });
    });

    afterAll((done) => {
        destructDBMSConnection()
            .then(() => {
                done();
            })
            .catch((err) => {
                console.error(err);
            });
    });
    test("should save mode to course and add course correctly", async () => {
        // create a course
        // create a model and add it to the course
        // get all models for course
        // check if the model created was there
        try {
            const courseLogic: CoursesLogic = new CourseLogicImpl();
            const _c = new Course();
            _c.name = "test course";
            _c.year = 3;
            const course = await courseLogic.createCourse(_c);
            const _model = new TextClassificationModel();
            _model.accuracy = 12;
            _model.dataClassificationModelPath = "xyz";
            _model.dataLanguageModelPath = "xyz";
            _model.trainingModelPath = "xyz";
            _model.name = "model_xyz";
            _model.predictionModelPath = "haha";
            const modelLogic: ModelLogic = new ModelLogicImpl();
            const model = await modelLogic.addModelInCourse(_model, course.id);
            console.log("courseId", course.id);
            const courseModels = await courseLogic.getAllTextClassificationModels(
                course.id
            );
            const res = courseModels.find((cm: any) => cm.id === model.id);
            expect(res).toBeTruthy();
        } catch (e) {
            console.error(e);
            expect(true).toBeFalsy();
        }
    });
});
