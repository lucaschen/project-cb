import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

import { NodeType } from "../../../../packages/shared/src/types/enums";

export class Node extends Model<
  InferAttributes<Node>,
  InferCreationAttributes<Node>
> {
  declare id: string;
  declare name: string;
  declare flowId: string;
  declare type: NodeType;

  static initModel(sequelize: Sequelize) {
    Node.init(
      {
        id: { type: DataTypes.UUID, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        flowId: { type: DataTypes.UUID, allowNull: false },
        type: {
          type: DataTypes.ENUM(...Object.values(NodeType)),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "nodes",
        indexes: [{ fields: ["flowId"] }],
      },
    );
    return Node;
  }
}
