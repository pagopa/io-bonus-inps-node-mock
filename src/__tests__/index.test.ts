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

import {
  After,
  And,
  Before,
  Fusion,
  Given,
  Then,
  When
} from "jest-cucumber-fusion";

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
beforeEach(() => {
  jest.resetAllMocks();
});

// tslint:disable-next-line: no-let one-variable-per-declaration
let fiscalCode: FiscalCode, testingSession: ITestingSession;
// tslint:disable-next-line: no-let
let familyMembers: ReturnType<typeof getFamilyMembersForFiscalCode>;
// tslint:disable-next-line: no-let
let res: any;
// tslint:disable-next-line: no-let
let bonusId: string;

const anyMessage = {
  markdown: expect.any(String),
  recipientFiscalCode: expect.any(String),
  subject: expect.any(String)
};

Before(() => {
  testingSession = createTestingSession(db);
});

After(async () => {
  await testingSession.cleanData().then(printCleanReport);
});

Given("a citizen with an ineligible dsu", () => {
  fiscalCode = makeFiscalCode({
    adeResponse: "bonusWillBeActivated",
    adeTimeout: 0,
    inpsResponse: "isIneligible",
    inpsTimeout: 0
  });
  familyMembers = getFamilyMembersForFiscalCode(fiscalCode);

  testingSession.registerFiscalCode(fiscalCode);
  testingSession.registerFamilyUID(generateFamilyUID(familyMembers));
});

Given("a citizen with an eligible dsu", () => {
  fiscalCode = makeFiscalCode({
    adeResponse: "bonusWillBeActivated",
    adeTimeout: 0,
    inpsResponse: "isEligible",
    inpsTimeout: 0
  });
  familyMembers = getFamilyMembersForFiscalCode(fiscalCode);

  testingSession.registerFiscalCode(fiscalCode);
  testingSession.registerFamilyUID(generateFamilyUID(familyMembers));
});

When("she starts an eligibility check", async () => {
  res = await fetch(`${API_URL}/bonus/vacanze/eligibility/${fiscalCode}`, {
    method: "POST"
  });
});

Then("the service return success", async () => {
  expect(res.status).toEqual(201);
  expect(await res.json()).toMatchObject({
    id: fiscalCode
  });
});

And("she receives a message", async () => {
  // wait for message to be sent
  await waitForExpect(() => {
    expect(processServiceSendMessageRequest).toHaveBeenCalledTimes(1);
  });

  expect(processServiceSendMessageRequest).toHaveBeenCalledWith({
    ...anyMessage,
    recipientFiscalCode: fiscalCode
  });
});

And(/^the message body contains "(.+)"$/, text => {
  expect(processServiceSendMessageRequest).toHaveBeenCalledWith({
    ...anyMessage,
    markdown: expect.stringContaining(text as string)
  });
});

And(/^the message subject contains "(.+)"$/, text => {
  expect(processServiceSendMessageRequest).toHaveBeenCalledWith({
    ...anyMessage,
    markdown: expect.stringContaining(text as string)
  });
});

And(
  /^the eligibility check result is available with status "(.*)"$/,
  async expectedStatus => {
    await waitForExpect(async () => {
      const checkRes = await fetch(
        `${API_URL}/bonus/vacanze/eligibility/${fiscalCode}`,
        {
          method: "GET"
        }
      );
      const { status } = await checkRes.json();
      expect(status).toBe(expectedStatus);
    });
  }
);

And("she starts the bonus activation procedure", async () => {
  await sleep(10000);
  // this is needed because we don't have beforeEach
  processServiceSendMessageRequest.mockReset();

  res = await fetch(`${API_URL}/bonus/vacanze/activations/${fiscalCode}`, {
    method: "POST"
  });
});

Then("the bonus activation service returns success", async () => {
  expect(res.status).toEqual(201);
  const createdBonusActivation = await res.json();
  expect(createdBonusActivation).toMatchObject({
    id: expect.any(String)
  });

  bonusId = createdBonusActivation.id;
  testingSession.registerBonus(bonusId);
});

And("every family member receives a message", async () => {
  await waitForExpect(() => {
    expect(processServiceSendMessageRequest).toHaveBeenCalledTimes(
      familyMembers.length
    );
  });

  // each family member gets her message
  familyMembers.forEach(memberFiscalCode => {
    // the test passes if at least one of the sent messages
    // has been sent to the currente family member
    expect(processServiceSendMessageRequest).toHaveBeenCalledWith({
      markdown: expect.any(String),
      recipientFiscalCode: memberFiscalCode,
      subject: expect.any(String)
    });
  });
});

And(/^the bonus is available with status "(.*)"$/, async expectedStatus => {
  await waitForExpect(async () => {
    const checkRes = await fetch(
      `${API_URL}/bonus/vacanze/activations/${bonusId}`,
      {
        method: "GET"
      }
    );
    const { status } = await checkRes.json();
    expect(status).toBe(expectedStatus);
  });
});

Fusion("./scenarios/bonus-vacanze.feature");

