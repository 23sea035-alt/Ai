import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import companionsRouter from "./companions.js";
import chatRouter from "./chat.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(companionsRouter);
router.use(chatRouter);

export default router;
