import {
  deleteBonusActivation,
  deleteBonusProcessing,
  deleteEligibilityCheck,
  deleteUserBonus
} from "./io-bonus-db";

const cleanUpDb = async ({
  fiscalCodes,
  bonuses,
  dryRun
}: {
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
        () => deleteEligibilityCheck(fiscalCode),
        `DELETE EligibilityCheck for ${fiscalCode}`
      )
    ),
    // bonus activation
    ...bonuses.map(bonus =>
      executeOrDryRun(
        () => deleteBonusActivation(bonus),
        `DELETE BonusActivation for ${bonus}`
      )
    ),
    // user bonus
    ...bonuses.map(bonus =>
      executeOrDryRun(
        () => deleteUserBonus(bonus),
        `DELETE UserBonus for ${bonus}`
      )
    ),
    // bonus processing
    ...bonuses.map(bonus =>
      executeOrDryRun(
        () => deleteBonusProcessing(bonus),
        `DELETE BonusProcessing for ${bonus}`
      )
    )
    // TODO: bonus lease
  ];

  return Promise.all(operations);
};

const TestingSession = () => {
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

export const createTestingSession = () => TestingSession();
