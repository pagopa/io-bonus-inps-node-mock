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
<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
<s:Header><KD4SoapHeaderV2 xmlns="http://www.ibm.com/KD4Soap">
xxxx==</KD4SoapHeaderV2></s:Header
><s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
<ConsultazioneSogliaIndicatoreResponse xmlns="http://inps.it/ConsultazioneISEE">
<ConsultazioneSogliaIndicatoreResult><IdRichiesta>37</IdRichiesta>
<Esito>OK</Esito><DatiIndicatore TipoIndicatore="ISEE Ordinario" SottoSoglia="SI" ProtocolloDSU="INPS-ISEE-2020-00000032P-00" 
DataPresentazioneDSU="2020-01-23" PresenzaDifformita="NO"><Componente CodiceFiscale="SPNDNL80R13C523K" 
Cognome="MXA" Nome="BKP"/><Componente CodiceFiscale="HHZPLL55T10H501B" Cognome="HHZ" Nome="PLL"/>
</DatiIndicatore></ConsultazioneSogliaIndicatoreResult></ConsultazioneSogliaIndicatoreResponse></s:Body></s:Envelope>
`
    });
  }
});
