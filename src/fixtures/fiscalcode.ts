import { FiscalCode } from "italia-ts-commons/lib/strings";
import { ADE_RESPONSES } from "./ade";
import { INPS_RESPONSES } from "./inps";

import * as t from "io-ts";
import { readableReport } from "italia-ts-commons/lib/reporters";

const assertNever = (e: never) => {
  throw new Error("assertNever");
};

const zeroPad = (num: number, places: number) => {
  const zero = places - num.toString().length + 1;
  // tslint:disable-next-line: restrict-plus-operands
  return Array(+(zero > 0 && zero)).join("0") + num;
};

type FiscalCodeInpsLetter = "A" | "B" | "C" | "D" | "E";

const inpsResponseToFiscalCodeLetter = (
  responseKind: keyof typeof INPS_RESPONSES
): FiscalCodeInpsLetter => {
  switch (responseKind) {
    case "isEligible":
      return "A";
    case "hasEligibilityFailure":
      return "B";
    case "isEligibleWithDiscrepancies":
      return "C";
    case "isIneligible":
      return "D";
    case "hasEligibilityError":
      return "E";
    default:
      return assertNever(responseKind);
  }
};

const inpsResponseFromFiscalCodeLetter = (
  letter: FiscalCodeInpsLetter
): keyof typeof INPS_RESPONSES => {
  switch (letter) {
    case "A":
      return "isEligible";
    case "B":
      return "hasEligibilityFailure";
    case "C":
      return "isEligibleWithDiscrepancies";
    case "D":
      return "isIneligible";
    case "E":
      return "hasEligibilityError";
    default:
      return assertNever(letter);
  }
};

type FiscalCodeAdeLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

const adeResponseToFiscalCodeLetter = (
  responseKind: keyof typeof ADE_RESPONSES
): FiscalCodeAdeLetter => {
  switch (responseKind) {
    case "bonusWillBeActivated":
      return "A";
    case "bonusActivationWillFailWithCode1000":
      return "B";
    case "bonusActivationWillFailWithCode1005":
      return "C";
    case "bonusActivationWillFailWithCode900":
      return "D";
    case "bonusActivationWillFailWithCode907":
      return "E";
    case "bonusActivationWillFailWithCode908":
      return "F";
    case "bonusActivationWillFailWithCode3000AndRetries":
      return "G";
    case "bonusActivationWillFailWithCode4000AndRetries":
      return "H";
    default:
      return assertNever(responseKind);
  }
};

const adeResponseFromFiscalCodeLetter = (
  letter: FiscalCodeAdeLetter
): keyof typeof ADE_RESPONSES => {
  switch (letter) {
    case "A":
      return "bonusWillBeActivated";
    case "B":
      return "bonusActivationWillFailWithCode1000";
    case "C":
      return "bonusActivationWillFailWithCode1005";
    case "D":
      return "bonusActivationWillFailWithCode900";
    case "E":
      return "bonusActivationWillFailWithCode907";
    case "F":
      return "bonusActivationWillFailWithCode908";
    case "G":
      return "bonusActivationWillFailWithCode3000AndRetries";
    case "H":
      return "bonusActivationWillFailWithCode4000AndRetries";
    default:
      return assertNever(letter);
  }
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
  const firstLetter = adeResponseToFiscalCodeLetter(adeResponse);
  const secondLetter = inpsResponseToFiscalCodeLetter(inpsResponse);
  return FiscalCode.decode(
    `${firstLetter}${secondLetter}XYYY${zeroPad(adeTimeout, 2)}R16F9${zeroPad(
      inpsTimeout,
      2
    )}K`
  ).getOrElseL(() => {
    throw new Error("cannot create fiscal code");
  });
};

export const parseFiscalCode = (fiscalCode: FiscalCode): FiscalCodeParams => {
  const firstLetter = fiscalCode[0] as FiscalCodeAdeLetter;
  const secondLetter = fiscalCode[1] as FiscalCodeInpsLetter;
  return FiscalCodeParams.decode({
    adeResponse: adeResponseFromFiscalCodeLetter(firstLetter),
    adeTimeout: parseInt(fiscalCode.slice(6, 8), 10),
    inpsResponse: inpsResponseFromFiscalCodeLetter(secondLetter),
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

export const extractFiscalCode = (content: string): string | undefined => {
  const rx = /([A-Z0-9]{16})(.*)/g;
  const arr = rx.exec(content);
  return arr ? arr[1] : undefined;
};
