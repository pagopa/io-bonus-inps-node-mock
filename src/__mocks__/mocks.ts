import * as t from "io-ts";
import { FiscalCode, NonEmptyString } from "italia-ts-commons/lib/strings";

export const processInpsRequest = jest.fn();
export const processInpsResponse = jest.fn();

export const processAdeRequest = jest.fn();
export const processAdeResponse = jest.fn();

export const processServiceGetProfileRequest = jest.fn();
export const processServiceGetProfileResponse = jest.fn();

export const processServiceSendMessageRequest = jest.fn();
export const processServiceSendMessageResponse = jest.fn();

// Define an envelop to pass parsed request data to mocks
// This is the result of a decode: it can be the struct itself or a string explaining what went wrong
export type IncomingRequestValue<T> = string | T;

// struct with all important data extracted from a request to ServiceSendMessage
export type SendMessageInput = t.TypeOf<typeof SendMessageInput>;
export const SendMessageInput = t.interface({
  markdown: NonEmptyString,
  recipientFiscalCode: FiscalCode,
  subject: NonEmptyString
});
