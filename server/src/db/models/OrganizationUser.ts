import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

import { OrganizationUserPermission } from "~sharedTypes/enums";

export class OrganizationUser extends Model<
  InferAttributes<OrganizationUser>,
  InferCreationAttributes<OrganizationUser>
> {
  declare organizationId: string;
  declare userId: string;
  declare permissions: OrganizationUserPermission;

  static initModel(sequelize: Sequelize) {
    OrganizationUser.init(
      {
        organizationId: {
          type: DataTypes.UUID,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          primaryKey: true,
        },
        permissions: {
          type: DataTypes.ENUM(...Object.values(OrganizationUserPermission)),
          allowNull: false,
          defaultValue: OrganizationUserPermission.VIEWER,
        },
      },
      {
        sequelize,
        tableName: "organizationUsers",
        indexes: [{ fields: ["userId"] }, { fields: ["organizationId"] }],
      }
    );
    return OrganizationUser;
  }
}
