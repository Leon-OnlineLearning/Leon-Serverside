import Lecture from "@models/Events/Lecture";
import Professor from "@models/Users/Professor";

interface ProfessorLogic {
    giveLecture(professor: Professor, lecture: Lecture) : Promise<void>;
}