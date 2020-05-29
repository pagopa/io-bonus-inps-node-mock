const fiscalCodeGiuseppeGaribaldi = "VRDGPP83R10B293I";
const fiscalCodeEnzoFerrari = "FRRNZE98B18F257D";
const aSuccessfulResponse = {
  _xml: `
    <con:ConsultazioneSogliaIndicatoreResponse>
		<con:IdRichiesta>12345678</con:IdRichiesta>
		<con:Esito>OK</con:Esito>
		<con:ConsultazioneSogliaIndicatoreResult ProtocolloDSU="INPS-ISEE-0000-00000000A-00" SottoSoglia="SI" TipoIndicatore="ISEE Ordinario" DataPresentazioneDSU="2020-05-01" PresenzaDifformita="NO">
			<con:Componente Nome="GIUSEPPE" Cognome="GARIBALDI" CodiceFiscale="${fiscalCodeGiuseppeGaribaldi}"/>
			<con:Componente Nome="ENZO" Cognome="FERRARI" CodiceFiscale="${fiscalCodeEnzoFerrari}"/>
		</con:ConsultazioneSogliaIndicatoreResult>
    </con:ConsultazioneSogliaIndicatoreResponse>
  `
};

const aUnsuccessfulResponse = {
  _xml: `
    <con:ConsultazioneSogliaIndicatoreResponse>
		<con:IdRichiesta>12345678</con:IdRichiesta>
		<con:Esito>DATI_NON_TROVATI</con:Esito>
		<con:DescrizioneErrore>Codice Fiscale non trovato in archivio ISEE</con:DescrizioneErrore>
	</con:ConsultazioneSogliaIndicatoreResponse>
  `
};

// tslint:disable-next-line: no-any
export default function(input: any): any {
  return [fiscalCodeGiuseppeGaribaldi, fiscalCodeEnzoFerrari].includes(
    input.attributes.CodiceFiscale
  )
    ? aSuccessfulResponse
    : aUnsuccessfulResponse;
}
