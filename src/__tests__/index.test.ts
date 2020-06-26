// tslint:disable: no-identical-functions

import * as http from "http";
import fetch from "node-fetch";
import waitForExpect from "wait-for-expect";
import { makeFiscalCode } from "../fixtures/fiscalcode";
import { initExpressServer } from "../server";
import { createTestingSession } from "../utils/test-utils/cleanup";

// tslint:disable-next-line: no-object-mutation
waitForExpect.defaults.timeout = 30000;
// tslint:disable-next-line: no-object-mutation
waitForExpect.defaults.interval = 50;

jest.setTimeout(40000);

const responseMock = jest.fn();
const requestMock = jest.fn();

const API_URL = "http://localhost:7071/api/v1";

// tslint:disable-next-line: no-let
let server: http.Server;
const testingSession = createTestingSession();

beforeAll(async () => {
  server = await initExpressServer(requestMock, responseMock);
});

afterAll(async () => {
  server.close();
  const cleanedData = await testingSession.cleanData().catch(err => {
    console.error('cleanup general failure', err);
    return [];
  });
  cleanedData.forEach(([log, result]) => {
    if (result) {
      console.log(`cleanup success ${log}`);
    } else {
      console.error(`cleanup failure ${log}`);
    }
  });
});
afterEach(() => jest.resetAllMocks());

describe("init", () => {
  it("should be sottosoglia", async () => {
    const fiscalCode = makeFiscalCode({
      adeResponse: "A",
      adeTimeout: 0,
      inpsResponse: "A",
      inpsTimeout: 0
    });
    testingSession.registerFiscalCode(fiscalCode);

    const res = await fetch(
      `${API_URL}/bonus/vacanze/eligibility/${fiscalCode}`,
      {
        method: "POST"
      }
    );
    expect(res.status).toEqual(201);
    expect(await res.json()).toMatchObject({ id: fiscalCode });
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

  it("should not be sottosoglia", async () => {
    const fiscalCode = makeFiscalCode({
      adeResponse: "A",
      adeTimeout: 0,
      inpsResponse: "D",
      inpsTimeout: 0
    });
    testingSession.registerFiscalCode(fiscalCode);

    const res = await fetch(
      `${API_URL}/bonus/vacanze/eligibility/${fiscalCode}`,
      {
        method: "POST"
      }
    );
    expect(res.status).toEqual(201);
    expect(await res.json()).toMatchObject({ id: fiscalCode });
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

  it("should succeed bonus activation", async () => {
    const fiscalCode = makeFiscalCode({
      adeResponse: "A",
      adeTimeout: 0,
      inpsResponse: "A",
      inpsTimeout: 0
    });
    testingSession.registerFiscalCode(fiscalCode);

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
