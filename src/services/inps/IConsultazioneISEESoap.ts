import * as soap from "soap";
export interface IConsultazioneISEESoap extends soap.IServicePort {
  ConsultazioneSogliaIndicatore: soap.ISoapServiceMethod;
}
