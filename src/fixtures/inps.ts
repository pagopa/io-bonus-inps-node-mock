import { FiscalCode } from "italia-ts-commons/lib/strings";

type MockResponse = readonly [number, string];

const memberStr = (fiscalCode: FiscalCode) =>
  `<Componente CodiceFiscale="${fiscalCode}" Cognome="Mario" Nome="Rossi" />`;

export const EligibilityCheckSuccessEligible = (
  familyMembers: readonly FiscalCode[]
): MockResponse => [
  200,
  `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
<s:Header>
<KD4SoapHeaderV2 xmlns="http://www.ibm.com/KD4Soap">xxxx==</KD4SoapHeaderV2>
</s:Header>
<s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
        xmlns:xsd="http://www.w3.org/2001/XMLSchema">
<ConsultazioneSogliaIndicatoreResponse xmlns="http://inps.it/ConsultazioneISEE">
  <ConsultazioneSogliaIndicatoreResult>
  <IdRichiesta>1</IdRichiesta>
  <Esito>OK</Esito>
  <DatiIndicatore TipoIndicatore="ISEE Ordinario" SottoSoglia="SI"
                  ProtocolloDSU="INPS-ISEE-2020-00000032P-00" 
                  DataPresentazioneDSU="2020-01-23" PresenzaDifformita="NO">
                  ${familyMembers.map(memberStr)}
</DatiIndicatore></ConsultazioneSogliaIndicatoreResult>
</ConsultazioneSogliaIndicatoreResponse>
</s:Body>
</s:Envelope>`
];

export const EligibilityCheckSuccessEligibleWithDiscrepancies = (
  familyMembers: readonly FiscalCode[]
): MockResponse => [
  200,
  `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
<s:Header>
<KD4SoapHeaderV2 xmlns="http://www.ibm.com/KD4Soap">xxxx==</KD4SoapHeaderV2>
</s:Header>
<s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
        xmlns:xsd="http://www.w3.org/2001/XMLSchema">
<ConsultazioneSogliaIndicatoreResponse xmlns="http://inps.it/ConsultazioneISEE">
  <ConsultazioneSogliaIndicatoreResult>
  <IdRichiesta>1</IdRichiesta>
  <Esito>OK</Esito>
  <DatiIndicatore TipoIndicatore="ISEE Ordinario" SottoSoglia="SI"
                  ProtocolloDSU="INPS-ISEE-2020-00000032P-00" 
                  DataPresentazioneDSU="2020-01-23" PresenzaDifformita="SI">
                  ${familyMembers.map(memberStr)}
</DatiIndicatore></ConsultazioneSogliaIndicatoreResult>
</ConsultazioneSogliaIndicatoreResponse>
</s:Body>
</s:Envelope>`
];

export const EligibilityCheckSuccessIneligible = (
  familyMembers: readonly FiscalCode[]
): MockResponse => [
  200,
  `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
<s:Header>
<KD4SoapHeaderV2 xmlns="http://www.ibm.com/KD4Soap">xxxx==</KD4SoapHeaderV2>
</s:Header>
<s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
        xmlns:xsd="http://www.w3.org/2001/XMLSchema">
<ConsultazioneSogliaIndicatoreResponse xmlns="http://inps.it/ConsultazioneISEE">
  <ConsultazioneSogliaIndicatoreResult>
  <IdRichiesta>1</IdRichiesta>
  <Esito>OK</Esito>
  <DatiIndicatore TipoIndicatore="ISEE Ordinario" SottoSoglia="NO"
                  ProtocolloDSU="INPS-ISEE-2020-00000032P-00" 
                  DataPresentazioneDSU="2020-01-23" PresenzaDifformita="NO">
                  ${familyMembers.map(memberStr)}
</DatiIndicatore></ConsultazioneSogliaIndicatoreResult>
</ConsultazioneSogliaIndicatoreResponse>
</s:Body>
</s:Envelope>`
];

export const EligibilityCheckFailure = (
  familyMembers: readonly FiscalCode[]
): MockResponse => [
  200,
  `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
<s:Header>
<KD4SoapHeaderV2 xmlns="http://www.ibm.com/KD4Soap">xxxx==</KD4SoapHeaderV2>
</s:Header>
<s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
        xmlns:xsd="http://www.w3.org/2001/XMLSchema">

<ConsultazioneSogliaIndicatoreResponse xmlns="http://inps.it/ConsultazioneISEE">
			<ConsultazioneSogliaIndicatoreResult>
				<IdRichiesta>0</IdRichiesta>
				<Esito>ERRORE_INTERNO</Esito>
				<DescrizioneErrore>Si è verificato un errore blocante</DescrizioneErrore>
			</ConsultazioneSogliaIndicatoreResult>
		</ConsultazioneSogliaIndicatoreResponse>
</s:Body>
</s:Envelope>`
];

export const EligibilityCheckError = (): MockResponse => [500, "Error"];

export const INPS_RESPONSES = {
  isEligible: EligibilityCheckSuccessEligible,
  hasEligibilityFailure: EligibilityCheckFailure,
  isEligibleWithDiscrepancies: EligibilityCheckSuccessEligibleWithDiscrepancies,
  isIneligible: EligibilityCheckSuccessIneligible,
  hasEligibilityError: EligibilityCheckError
};
