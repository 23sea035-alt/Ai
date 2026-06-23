import { Router } from "express";
import clerkWebhooks from "../webhooks/clerk.js";

const router = Router();

router.use("/webhooks", clerkWebhooks);

export default router;
