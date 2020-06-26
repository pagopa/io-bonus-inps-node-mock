import * as DocumentDb from "documentdb";

export interface IDbConfig {
  cosmosDbUri: string;
  cosmosDbName: string;
  masterKey?: string;
}

export class BonusDocumentDbClient {
  private documentClient: DocumentDb.DocumentClient;
  private cosmosDbName: string;
  constructor({ cosmosDbUri, cosmosDbName, masterKey }: IDbConfig) {
    if (!cosmosDbUri) {
      throw new Error(`cosmosDbUri cannot be empty`);
    }
    if (!cosmosDbName) {
      throw new Error(`cosmosDbName cannot be empty`);
    }

    this.cosmosDbName = cosmosDbName;
    this.documentClient = new DocumentDb.DocumentClient(
      cosmosDbUri,
      {
        masterKey
      },
      undefined,
      "Strong"
    );
  }

  public deleteEligibilityCheck(fiscalCode: string): Promise<void> {
    return this.deleteDocument("eligibility-checks", fiscalCode);
  }

  public deleteBonusActivation(bonusId: string): Promise<void> {
    return this.deleteDocument("bonus-activations", bonusId);
  }

  public deleteUserBonus(bonusId: string): Promise<void> {
    return this.deleteDocument("user-bonuses", bonusId);
  }

  public deleteBonusProcessing(bonusId: string): Promise<void> {
    return this.deleteDocument("bonus-processing", bonusId);
  }

  private deleteDocument(
    collectionName: string,
    documentId: string,
    partitionKey: string = documentId
  ): Promise<void> {
    const documentUri = DocumentDb.UriFactory.createDocumentUri(
      this.cosmosDbName,
      collectionName,
      documentId
    );
    return new Promise((resolve, reject) => {
      this.documentClient.deleteDocument(documentUri, { partitionKey }, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
