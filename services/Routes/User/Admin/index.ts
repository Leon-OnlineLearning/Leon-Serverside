import { Router } from "express";
import passport, { BlockedJWTMiddleware } from "@services/Auth";
import { onlyAdmins } from "../AuthorizationMiddleware";
import Admin from "@models/Users/Admin";
import AdminLogic from "@controller/BusinessLogic/User/Admin/admin-logic";
import AdminLogicImpl from "@controller/BusinessLogic/User/Admin/admin-logic-impl";
import BodyParserMiddleware from "../../BodyParserMiddleware/BodyParserMiddleware";
import {
    AdminParser,
    AdminRequest,
} from "../../BodyParserMiddleware/AdminParser";
import paginationParameters from "@services/Routes/utils/pagination";
import simpleFinalMWDecorator from "@services/utils/RequestDecorator";

const router = Router();

router.use(BlockedJWTMiddleware);
router.use(passport.authenticate("access-token", { session: false }));

const parser: BodyParserMiddleware = new AdminParser();

router.get("/", onlyAdmins, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: AdminLogic = new AdminLogicImpl();
        const [skip, take] = paginationParameters(req);
        const admins = await logic.getAllAdmins(skip, take);
        return admins.map((a) => a.summary());
    });
});

router.post("/", onlyAdmins, parser.completeParser, async (req, res) => {
    simpleFinalMWDecorator(
        res,
        async () => {
            const request = req as AdminRequest;
            const logic: AdminLogic = new AdminLogicImpl();
            const _admin = await logic.createAdmin(request.account as Admin);
            const admin = new Admin();
            admin.setValuesFromJSON(_admin);
            return admin.summary();
        },
        201
    );
});

router.delete("/:adminId", onlyAdmins, async (req, res) => {
    simpleFinalMWDecorator(
        res,
        async () => {
            const logic: AdminLogic = new AdminLogicImpl();
            await logic.deleteAdminById(req.params.adminId);
        },
        204
    );
});

router.put("/:adminId", onlyAdmins, parser.partialParser, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const request = req as AdminRequest;
        const logic: AdminLogic = new AdminLogicImpl();
        const admin = await logic.updateAdmin(
            req.params.adminId,
            request.account
        );
        return admin.summary();
    });
});

router.get("/:adminId", onlyAdmins, async (req, res) => {
    try {
        const logic: AdminLogic = new AdminLogicImpl();
        const admin = await logic.getAdminById(req.params.adminId);
        if (!admin) {
            res.status(400).send({
                message: "Admin is not found",
                success: false,
            });
            return;
        }
        return admin.summary();
    } catch (e) {
        res.status(400).send({ message: e.message, success: false });
    }
});

export default router;
