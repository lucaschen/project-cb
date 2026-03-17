import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class OrganizationApiKey extends Model<
  InferAttributes<OrganizationApiKey>,
  InferCreationAttributes<OrganizationApiKey>
> {
  declare id: string;
  declare organizationId: string;
  declare name: string;
  declare key: string;
  declare prefix: string;
  declare createdByUserId: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare lastUsedAt: Date | null;
  declare expiresAt: Date | null;
  declare revokedAt: Date | null;
  declare revokedByUserId: string | null;

  static initModel(sequelize: Sequelize) {
    OrganizationApiKey.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
        },
        organizationId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        key: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        prefix: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        createdByUserId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        lastUsedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
        expiresAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
        revokedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
        revokedByUserId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "organizationApiKeys",
        indexes: [
          { unique: true, fields: ["key"] },
          { fields: ["organizationId"] },
          { fields: ["createdByUserId"] },
          { fields: ["revokedByUserId"] },
          { fields: ["organizationId", "revokedAt", "expiresAt"] },
        ],
      },
    );

    return OrganizationApiKey;
  }
}
