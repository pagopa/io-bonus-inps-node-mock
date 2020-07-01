// tslint:disable: no-any

import { constVoid } from "fp-ts/lib/function";
import * as http from "http";
import * as App from "./app";
import { CONFIG } from "./config";
import { logger } from "./utils/logger";

const voidProcessors: App.IMockServerProcessors = {
  processAdeRequest: constVoid as any,
  processAdeResponse: constVoid as any,
  processInpsRequest: constVoid as any,
  processInpsResponse: constVoid as any,
  processServiceGetProfileRequest: constVoid as any,
  processServiceGetProfileResponse: constVoid as any,
  processServiceSendMessageRequest: constVoid as any,
  processServiceSendMessageResponse: constVoid as any
};

export const initExpressServer = (
  processors: App.IMockServerProcessors = voidProcessors
): Promise<http.Server> =>
  // Create the Express Application
  App.newExpressApp(CONFIG, processors).then(app => {
    // Create a HTTP server from the new Express Application
    const server = http.createServer(app);
    server.listen(CONFIG.HTTP_PORT);

    logger.info(`Server started at ${CONFIG.HTTP_HOST}:${CONFIG.HTTP_PORT}`);
    return server;
  });
