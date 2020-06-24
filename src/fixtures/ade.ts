// tslint:disable: no-identical-functions

import { FiscalCode } from "italia-ts-commons/lib/strings";

type MockResponse = readonly [number, unknown];

export const AdeResponseOk = (payload: unknown): MockResponse => {
  return [
    200,
    {
      result: payload
    }
  ];
};

export const AdeResponse500x4000Retry = (
  fiscalCode: FiscalCode
): MockResponse => {
  return [
    500,
    {
      errorCode: 4000,
      errorMessage: "Generic Error"
    }
  ];
};

export const AdeResponse500x3000Retry = (
  fiscalCode: FiscalCode
): MockResponse => {
  return [
    500,
    {
      errorCode: 3000,
      errorMessage: "Generic Application Error"
    }
  ];
};

export const AdeResponse400x1000NoRetry = (
  fiscalCode: FiscalCode
): MockResponse => {
  return [
    400,
    {
      errorCode: 1000,
      errorMessage: "Codice presente in banca dati"
    }
  ];
};

export const AdeResponse400x1005NoRetry = (
  fiscalCode: FiscalCode
): MockResponse => {
  return [
    400,
    {
      errorCode: 1005,
      errorMessage:
        "Presente in banca dati una richiesta associata ad un altro componente del nucleo familiare"
    }
  ];
};

export const AdeResponse400x900NoRetry = (
  fiscalCode: FiscalCode
): MockResponse => {
  return [
    400,
    {
      errorCode: 900,
      errorMessage: "Il nucleo familiare deve contenere almeno un elemento"
    }
  ];
};

export const AdeResponse400x907NoRetry = (
  fiscalCode: FiscalCode
): MockResponse => {
  return [
    400,
    {
      errorCode: 907,
      errorMessage: "Codice fiscale richiedente obbligatorio"
    }
  ];
};

export const AdeResponse400x908NoRetry = (
  fiscalCode: FiscalCode
): MockResponse => {
  return [
    400,
    {
      errorCode: 907,
      errorMessage: "Data Generazione buono, obbligatoria"
    }
  ];
};

export const ADE_RESPONSES = {
  A: AdeResponseOk,
  B: AdeResponse400x1000NoRetry,
  C: AdeResponse400x1005NoRetry,
  D: AdeResponse400x900NoRetry,
  E: AdeResponse400x907NoRetry,
  F: AdeResponse400x908NoRetry,
  G: AdeResponse500x3000Retry,
  H: AdeResponse500x4000Retry
};
