import { BonusDocumentDbClient } from "./io-bonus-db";

const cleanUpDb = async ({
  dbClient,
  familyUIDs,
  fiscalCodes,
  bonuses,
  dryRun
}: {
  dbClient: BonusDocumentDbClient;
  familyUIDs: readonly string[];
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
        `DELETE EligibilityCheck for ${fiscalCode} (dryRun=${dryRun})`
      )
    ),
    // bonus activation
    ...bonuses.map(bonus =>
      executeOrDryRun(
        () => dbClient.deleteBonusActivation(bonus),
        `DELETE BonusActivation for ${bonus} (dryRun=${dryRun})`
      )
    ),
    // user bonus
    ...bonuses.map(bonus =>
      executeOrDryRun(
        () => dbClient.deleteUserBonus(bonus),
        `DELETE UserBonus for ${bonus} (dryRun=${dryRun})`
      )
    ),
    // bonus processing
    ...bonuses.map(bonus =>
      executeOrDryRun(
        () => dbClient.deleteBonusProcessing(bonus),
        `DELETE BonusProcessing for ${bonus} (dryRun=${dryRun})`
      )
    ),
    // bonus lease
    ...familyUIDs.map(familyUID =>
      executeOrDryRun(
        () => dbClient.deleteBonusLease(familyUID),
        `DELETE BonusLease for ${familyUID} (dryRun=${dryRun})`
      )
    )
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
  registerFamilyUID: (familyUID: string) => void;
}

export const createTestingSession = (
  dbClient: BonusDocumentDbClient
): ITestingSession => {
  const data = {
    bonuses: new Set<string>(),
    familyUIDs: new Set<string>(),
    fiscalCodes: new Set<string>()
  };

  return {
    async cleanData(
      dryRun = false
    ): Promise<ReadonlyArray<readonly [string, boolean]>> {
      const cleanReport = await cleanUpDb({
        bonuses: [...data.bonuses],
        dbClient,
        dryRun,
        familyUIDs: [...data.familyUIDs],
        fiscalCodes: [...data.fiscalCodes]
      }).catch(err => {
        console.error("cleanup general failure", err);
        return [];
      });
      data.bonuses.clear();
      data.fiscalCodes.clear();
      data.familyUIDs.clear();
      return cleanReport;
    },
    registerFiscalCode(fiscalCode: string): void {
      data.fiscalCodes.add(fiscalCode);
    },
    registerBonus(bonus: string): void {
      data.bonuses.add(bonus);
    },
    registerFamilyUID(familyUID: string): void {
      data.familyUIDs.add(familyUID);
    }
  };
};
export const printCleanReport = (
  cleanReport: ReadonlyArray<readonly [string, boolean]>
) => {
  cleanReport.forEach(([log, result]) => {
    if (result) {
      console.log(`cleanup success ${log}`);
    } else {
      console.error(`cleanup failure ${log}`);
    }
  });
};
