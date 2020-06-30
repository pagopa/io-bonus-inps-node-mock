import * as crypto from "crypto";
import { FiscalCode } from "italia-ts-commons/lib/strings";

/**
 * Replicate the behavior of https://github.com/pagopa/io-functions-bonus/blob/3f67ba697704530f336d0408c8665183333e3395/utils/hash.ts#L23
 * @param familyMembers a set of family members as returned from bonus activation api
 *
 * @returns a string which is the FamilyUID as it would be calculate on io-functions-bonus
 */
export const generateFamilyUID = (
  // tslint:disable-next-line: variable-name
  family_members: ReadonlyArray<FiscalCode>
): string => {
  const plain = Array.from(family_members)
    .sort((a, b) => a.localeCompare(b))
    .join("");
  return crypto
    .createHash("sha256")
    .update(plain)
    .digest("hex");
};
