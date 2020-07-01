import * as express from "express";
import * as bodyParserXml from "express-xml-bodyparser";
import { constVoid } from "fp-ts/lib/function";
import { delayTask } from "italia-ts-commons/lib/tasks";
import { Millisecond } from "italia-ts-commons/lib/units";
import * as morgan from "morgan";
import { CONFIG } from "./config";
import { ADE_RESPONSES } from "./fixtures/ade";
import {
  getFamilyMembersForFiscalCode,
  parseFiscalCode
} from "./fixtures/fiscalcode";
import { INPS_RESPONSES } from "./fixtures/inps";

export interface IMockServerProcessors {
  processInpsRequest: jest.Mock;
  processInpsResponse: jest.Mock;

  processAdeRequest: jest.Mock;
  processAdeResponse: jest.Mock;

  processServiceGetProfileRequest: jest.Mock;
  processServiceGetProfileResponse: jest.Mock;

  processServiceSendMessageRequest: jest.Mock;
  processServiceSendMessageResponse: jest.Mock;
}

export async function newExpressApp(
  _: typeof CONFIG,
  processors: IMockServerProcessors
): Promise<Express.Application> {
  const app = express();

  morgan.token("body", (req, __) => JSON.stringify(req.body));

  const loggerFormat =
    ":date[iso] [info]: :method :url :status - :body - :response-time ms";

  app.use(morgan(loggerFormat));

  app.use(express.json());
  app.use(express.urlencoded());
  app.use(bodyParserXml({}));

  app.post("/INPS*", async (req, res) => {
    processors.processInpsRequest(req);

    const fiscalCode =
      req.body["soapenv:envelope"]["soapenv:body"][0][
        "con:consultazionesogliaindicatore"
      ][0]["con:request"][0].$.CodiceFiscale;

    const options = parseFiscalCode(fiscalCode);

    const [status, payload] = INPS_RESPONSES[options.inpsResponse](
      getFamilyMembersForFiscalCode(fiscalCode)
    );

    await delayTask(
      (options.inpsTimeout * 1000) as Millisecond,
      constVoid
    ).run();

    res.status(status).send(payload);
    processors.processInpsResponse(payload);
  });

  app.post("/ADE*", (req, res) => {
    processors.processAdeRequest(req);
    const fiscalCode = req.body.codiceFiscaleDichiarante;

    const options = parseFiscalCode(fiscalCode);

    const [status, payload] = ADE_RESPONSES[options.adeResponse](
      options.adeResponse === "A" ? req.body : fiscalCode
    );
    res.status(status).json(payload);
    processors.processAdeResponse(payload);
  });

  // profile
  app.get("/SERVICE*", (req, res) => {
    processors.processServiceGetProfileRequest(req);
    processors.processServiceGetProfileResponse(res);
    res
      .status(200)
      .json(req.body)
      .end();
  });

  // message
  app.post("/SERVICE*", (req, res) => {
    processors.processServiceSendMessageRequest(req);
    processors.processServiceSendMessageResponse(res);
    res.status(201).json(req.body);
  });

  return app;
}
