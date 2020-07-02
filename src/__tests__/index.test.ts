// tslint:disable: no-identical-functions

import * as http from "http";
import { FiscalCode } from "italia-ts-commons/lib/strings";
import fetch from "node-fetch";
import waitForExpect from "wait-for-expect";
import {
  processAdeRequest,
  processAdeResponse,
  processInpsRequest,
  processInpsResponse,
  processServiceGetProfileRequest,
  processServiceGetProfileResponse,
  processServiceSendMessageRequest,
  processServiceSendMessageResponse
} from "../__mocks__/mocks";
import {
  getFamilyMembersForFiscalCode,
  makeFiscalCode
} from "../fixtures/fiscalcode";
import { initExpressServer } from "../server";
import {
  createTestingSession,
  ITestingSession,
  printCleanReport
} from "../utils/test-utils/cleanup";
import { BonusDocumentDbClient } from "../utils/test-utils/io-bonus-db";
import { generateFamilyUID } from "../utils/test-utils/misc";

// tslint:disable-next-line: no-object-mutation
waitForExpect.defaults.timeout = 30000;
// tslint:disable-next-line: no-object-mutation
waitForExpect.defaults.interval = 50;

jest.setTimeout(40000);

const sleep = (ms: number) => new Promise(ok => setTimeout(ok, ms));

const API_URL = "http://localhost:7071/api/v1";

const db = new BonusDocumentDbClient({
  cosmosDbName: process.env.COSMOSDB_BONUS_DATABASE_NAME || "",
  cosmosDbUri: process.env.COSMOSDB_BONUS_URI || "",
  masterKey: process.env.COSMOSDB_BONUS_KEY
});

// tslint:disable-next-line: no-let
let server: http.Server;
beforeAll(async () => {
  server = await initExpressServer({
    processAdeRequest,
    processAdeResponse,
    processInpsRequest,
    processInpsResponse,
    processServiceGetProfileRequest,
    processServiceGetProfileResponse,
    processServiceSendMessageRequest,
    processServiceSendMessageResponse
  });
});

afterAll(async () => {
  await sleep(5000);
  server.close();
});
beforeEach(() => jest.resetAllMocks());

describe("Scenario: DSU is not eligible", () => {
  // tslint:disable-next-line: no-let one-variable-per-declaration
  let fiscalCode: FiscalCode, testingSession: ITestingSession;
  // tslint:disable-next-line: no-let
  let familyMembers: ReturnType<typeof getFamilyMembersForFiscalCode>;

  beforeAll(() => {
    testingSession = createTestingSession(db);
    fiscalCode = makeFiscalCode({
      adeResponse: "bonusWillBeActivated",
      adeTimeout: 0,
      inpsResponse: "isIneligible",
      inpsTimeout: 0
    });
    familyMembers = getFamilyMembersForFiscalCode(fiscalCode);
  });

  afterAll(async () => {
    await testingSession.cleanData().then(printCleanReport);
  });

  it("should not be sottosoglia", async () => {
    testingSession.registerFiscalCode(fiscalCode);
    testingSession.registerFamilyUID(generateFamilyUID(familyMembers));

    const res = await fetch(
      `${API_URL}/bonus/vacanze/eligibility/${fiscalCode}`,
      {
        method: "POST"
      }
    );
    expect(res.status).toEqual(201);
    expect(await res.json()).toMatchObject({
      id: fiscalCode
    });
    await waitForExpect(() => {
      expect(processInpsRequest).toHaveBeenCalledTimes(1);
      expect(processInpsResponse).toHaveBeenCalledWith(
        expect.stringContaining('SottoSoglia="NO"')
      );
    });
    await waitForExpect(() => {
      expect(processServiceSendMessageRequest).toHaveBeenCalledTimes(1);
      const {
        body: {
          content: { subject, markdown }
        },
        path
      } = processServiceSendMessageRequest.mock.calls[0][0];

      // sent to the correct user
      expect(path).toContain(fiscalCode);
      // sent the correct message
      expect(markdown).toContain("supera la soglia");
      expect(subject).toContain("completato le verifiche");
      // message sent
      const { statusCode } = processServiceSendMessageResponse.mock.calls[0][0];
      expect(statusCode).toBe(201);
    });
  });
});

describe("Scenario: DSU is eligible and ADE will approve", () => {
  // tslint:disable-next-line: no-let one-variable-per-declaration
  let fiscalCode: FiscalCode, testingSession: ITestingSession;
  // tslint:disable-next-line: no-let
  let familyMembers: ReturnType<typeof getFamilyMembersForFiscalCode>;

  beforeAll(() => {
    testingSession = createTestingSession(db);
    fiscalCode = makeFiscalCode({
      adeResponse: "bonusWillBeActivated",
      adeTimeout: 0,
      inpsResponse: "isEligible",
      inpsTimeout: 0
    });
    familyMembers = getFamilyMembersForFiscalCode(fiscalCode);
  });

  afterAll(async () => {
    await testingSession.cleanData().then(printCleanReport);
  });
  it("should be sottosoglia", async () => {
    testingSession.registerFiscalCode(fiscalCode);
    testingSession.registerFamilyUID(generateFamilyUID(familyMembers));

    const res = await fetch(
      `${API_URL}/bonus/vacanze/eligibility/${fiscalCode}`,
      {
        method: "POST"
      }
    );
    expect(res.status).toEqual(201);
    expect(await res.json()).toMatchObject({
      id: fiscalCode
    });
    await waitForExpect(() => {
      expect(processInpsRequest).toHaveBeenCalledTimes(1);
      expect(processInpsResponse).toHaveBeenCalledWith(
        expect.stringContaining('SottoSoglia="SI"')
      );
    });

    await waitForExpect(async () => {
      expect(processServiceSendMessageRequest).toHaveBeenCalledTimes(1);
      const {
        body: {
          content: { subject, markdown }
        },
        path
      } = processServiceSendMessageRequest.mock.calls[0][0];

      // sent to the correct user
      expect(path).toContain(fiscalCode);
      // sent the correct message
      expect(markdown).toContain("il tuo nucleo familiare ha diritto");
      expect(subject).toContain("completato le verifiche");
      // message sent
      const { statusCode } = processServiceSendMessageResponse.mock.calls[0][0];
      expect(statusCode).toBe(201);
    });
  });

  it("should succeed bonus activation", async () => {
    await sleep(10000);
    const res = await fetch(
      `${API_URL}/bonus/vacanze/activations/${fiscalCode}`,
      {
        method: "POST"
      }
    );
    expect(res.status).toEqual(201);
    const createdBonusActivation = await res.json();
    expect(createdBonusActivation).toMatchObject({
      id: expect.any(String)
    });

    testingSession.registerBonus(createdBonusActivation.id);

    await waitForExpect(() => {
      expect(processAdeRequest).toHaveBeenCalledTimes(1);
      expect(processAdeResponse).toHaveBeenCalledTimes(1);
    });
    await waitForExpect(() => {
      // one message per family member
      expect(processServiceSendMessageRequest).toHaveBeenCalledTimes(
        familyMembers.length
      );
      // each family member gets her message
      familyMembers.forEach(memberFiscalCode => {
        // the test passes if at least one of the sent messages
        // has been sent to the currente family member
        const allMessagePaths = processServiceSendMessageRequest.mock.calls
          .map(([{ path }]) => path)
          .join("|");
        expect(allMessagePaths).toContain(memberFiscalCode);
      });
    });
  });
});
