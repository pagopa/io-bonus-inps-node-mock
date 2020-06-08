import * as express from "express";
import * as morgan from "morgan";
import { Configuration } from "./config";
import * as ConsultazioneISEE from "./services/inps/ConsultazioneISEE";
import { logger } from "./utils/logger";

export async function newExpressApp(
  config: Configuration
): Promise<Express.Application> {
  const app = express();
  app.set("port", config.INPS_MOCK_SERVER.PORT);
  const loggerFormat =
    ":date[iso] [info]: :method :url :status - :response-time ms";
  app.use(morgan(loggerFormat));

  const soapServer = await ConsultazioneISEE.attachConsultazioneISEEServer(
    app,
    config.INPS_MOCK_SERVER.ROUTES.INPS,
    ConsultazioneISEE.ConsultazioneISEEServiceHandler()
  );
  // tslint:disable-next-line: no-object-mutation
  soapServer.log = (type, data) => {
    logger.debug(`SOAP TYPE: ${type}`);
    logger.debug(`SOAP DATA: ${data}`);
  };
  return app;
}
