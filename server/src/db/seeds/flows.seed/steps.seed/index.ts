import { Models } from "~db/models";

import seedStep1 from "./step1.seed";
import seedStep2 from "./step2.seed";
import seedStep3 from "./step3.seed";
import seedStep4 from "./step4.seed";
import seedStep4Point5 from "./step4Point5.seed";
import seedStep5 from "./step5.seed";
import seedStep6 from "./step6.seed";
import seedStep7 from "./step7.seed";
import seedStep8A from "./step8A.seed";
import seedStep8B from "./step8B.seed";

export async function seedSteps(models: Models) {
  const s1 = await seedStep1(models);
  const s2 = await seedStep2(models);
  const s3 = await seedStep3(models);
  const s4 = await seedStep4(models);
  const s4p5 = await seedStep4Point5(models);
  const s5 = await seedStep5(models);
  const s6 = await seedStep6(models);
  const s7 = await seedStep7(models);
  const s8a = await seedStep8A(models);
  const s8b = await seedStep8B(models);

  return {
    step1: s1,
    step2: s2,
    step3: s3,
    step4: s4,
    step4Point5: s4p5,
    step5: s5,
    step6: s6,
    step7: s7,
    step8A: s8a,
    step8B: s8b,
  };
}
