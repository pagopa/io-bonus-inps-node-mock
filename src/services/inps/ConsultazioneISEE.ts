/**
 * Define FespCd SOAP Servers to expose to PagoPa
 */

import * as core from "express-serve-static-core";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import * as path from "path";
import * as soap from "soap";

import { readWsdl } from "../../utils/soap";
import { IConsultazioneISEESoap } from "./IConsultazioneISEESoap";

// WSDL path
const CONSULTAZIONE_ISEE_WSDL_PATH = path.join(
  __dirname,
  "./../../wsdl/ConsultazioneISEE.wsdl"
) as NonEmptyString;

// placeholder for callback functions
const toStdOut = (methodName: string) => (value: unknown) => {
  // tslint:disable-next-line: no-console
  console.log(`no callback passed to ${methodName}, value:`, value);
};

/**
 * Attach FespCd SOAP service to a server instance
 * @param {core.Express} server - The server instance to use to expose services
 * @param {NonEmptyString} path - The endpoint path
 * @param {soap.IServicePort} consultazioneISEEServiceHandlers - The service controller
 * @return {Promise<soap.Server>} The soap server defined and started
 */
export async function attachConsultazioneISEEServer(
  server: core.Express,
  apiPath: NonEmptyString,
  consultazioneISEEServiceHandlers: IConsultazioneISEESoap
): Promise<soap.Server> {
  const wsdl = await readWsdl(CONSULTAZIONE_ISEE_WSDL_PATH);
  const service = {
    SvcConsultazione: {
      BasicHttpBinding_ISvcConsultazione: consultazioneISEEServiceHandlers
    }
  };
  // we need this because wsdl is parsed at runtime, and paths must be adjusted
  const normalizedWsdl = wsdl.replace(
    /schemaLocation="(.+)"/gm,
    `schemaLocation="${process.cwd()}/dist/wsdl/$1"`
  );
  return soap.listen(server, apiPath, service, normalizedWsdl, err => {
    if (err) {
      // tslint:disable-next-line: no-console
      console.error("Error starting the server", err);
      throw err;
    }
  });
}

/**
 * Factory method that creates the set of methods that define the soap api.
 * Each method receives a parsed version of the xml input of the request, and outputs the results in the callback.
 * The result can be either an error (in the form of a wsdl Fault), a literal xml (using _xml reserved attribute) or a serializable object.
 * In each case the result will be wrapped in a soap envelop as defined in the provided wsdl
 */
export const ConsultazioneISEEServiceHandler = (): IConsultazioneISEESoap => ({
  ConsultazioneSogliaIndicatore: (
    // tslint:disable-next-line: variable-name
    _input: unknown,
    callback: (value: unknown) => void = toStdOut(
      "ConsultazioneSogliaIndicatore"
    )
  ) => {
    // fixed mock for now
    callback({
      _xml: `
          <tns:ConsultazioneSogliaIndicatoreResponse>
            <tns:ConsultazioneSogliaIndicatoreResult ProtocolloDSU="INPS-ISEE-0000-00000000A-00" SottoSoglia="SI" TipoIndicatore="ISEE Standard" DataPresentazioneDSU="2020-05-01">
              <tns:Componente Nome="GIUSEPPE" Cognome="GARIBALDI" CodiceFiscale="VRDGPP83R10B293I"/>
              <tns:Componente Nome="ENZO" Cognome="FERRARI" CodiceFiscale="FRRNZE98B18F257D"/>
            </tns:ConsultazioneSogliaIndicatoreResult>
          </tns:ConsultazioneSogliaIndicatoreResponse>
      `
    });
  }
});
