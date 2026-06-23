import { validateEnv, getEnv } from "./config/env.js";
import app, { server } from "./app.js";
import { logger } from "./lib/logger";

validateEnv();

const env = getEnv();
server.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "Server listening");
});

export default app;
