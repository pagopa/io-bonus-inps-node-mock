import { FiscalCode } from "italia-ts-commons/lib/strings";
import { ADE_RESPONSES } from "./ade";
import { INPS_RESPONSES } from "./inps";

import * as t from "io-ts";
import { readableReport } from "italia-ts-commons/lib/reporters";

const zeroPad = (num: number, places: number) => {
  const zero = places - num.toString().length + 1;
  // tslint:disable-next-line: restrict-plus-operands
  return Array(+(zero > 0 && zero)).join("0") + num;
};

export const FiscalCodeParams = t.type({
  adeResponse: t.keyof(ADE_RESPONSES),
  adeTimeout: t.Integer,
  inpsResponse: t.keyof(INPS_RESPONSES),
  inpsTimeout: t.Integer
});
export type FiscalCodeParams = t.TypeOf<typeof FiscalCodeParams>;

export const makeFiscalCode = ({
  adeResponse,
  inpsResponse,
  adeTimeout,
  inpsTimeout
}: FiscalCodeParams): FiscalCode => {
  return FiscalCode.decode(
    `${adeResponse}${inpsResponse}XYYY${zeroPad(adeTimeout, 2)}R16F9${zeroPad(
      inpsTimeout,
      2
    )}K`
  ).getOrElseL(() => {
    throw new Error("cannot create fiscal code");
  });
};

export const parseFiscalCode = (fiscalCode: FiscalCode): FiscalCodeParams => {
  return FiscalCodeParams.decode({
    adeResponse: fiscalCode[0],
    adeTimeout: parseInt(fiscalCode.slice(6, 8), 10),
    inpsResponse: fiscalCode[1],
    inpsTimeout: parseInt(fiscalCode.slice(13, 15), 10)
  } as FiscalCodeParams).getOrElseL(errs => {
    throw new Error(`unable to parse fiscal code ${readableReport(errs)}`);
  });
};

export const getFamilyMembersForFiscalCode = (
  fiscalCode: FiscalCode
): ReadonlyArray<FiscalCode> => {
  return [
    fiscalCode,
    fiscalCode.replace("YYY", "TTT") as FiscalCode,
    fiscalCode.replace("YYY", "PPP") as FiscalCode
  ];
};
