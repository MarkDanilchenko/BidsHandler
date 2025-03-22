import { sequelizeConnection } from "./models/index.js";
import logger from "./services/loggerConfig.js";
import { postgreSQLOptions, expressOptions } from "./env.js";
import fs from "fs";
import server from "./server.js";

async function startServer() {
  try {
    await sequelizeConnection.sync({ force: true });

    logger.info(`PostgreSQL connected on host: ${postgreSQLOptions.host}, port: ${postgreSQLOptions.port}`);

    // create avatars storage directory
    if (!fs.existsSync("./uploads/avatars")) {
      fs.mkdirSync("./uploads/avatars", { recursive: true });
    }

    server.listen(expressOptions.host, expressOptions.port, () => {
      logger.info(`Server is running on http://${expressOptions.host}:${expressOptions.port}`);
    });
  } catch (error) {
    logger.error(error.message);
  }
}

await startServer();

process.on("SIGINT", async () => {
  await sequelizeConnection.close();

  logger.info("PostgreSQL connection closed!");
  logger.info("Server stopped!");

  process.exit(0);
});
