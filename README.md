# io-bonusvacanze-inps-node-mock

A mock implementation of the INPS soap service

## Usage

```sh
yarn install
yarn build
yarn start
```

## Environment

| name              | description                 | default            |
| ----------------- | --------------------------- | ------------------ |
| WINSTON_LOG_LEVEL | desired log level           | "debug"            |
| HOST              | host this server listens to | "http://localhost" |
| PORT              | host this server listens to | 3003               |

## Example request

```sh

curl -d '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:con="http://inps.it/ConsultazioneISEE">
<soapenv:Header>
		<inps:Identity xmlns:inps="http://inps.it/">
			<UserId>PAGOPA</UserId>
			<CodiceUfficio>0001</CodiceUfficio>
			<CodiceEnte>SPSPAGOPA</CodiceEnte>
		</inps:Identity>
	</soapenv:Header>
	<soapenv:Body>
		<con:ConsultazioneSogliaIndicatore>
			<con:request CodiceFiscale="MXABKP55H18F205I" CodiceSoglia="BVAC01"
			   FornituraNucleo="SI" DataValidita="2020-05-05"/>
		</con:ConsultazioneSogliaIndicatore>
	</soapenv:Body>
</soapenv:Envelope>' http://localhost:3/webservices/inps/SvcConsultazione/
```

output:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Header><KD4SoapHeaderV2 xmlns="http://www.ibm.com/KD4Soap">xxxx==</KD4SoapHeaderV2></s:Header><s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><ConsultazioneSogliaIndicatoreResponse xmlns="http://inps.it/ConsultazioneISEE"><ConsultazioneSogliaIndicatoreResult><IdRichiesta>36</IdRichiesta><Esito>OK</Esito><DatiIndicatore TipoIndicatore="ISEE Ordinario" SottoSoglia="SI" ProtocolloDSU="INPS-ISEE-2020-00000032P-00" DataPresentazioneDSU="2020-01-23" PresenzaDifformita="NO"><Componente CodiceFiscale="MXABKP55H18F205I" Cognome="MXA" Nome="BKP"/><Componente CodiceFiscale="HHZPLL55T10H501B" Cognome="HHZ" Nome="PLL"/></DatiIndicatore></ConsultazioneSogliaIndicatoreResult></ConsultazioneSogliaIndicatoreResponse></s:Body></s:Envelope>
```
