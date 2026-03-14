import { UniqueConstraintError } from "sequelize";

import InvalidRequestError from "~src/utils/errors/InvalidRequestError";

import type OrganizationEntity from "../OrganizationEntity";

export default async function updateSettings(
  this: OrganizationEntity,
  {
    name,
    slug,
  }: {
    name?: string;
    slug?: string;
  },
) {
  if (name !== undefined) {
    this.dbModel.name = name;
  }

  if (slug !== undefined) {
    this.dbModel.slug = slug;
  }

  try {
    await this.dbModel.save();
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new InvalidRequestError("Organization slug already exists.");
    }

    throw error;
  }

  return this.getAdminDetail();
}
