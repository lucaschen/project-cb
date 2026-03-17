import { Button } from "@app/components/ui/Button";
import { FormField } from "@app/components/ui/FormField";
import { TextAreaField } from "@app/components/ui/TextAreaField";
import { ElementPropertyTypes } from "@packages/shared/types/enums";

import type { StepElementDraft } from "../stepEditorTypes";
import {
  formatElementReference,
} from "../stepElementReferences";

type HtmlForOption = {
  label: string;
  value: string;
};

const ALIGN_OPTIONS = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
] as const;

type StepElementPropertiesPanelProps = {
  htmlForOptions: HtmlForOption[];
  stepName: string;
  selectedElement: StepElementDraft | null;
  validationErrors: string[];
  onPropertyValueChange: (propertyId: string, value: string) => void;
  onRemoveElement: () => void;
};

const StepElementPropertiesPanel = ({
  htmlForOptions,
  onPropertyValueChange,
  onRemoveElement,
  selectedElement,
  stepName,
  validationErrors,
}: StepElementPropertiesPanelProps) => {
  const unresolvedHtmlForValues = selectedElement
    ? selectedElement.properties
        .filter((property) => property.propertyName === "htmlFor")
        .map((property) => property.value)
        .filter(
          (value) => value.trim().length > 0 && !htmlForOptions.some((option) => option.value === value),
        )
    : [];

  return (
    <div className="flex min-h-0 flex-col border-l border-white/10 px-5 py-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        Element properties
      </p>
      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
        {validationErrors.length > 0 ? (
          <div className="space-y-2 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
              Modal issues
            </p>
            <ul className="space-y-1 text-sm text-amber-100">
              {validationErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {selectedElement ? (
          <div className="space-y-4">
            {selectedElement.properties.map((property) => {
              if (property.propertyType === ElementPropertyTypes.BOOLEAN) {
                return (
                  <label className="block space-y-1.5" key={property.propertyId}>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {property.propertyName}
                    </span>
                    <select
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-sky-300"
                      onChange={(event) =>
                        onPropertyValueChange(property.propertyId, event.target.value)
                      }
                      value={property.value}
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </label>
                );
              }

              if (property.propertyName === "htmlFor") {
                const unresolvedValue = unresolvedHtmlForValues.find(
                  (value) => value === property.value,
                );

                return (
                  <label className="block space-y-1.5" key={property.propertyId}>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      htmlFor
                    </span>
                    <select
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-sky-300"
                      onChange={(event) =>
                        onPropertyValueChange(property.propertyId, event.target.value)
                      }
                      value={property.value}
                    >
                      <option value="">Not linked</option>
                      {unresolvedValue ? (
                        <option disabled value={unresolvedValue}>
                          unresolved: {formatElementReference(stepName, unresolvedValue)}
                        </option>
                      ) : null}
                      {htmlForOptions.map((option) => (
                        <option key={`${option.value}-${option.label}`} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              }

              if (property.propertyName === "align") {
                const unresolvedValue =
                  property.value.trim().length > 0 &&
                  !ALIGN_OPTIONS.some((option) => option.value === property.value)
                    ? property.value
                    : null;

                return (
                  <label className="block space-y-1.5" key={property.propertyId}>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      align
                    </span>
                    <select
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-sky-300"
                      onChange={(event) =>
                        onPropertyValueChange(property.propertyId, event.target.value)
                      }
                      value={property.value}
                    >
                      {unresolvedValue ? (
                        <option disabled value={unresolvedValue}>
                          unresolved: {unresolvedValue}
                        </option>
                      ) : null}
                      {ALIGN_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              }

              if (
                property.propertyType === ElementPropertyTypes.ARRAY ||
                property.propertyType === ElementPropertyTypes.OBJECT
              ) {
                return (
                  <TextAreaField
                    id={`step-element-property-${property.propertyId}`}
                    key={property.propertyId}
                    label={property.propertyName}
                    onChange={(event) =>
                      onPropertyValueChange(property.propertyId, event.target.value)
                    }
                    rows={4}
                    value={property.value}
                  />
                );
              }

              return (
                <FormField
                  id={`step-element-property-${property.propertyId}`}
                  key={property.propertyId}
                  label={property.propertyName}
                  onChange={(event) =>
                    onPropertyValueChange(property.propertyId, event.target.value)
                  }
                  type={
                    property.propertyType === ElementPropertyTypes.NUMBER
                      ? "number"
                      : "text"
                  }
                  value={property.value}
                />
              );
            })}
            <Button className="w-full" onClick={onRemoveElement} variant="secondary">
              Remove element
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-sm text-slate-400">
            Select an element to edit its properties.
          </div>
        )}
      </div>
    </div>
  );
};

export default StepElementPropertiesPanel;
