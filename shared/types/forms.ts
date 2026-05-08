import type { ZodMiniType, output } from "zod/mini";

export const FORM_ERRORS_SYMBOL = Symbol("__FORM_ERRORS__");
export const CLEAN_ERROR_SYMBOL = Symbol("__CLEAN_ERROR__");
export const HAS_FORM_ERRORS_SYMBOL = Symbol("__HAS_FORM_ERRORS__");
export const HAS_FORM_SINGLE_ERROR_SYMBOL = Symbol("__HAS_FORM_SINGLE_ERROR__");

export type FormSubmitEvent<
  Schema extends ZodMiniType,
  Output extends output<Schema> = output<Schema>,
> = {
  data: Output;
};
