export interface EnforcedStaticMethods<EntityClass, EntityClassInstance> {
  create?: StaticCreateMethod<EntityClass, EntityClassInstance>;
}

export type StaticCreateMethod<EntityClass, EntityClassInstance> = (
  this: EntityClass,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ..._args: any[]
) => EntityClassInstance | Promise<EntityClassInstance>;

export type StaticMethods<EntityClass, EntityClassInstance> = {
  [K in keyof EntityClass]: K extends keyof EnforcedStaticMethods<
    EntityClass,
    EntityClassInstance
  >
    ? EnforcedStaticMethods<EntityClass, EntityClassInstance>[K]
    : unknown;
};

export function staticImplements<T>() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (_constructor: T) => {};
}
