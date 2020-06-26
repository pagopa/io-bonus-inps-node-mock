import { createTestingSession } from "../cleanup";

const dryRun = true;
describe("createTestingSession", () => {
  it("should clean nothing", async () => {
    const testingSession = createTestingSession();

    const result = await testingSession.cleanData(dryRun);

    expect(result).toHaveLength(0);
  });

  it("should perform cleanup on provided fiscal code", async () => {
    const fiscalCode = "AAABBB80A01C123D";

    const testingSession = createTestingSession();
    testingSession.registerFiscalCode(fiscalCode);

    const result = await testingSession.cleanData(dryRun);

    expect(result.length).toBeGreaterThan(0);

    result.forEach(([log, out]) => {
      expect(log).toEqual(expect.stringContaining(fiscalCode));
      expect(out).toBe(true);
    });
  });

  it("should perform cleanup on provided bonus code", async () => {
    const bonus = "XXXXX1234YY";

    const testingSession = createTestingSession();
    testingSession.registerBonus(bonus);

    const result = await testingSession.cleanData(dryRun);

    expect(result.length).toBeGreaterThan(0);

    result.forEach(([log, out]) => {
      expect(log).toEqual(expect.stringContaining(bonus));
      expect(out).toBe(true);
    });
  });
});
