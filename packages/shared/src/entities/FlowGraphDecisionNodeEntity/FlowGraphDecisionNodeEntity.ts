/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import type {
  GraphDecisionNode,
  GraphDecisionNodeData,
} from "../FlowGraphEntity/types/flowGraph";
import { DEFAULT_DECISION_RULE_STATEMENT } from "../FlowGraphEntity/utils/graph";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface FlowGraphDecisionNodeEntity extends GraphDecisionNode {}

class FlowGraphDecisionNodeEntity {
  constructor(
    graphDecisionNode: GraphDecisionNode,
    onRulesChanged?: () => void,
  ) {
    Object.assign(this, graphDecisionNode);
    if (onRulesChanged) {
      this.onRulesChanged = onRulesChanged;
    }
  }

  addRule() {
    const rule = {
      conditionId: crypto.randomUUID(),
      statement: DEFAULT_DECISION_RULE_STATEMENT,
    };

    this.data.rules.push(rule);
    this.onRulesChanged();

    return rule;
  }

  editRule(
    ruleConditionId: string,
    ruleData: Partial<GraphDecisionNodeData["rules"][number]>,
  ) {
    this.data.rules = this.data.rules.map((rule) => {
      if (ruleConditionId !== rule.conditionId) {
        return rule;
      }

      return {
        ...rule,
        ...ruleData,
      };
    });
    this.onRulesChanged();
  }

  moveRule(ruleConditionId: string, direction: "down" | "up") {
    const currentIndex = this.data.rules.findIndex(
      (rule) => rule.conditionId === ruleConditionId,
    );

    if (currentIndex === -1) {
      return;
    }

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= this.data.rules.length) {
      return;
    }

    const reorderedRules = [...this.data.rules];
    const [movedRule] = reorderedRules.splice(currentIndex, 1);
    reorderedRules.splice(targetIndex, 0, movedRule);
    this.data.rules = reorderedRules;
    this.onRulesChanged();
  }

  onRulesChanged: () => void = () => {};

  removeRule(ruleConditionId: string) {
    this.data.rules = this.data.rules.filter(
      (rule) => rule.conditionId !== ruleConditionId,
    );
    this.onRulesChanged();
  }
}

export default FlowGraphDecisionNodeEntity;
