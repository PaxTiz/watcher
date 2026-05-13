import { type ZodMiniType, z } from "zod/mini";

type ValidatorInput = {
  body?: ZodMiniType;
  query?: ZodMiniType;
  params?: ZodMiniType;
};
type Validator = Record<string, ValidatorInput>;

export const defineValidator = <V extends Validator>(validator: V) => validator;

type InferValidator<T extends ValidatorInput> = {
  [K in keyof T]: T[K] extends ZodMiniType ? z.infer<T[K]> : never;
};

export type InferValidators<T extends Validator> = {
  [K in keyof T]: InferValidator<T[K]>;
};
