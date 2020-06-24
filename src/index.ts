import { constVoid } from "fp-ts/lib/function";
import { initExpressServer } from "./server";

// tslint:disable-next-line: no-any no-console
initExpressServer(constVoid as any, constVoid as any).catch(console.error);
