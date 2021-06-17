import ProfessorLogic from "@controller/BusinessLogic/User/Professor/professors-logic";
import ProfessorLogicIml from "@controller/BusinessLogic/User/Professor/professors-logic-impl";
import StudentLogic from "@controller/BusinessLogic/User/Student/students-logic";
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl";
import UserTypes from "@models/Users/UserTypes";
import {
    accessTokenValidationMiddleware,
    BlockedJWTMiddleware,
} from "@services/Auth";
import simpleFinalMWDecorator from "@services/utils/RequestDecorator";
import { Router } from "express";
import { onlyStudentOrProfessor } from "../User/AuthorizationMiddleware";

const router = Router();

router.use(BlockedJWTMiddleware);
router.use(accessTokenValidationMiddleware);

// TODO move this type to better place
export type userTockenData = {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    iat: number;
    exp: number;
};

router.get("/timed", onlyStudentOrProfessor, (req, res) => {
    let startingFrom: string;
    let endingAt: string;
    console.debug("query parameters", req.query);
    if (
        typeof req.query.startingFrom === "string" &&
        typeof req.query.endingAt === "string"
    ) {
        startingFrom = req.query.startingFrom;
        endingAt = req.query.endingAt;
    } else {
        res.status(400).send({
            success: false,
            message: "You should provide the start time and ending time",
        });
        return;
    }

    simpleFinalMWDecorator(res, async () => {
        // get events based in logic
        let userLogic: StudentLogic | ProfessorLogic;
        const user = req.user as userTockenData;
        switch (user.role) {
            case UserTypes.PROFESSOR:
                userLogic = new ProfessorLogicIml();
                break;
            case UserTypes.STUDENT:
                userLogic = new StudentLogicImpl();
                break;
            default:
                throw new Error("invalid user type");
        }

        console.debug(`getting events from ${startingFrom} to ${endingAt}`);

        const events = await userLogic.getAllEvents(
            user.id,
            startingFrom,
            endingAt
        );
        console.debug(`sending ${events.length} events`);
        return events;
    });
});

export default router;
