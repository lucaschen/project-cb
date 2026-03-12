import type { ZodType } from "zod";
import { z } from "zod";

export const enforceStrictSchema = <
  InputSchema extends ZodType,
  OutputSchema extends ZodType,
>({
  handler,
  inputSchema,
  outputSchema,
}: {
  handler: (requestBody: z.output<InputSchema>) => unknown;
  inputSchema: InputSchema;
  outputSchema: OutputSchema;
}) => {
  const schemaHandler = async (
    requestBody: z.input<InputSchema>,
  ): Promise<z.output<OutputSchema>> => {
    const inputValidationResult = inputSchema.safeParse(requestBody);

    if (!inputValidationResult.success) {
      throw inputValidationResult.error;
    }

    const results = await handler(inputValidationResult.data);

    const outputValidationResult = outputSchema.safeParse(results);

    if (!outputValidationResult.success) {
      throw outputValidationResult.error;
    }

    return outputValidationResult.data;
  };

  return schemaHandler;
};
