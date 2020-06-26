import { BonusDocumentDbClient } from "./io-bonus-db";

const cleanUpDb = async ({
  dbClient,
  fiscalCodes,
  bonuses,
  dryRun
}: {
  dbClient: BonusDocumentDbClient;
  fiscalCodes: readonly string[];
  bonuses: readonly string[];
  dryRun: boolean;
}): Promise<ReadonlyArray<readonly [string, boolean]>> => {
  const executeOrDryRun = async (
    fn: () => Promise<void>,
    label: string
  ): Promise<readonly [string, boolean]> => {
    if (dryRun) {
      return [label, true];
    }
    return fn()
      .then(_ => true)
      .catch(_ => false)
      .then(result => [label, result]);
  };

  const operations: ReadonlyArray<Promise<readonly [string, boolean]>> = [
    // eligibility checks
    ...fiscalCodes.map(fiscalCode =>
      executeOrDryRun(
        () => dbClient.deleteEligibilityCheck(fiscalCode),
        `DELETE EligibilityCheck for ${fiscalCode}`
      )
    ),
    // bonus activation
    ...bonuses.map(bonus =>
      executeOrDryRun(
        () => dbClient.deleteBonusActivation(bonus),
        `DELETE BonusActivation for ${bonus}`
      )
    ),
    // user bonus
    ...bonuses.map(bonus =>
      executeOrDryRun(
        () => dbClient.deleteUserBonus(bonus),
        `DELETE UserBonus for ${bonus}`
      )
    ),
    // bonus processing
    ...bonuses.map(bonus =>
      executeOrDryRun(
        () => dbClient.deleteBonusProcessing(bonus),
        `DELETE BonusProcessing for ${bonus}`
      )
    )
    // TODO: bonus lease
  ];

  return Promise.all(operations);
};

export interface ITestingSession {
  cleanData: (
    // tslint:disable-next-line: bool-param-default
    dryRun?: boolean
  ) => Promise<ReadonlyArray<readonly [string, boolean]>>;
  registerFiscalCode: (fiscalCode: string) => void;
  registerBonus: (bonus: string) => void;
}

export const createTestingSession = (
  dbClient: BonusDocumentDbClient
): ITestingSession => {
  const data = {
    bonuses: new Set<string>(),
    fiscalCodes: new Set<string>()
  };

  return {
    async cleanData(
      dryRun = false
    ): Promise<ReadonlyArray<readonly [string, boolean]>> {
      const result = await cleanUpDb({
        bonuses: [...data.bonuses],
        dbClient,
        dryRun,
        fiscalCodes: [...data.fiscalCodes]
      });
      data.bonuses.clear();
      data.fiscalCodes.clear();
      return result;
    },
    registerFiscalCode(fiscalCode: string): void {
      data.fiscalCodes.add(fiscalCode);
    },
    registerBonus(bonus: string): void {
      data.bonuses.add(bonus);
    }
  };
};
