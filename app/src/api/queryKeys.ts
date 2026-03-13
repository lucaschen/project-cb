export const queryKeys = {
  currentUserOrganizations: ["current-user", "organizations"] as const,
  flow: (flowId: string) => ["flows", flowId] as const,
  organizationFlows: (organizationId: string) =>
    ["organizations", organizationId, "flows"] as const,
  session: ["session"] as const,
};
