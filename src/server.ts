import * as http from "http";
import * as App from "./app";
import { CONFIG } from "./config";
import { logger } from "./utils/logger";

export const initExpressServer = (
  requestMock: jest.Mock,
  reasponseMock: jest.Mock
): Promise<http.Server> =>
  // Create the Express Application
  App.newExpressApp(CONFIG, requestMock, reasponseMock).then(app => {
    // Create a HTTP server from the new Express Application
    const server = http.createServer(app);
    server.listen(CONFIG.HTTP_PORT);

    logger.info(`Server started at ${CONFIG.HTTP_HOST}:${CONFIG.HTTP_PORT}`);
    return server;
  });
