import type ElementPropertiesEntity from "../ElementPropertiesEntity";

export default function getPayload(this: ElementPropertiesEntity) {
  return {
    id: this.dbModel.id,
    elementId: this.dbModel.elementId,
    description: this.dbModel.description,
    propertyName: this.dbModel.propertyName,
    propertyType: this.dbModel.propertyType,
    required: this.dbModel.required,
    defaultValue: this.dbModel.defaultValue,
  };
}
