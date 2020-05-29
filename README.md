# io-bonusvacanze-inps-node-mock
A mock implementation of the INPS soap service 

##  Usage
```sh
yarn install
yarn build
yarn start
```

## Environment
name|description|default
-|-|-
WINSTON_LOG_LEVEL|desired log level|"debug"
HOST|host this server listens to|"http://localhost"
PORT|host this server listens to|3000


## Example request
```sh
curl -d '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:con="http://inps.it/ConsultazioneISEE">
	<soapenv:Header/>
	<soapenv:Body>
		<con:ConsultazioneSogliaIndicatore DataValidita="2020-05-21" CodiceFiscale="VRDGPP83R10B293I" FornituraNucleo="SI" CodiceSoglia="BVAC01"/>
	</soapenv:Body>
</soapenv:Envelope>' http://localhost:3000/webservices/inps/SvcConsultazione/ 
```

output:
```xml 
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"  xmlns:tns="http://inps.it/ConsultazioneISEE" xmlns:msc="http://schemas.microsoft.com/ws/2005/12/wsdl/contract" xmlns:i0="http://tempuri.org/" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
    <soap:Body>
        <con:ConsultazioneSogliaIndicatoreResponse>
            <con:IdRichiesta>12345678</con:IdRichiesta>
            <con:Esito>OK</con:Esito>
            <con:ConsultazioneSogliaIndicatoreResult ProtocolloDSU="INPS-ISEE-0000-00000000A-00" SottoSoglia="SI" TipoIndicatore="ISEE Ordinario" DataPresentazioneDSU="2020-05-01" PresenzaDifformita="NO">
                <con:Componente Nome="GIUSEPPE" Cognome="GARIBALDI" CodiceFiscale="VRDGPP83R10B293I"/>
                <con:Componente Nome="ENZO" Cognome="FERRARI" CodiceFiscale="FRRNZE98B18F257D"/>
            </con:ConsultazioneSogliaIndicatoreResult>
        </con:ConsultazioneSogliaIndicatoreResponse>
    </soap:Body>
</soap:Envelope>
```