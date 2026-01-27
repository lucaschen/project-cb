import { User } from "~db/models/User";

import type UserEntity from "../UserEntity";

export default async function findById(this: typeof UserEntity, id: string) {
  const user = await User.findByPk(id);

  if (!user) return null;

  return new this(user);
}
