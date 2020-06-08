/**
 * Common configurations for INPS mocks and external resources
 */

import * as t from "io-ts";
import { NonEmptyString } from "italia-ts-commons/lib/strings";

const localhost = "http://localhost";

export const CONFIG = {
  // The log level used for Winston logger (error, info, debug)
  WINSTON_LOG_LEVEL: process.env.WINSTON_LOG_LEVEL || "debug",

  // RESTful Webservice configuration
  // These information are documented here:
  // https://docs.google.com/document/d/1Qqe6mSfon-blHzc-ldeEHmzIkVaElKY5LtDnKiLbk80/edit
  // Used to expose services
  INPS_MOCK_SERVER: {
    HOST: process.env.HOST || localhost,
    PORT: process.env.PORT || 3003,

    ROUTES: {
      INPS: "/webservices/inps/SvcConsultazione"
    }
  }
};

// Configuration validator - Define configuration types and interfaces
const ServerConfiguration = t.interface({
  HOST: NonEmptyString,
  // We allow t.string to use socket pipe address in Azure App Services
  PORT: t.any
});
export type ServerConfiguration = t.TypeOf<typeof ServerConfiguration>;

const InpsMockConfig = t.intersection([
  ServerConfiguration,
  t.interface({
    ROUTES: t.interface({
      INPS: NonEmptyString
    })
  })
]);
export type InpsMockConfig = t.TypeOf<typeof InpsMockConfig>;

export const ConsultazioneISEEConfig = ServerConfiguration;
export type ConsultazioneISEEConfig = t.TypeOf<typeof ConsultazioneISEEConfig>;

export const WinstonLogLevel = t.keyof({
  debug: 4,
  error: 0,
  info: 2
});
export type WinstonLogLevel = t.TypeOf<typeof WinstonLogLevel>;

export const Configuration = t.interface({
  INPS_MOCK_SERVER: InpsMockConfig,
  WINSTON_LOG_LEVEL: WinstonLogLevel
});
export type Configuration = t.TypeOf<typeof Configuration>;
