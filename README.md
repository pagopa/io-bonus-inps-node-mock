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
        <con:ConsultazioneSogliaIndicatoreRequest>
            <con:Richiesta DataValidita="2020-05-21" CodiceFiscale="VRDGPP83R10B293I" FornituraNucleo="SI" CodiceSoglia="BVAC01"/>
        </con:ConsultazioneSogliaIndicatoreRequest>
    </soapenv:Body>
</soapenv:Envelope>' http://localhost:3000/webservices/inps/SvcConsultazione/ 

# output: 
# <?xml version="1.0" encoding="utf-8"?>
# <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"  xmlns:tns="http://inps.it/ConsultazioneISEE" xmlns:msc="http://schemas.microsoft.com/ws/2005/12/wsdl/contract" xmlns:i0="http://tempuri.org/" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
#     <soap:Body>
#        <tns:ConsultazioneSogliaIndicatoreResponse>
#            <tns:ConsultazioneSogliaIndicatoreResult ProtocolloDSU="INPS-ISEE-0000-00000000A-00" SottoSoglia="SI" TipoIndicatore="ISEE Standard" DataPresentazioneDSU="2020-05-01">
#                <tns:Componente Nome="GIUSEPPE" Cognome="GARIBALDI" CodiceFiscale="VRDGPP83R10B293I"/>
#                <tns:Componente Nome="ENZO" Cognome="FERRARI" CodiceFiscale="FRRNZE98B18F257D"/>
#            </tns:ConsultazioneSogliaIndicatoreResult>
#        </tns:ConsultazioneSogliaIndicatoreResponse>
#    </soap:Body>
# </soap:Envelope>
```