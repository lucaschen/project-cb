import { User } from "~db/models/User";

import type UserEntity from "../UserEntity";

export default async function findByEmail(
  this: typeof UserEntity,
  email: string
) {
  const user = await User.findOne({ where: { email } });

  if (!user) return null;

  return new this(user);
}
