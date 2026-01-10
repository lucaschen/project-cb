import bcrypt from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

import { User } from "~db/models/User";

import type UserEntity from "../UserEntity";

export default async function create(
  this: typeof UserEntity,
  { password, email }: { password: string; email: string }
) {
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    id: uuidV4(),
    passwordHash,
    email,
  });

  await user.save();

  return new this(user);
}
