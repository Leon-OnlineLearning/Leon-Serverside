import Course from "@models/Course";
import Event from "@models/Events/Event";
import UserTypes from "@models/Users/UserTypes";
import ProfessorLogicIml from "../User/Professor/professors-logic-impl";
import StudentLogicImpl from "../User/Student/students-logic-impl";
import EventLogic from "./events-logic";
import ExamsLogicImpl from "./Exam/exam-logic-impl";
import LecturesLogicImpl from "./Lecture/lectures-logic-impl";

export default class EventslogicImpl implements EventLogic {
    deleteEventById(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    /**
     *
     * @param role
     * @param userId
     * @param startingFrom minimum start time for event
     * @param endingAt maximum end time for events
     * @returns events betwean period startingFrom and endingat
     *
     * FIXME professor is assignes to lecture and exam individaully
     * this will return all lectures and exam in course
     */
    async getAllEvents(
        role: UserTypes,
        userId: string,
        startingFrom: string,
        endingAt: string
    ): Promise<Event[]> {
        let courses: Course[];
        if (role == UserTypes.PROFESSOR)
            courses = await new ProfessorLogicIml().getAllCourses(userId);
        else if (role == UserTypes.STUDENT)
            courses = await new StudentLogicImpl().getAllCourses(userId);
        else throw new Error("unsupported role for courses");

        console.debug(`found ${courses.length} course`);
        let res: Array<Event> = [];
        for (const course of courses) {
            let lectures = await new LecturesLogicImpl().getLecturesByCourse(
                course.id,
                startingFrom,
                endingAt
            );
            lectures = lectures.map((lect) => {
                return { ...lect, eventType: "lecture" };
            });
            let exams = await new ExamsLogicImpl().getExamsByCourse(
                course.id,
                startingFrom,
                endingAt
            );
            exams = exams.map((ex) => {
                return { ...ex, eventType: "exam" };
            });
            res = [...res, ...lectures, ...exams];
        }
        return res;
    }
}
