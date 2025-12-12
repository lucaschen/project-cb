import { Box, BoxProps } from "@chakra-ui/react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

type Props = Omit<BoxProps, "ref"> & {
  id: string;
  data?: Record<string, unknown>;
};

const Draggable = ({
  children,
  data,
  id,
  style: propStyles,
  ...props
}: Props) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data,
  });
  const style = {
    ...propStyles,
    transform: CSS.Translate.toString(transform),
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

export default Draggable;
