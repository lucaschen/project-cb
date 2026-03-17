import type { ElementType } from "@packages/shared/generated/elements/index";
import type { HydratedStepElementType } from "@packages/shared/http/schemas/flows/steps/elements/common";
import type { ComponentType } from "react";

import ButtonElement from "./components/ButtonElement";
import DatePickerElement from "./components/DatePickerElement";
import HeaderElement from "./components/HeaderElement";
import LabelElement from "./components/LabelElement";
import NumberInputElement from "./components/NumberInputElement";
import SelectElement from "./components/SelectElement";
import SubtitleElement from "./components/SubtitleElement";
import TextareaElement from "./components/TextareaElement";
import TextInputElement from "./components/TextInputElement";
import TooltipElement from "./components/TooltipElement";
import getRenderableElement from "./getRenderableElement";

type StepElementRendererProps = {
  className?: string;
  element: Pick<HydratedStepElementType, "elementId" | "properties">;
};

type StepElementId = ElementType["elementId"];

type StepElementById<TId extends StepElementId> = Extract<ElementType, { elementId: TId }>;

type StepElementRendererMap = {
  [TId in StepElementId]: ComponentType<{
    properties: StepElementById<TId>["properties"];
  }>;
};

const rendererByElementId: StepElementRendererMap = {
  button: ButtonElement,
  datePicker: DatePickerElement,
  header: HeaderElement,
  label: LabelElement,
  numberInput: NumberInputElement,
  select: SelectElement,
  subtitle: SubtitleElement,
  textarea: TextareaElement,
  textInput: TextInputElement,
  tooltip: TooltipElement,
};

const UnsupportedElement = ({
  elementId,
}: {
  elementId: string;
}) => (
  <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
    <div className="font-medium">Unsupported element</div>
    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-amber-200">
      element: {elementId}
    </div>
  </div>
);

const renderElement = (element: ElementType) => {
  switch (element.elementId) {
    case "button": {
      const Renderer = rendererByElementId.button;
      return <Renderer properties={element.properties} />;
    }
    case "datePicker": {
      const Renderer = rendererByElementId.datePicker;
      return <Renderer properties={element.properties} />;
    }
    case "header": {
      const Renderer = rendererByElementId.header;
      return <Renderer properties={element.properties} />;
    }
    case "label": {
      const Renderer = rendererByElementId.label;
      return <Renderer properties={element.properties} />;
    }
    case "numberInput": {
      const Renderer = rendererByElementId.numberInput;
      return <Renderer properties={element.properties} />;
    }
    case "select": {
      const Renderer = rendererByElementId.select;
      return <Renderer properties={element.properties} />;
    }
    case "subtitle": {
      const Renderer = rendererByElementId.subtitle;
      return <Renderer properties={element.properties} />;
    }
    case "textarea": {
      const Renderer = rendererByElementId.textarea;
      return <Renderer properties={element.properties} />;
    }
    case "textInput": {
      const Renderer = rendererByElementId.textInput;
      return <Renderer properties={element.properties} />;
    }
    case "tooltip": {
      const Renderer = rendererByElementId.tooltip;
      return <Renderer properties={element.properties} />;
    }
  }
};

const StepElementRenderer = ({
  className,
  element,
}: StepElementRendererProps) => {
  const renderableElement = getRenderableElement(element);

  return (
    <div className={className}>
      {renderableElement ? (
        renderElement(renderableElement)
      ) : (
        <UnsupportedElement elementId={element.elementId} />
      )}
    </div>
  );
};

export default StepElementRenderer;
