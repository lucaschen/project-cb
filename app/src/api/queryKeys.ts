export const queryKeys = {
  currentUserOrganizations: ["current-user", "organizations"] as const,
  flow: (flowId: string) => ["flows", flowId] as const,
  flowStepElements: (flowId: string, stepId: string) =>
    ["flows", flowId, "steps", stepId, "elements"] as const,
  organizationElementDefinitions: (organizationId: string) =>
    ["organizations", organizationId, "element-definitions"] as const,
  organizationFlows: (organizationId: string) =>
    ["organizations", organizationId, "flows"] as const,
  session: ["session"] as const,
};
