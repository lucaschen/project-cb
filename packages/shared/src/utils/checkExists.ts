import { assert } from "ts-essentials";

const checkExists = <Type>(maybeExists: Type | null | undefined) => {
  assert(maybeExists != null);

  return maybeExists;
};

export default checkExists;
