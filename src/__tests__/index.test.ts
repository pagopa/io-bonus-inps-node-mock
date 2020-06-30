// tslint:disable: no-identical-functions

import * as http from "http";
import { FiscalCode } from "italia-ts-commons/lib/strings";
import fetch from "node-fetch";
import waitForExpect from "wait-for-expect";
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

const responseMock = jest.fn();
const requestMock = jest.fn();

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
  server = await initExpressServer(requestMock, responseMock);
});

afterAll(async () => {
  await sleep(5000);
  server.close();
});
beforeEach(() => jest.resetAllMocks());

describe("Scenario: DSU is not eligible", () => {
  // tslint:disable-next-line: no-let one-variable-per-declaration
  let fiscalCode: FiscalCode, testingSession: ITestingSession;

  beforeAll(() => {
    testingSession = createTestingSession(db);
    fiscalCode = makeFiscalCode({
      adeResponse: "A",
      adeTimeout: 0,
      inpsResponse: "D",
      inpsTimeout: 0
    });
  });

  afterAll(async () => {
    await testingSession.cleanData().then(printCleanReport);
  });

  it("should not be sottosoglia", async () => {
    testingSession.registerFiscalCode(fiscalCode);
    testingSession.registerFamilyUID(
      generateFamilyUID(getFamilyMembersForFiscalCode(fiscalCode))
    );

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
      expect(requestMock).toHaveBeenCalledTimes(1);
      expect(responseMock).toHaveBeenCalledWith(
        expect.stringContaining('SottoSoglia="NO"')
      );
    });
    await waitForExpect(() => {
      expect(requestMock).toHaveBeenCalledTimes(2);
      const req = requestMock.mock.calls[1][0];
      expect(JSON.stringify(req.body)).toContain("supera la soglia");
    });
    expect(true).toBeTruthy();
  });
});

describe("Scenario: DSU is eligible and ADE will approve", () => {
  // tslint:disable-next-line: no-let one-variable-per-declaration
  let fiscalCode: FiscalCode, testingSession: ITestingSession;

  beforeAll(() => {
    testingSession = createTestingSession(db);
    fiscalCode = makeFiscalCode({
      adeResponse: "A",
      adeTimeout: 0,
      inpsResponse: "A",
      inpsTimeout: 0
    });
  });

  afterAll(async () => {
    await testingSession.cleanData().then(printCleanReport);
  });
  it("should be sottosoglia", async () => {
    testingSession.registerFiscalCode(fiscalCode);
    testingSession.registerFamilyUID(
      generateFamilyUID(getFamilyMembersForFiscalCode(fiscalCode))
    );

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
      expect(requestMock).toHaveBeenCalledTimes(1);
      expect(responseMock).toHaveBeenCalledWith(
        expect.stringContaining('SottoSoglia="SI"')
      );
    });
    await waitForExpect(() => {
      expect(requestMock).toHaveBeenCalledTimes(2);
      const req = requestMock.mock.calls[1][0];
      expect(JSON.stringify(req.body)).toContain(
        "il tuo nucleo familiare ha diritto al Bonus Vacanze"
      );
    });
    expect(true).toBeTruthy();
  });

  it("should succeed bonus activation", async () => {
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
      expect(requestMock).toHaveBeenCalledTimes(1);
      expect(responseMock).toHaveBeenCalledWith(
        expect.stringContaining("foobar")
      );
    });
    await waitForExpect(() => {
      expect(requestMock).toHaveBeenCalledTimes(2);
      const req = requestMock.mock.calls[1][0];
      expect(JSON.stringify(req.body)).toContain("foobar");
    });
    expect(true).toBeTruthy();
  });
});
