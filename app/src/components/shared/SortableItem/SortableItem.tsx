import { Box, BoxProps } from "@chakra-ui/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = Omit<BoxProps, "ref"> & {
  id: string;
  data?: Record<string, unknown>;
};

const SortableItem = ({
  children,
  data,
  style: propStyles,
  id,
  ...props
}: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      data,
      id,
    });
  const style = {
    ...propStyles,
    transform: transform
      ? CSS.Transform.toString({ ...transform, scaleX: 1, scaleY: 1 }) // ✅ prevent scale morph
      : undefined,
    transition,
    flexShrink: 0,
  };

  return (
    <Box
      {...props}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      {children}
    </Box>
  );
};

export default SortableItem;
