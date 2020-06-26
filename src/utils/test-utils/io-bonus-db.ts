// tslint:disable: no-identical-functions

import * as DocumentDb from "documentdb";

// TODO: handle env variable properly
const cosmosDbUri = process.env.COSMOSDB_BONUS_URI || "https://cosmosuri/";
const cosmosDbName = process.env.COSMOSDB_BONUS_DATABASE_NAME || "dbname";
const masterKey = process.env.COSMOSDB_BONUS_KEY || "base64Key";

const documentClient = new DocumentDb.DocumentClient(
  cosmosDbUri,
  {
    masterKey
  },
  undefined,
  "Strong"
);

const deleteDocument = (
  documentUri: string,
  partitionKey: string
): Promise<void> =>
  new Promise((resolve, reject) => {
    documentClient.deleteDocument(documentUri, { partitionKey }, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

export const deleteEligibilityCheck = (fiscalCode: string): Promise<void> =>
  deleteDocument(
    DocumentDb.UriFactory.createDocumentUri(
      cosmosDbName,
      "eligibility-checks",
      fiscalCode
    ),
    fiscalCode
  );

export const deleteBonusActivation = (bonusId: string): Promise<void> =>
  deleteDocument(
    DocumentDb.UriFactory.createDocumentUri(
      cosmosDbName,
      "bonus-activations",
      bonusId
    ),
    bonusId
  );

export const deleteUserBonus = async (bonusId: string): Promise<void> =>
  deleteDocument(
    DocumentDb.UriFactory.createDocumentUri(
      cosmosDbName,
      "user-bonuses",
      bonusId
    ),
    bonusId
  );

export const deleteBonusProcessing = async (bonusId: string): Promise<void> =>
  deleteDocument(
    DocumentDb.UriFactory.createDocumentUri(
      cosmosDbName,
      "user-bonuses",
      bonusId
    ),
    bonusId
  );

export const deleteBonusLease = async (bonusId: string): Promise<void> => {};
