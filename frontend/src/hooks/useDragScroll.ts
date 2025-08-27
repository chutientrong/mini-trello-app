import { useRef, useEffect, useState } from "react";

interface UseDragScrollOptions {
  /**
   * CSS selector for interactive elements that should not trigger drag scrolling
   * @default "button, input, textarea, .card, [data-draggable]"
   */
  interactiveSelectors?: string;
  /**
   * Whether to enable the drag scroll functionality
   * @default true
   */
  enabled?: boolean;
  /**
   * Custom class name to add when dragging
   * @default "dragging"
   */
  draggingClassName?: string;
}

interface UseDragScrollReturn {
  /**
   * Ref to attach to the scrollable container
   */
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Whether the user is currently dragging to scroll
   */
  isDragging: boolean;
  /**
   * Props to spread on the scrollable container
   */
  containerProps: {
    className: string;
    style: React.CSSProperties;
  };
}

export const useDragScroll = (
  options: UseDragScrollOptions = {}
): UseDragScrollReturn => {
  console.log("useDragScroll hook called");
  const {
    interactiveSelectors = "button, input, textarea, .card, [data-draggable]",
    enabled = true,
    draggingClassName = "dragging",
  } = options;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Use refs to avoid stale closures in event handlers
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleMouseDown = (e: MouseEvent) => {
      // Check if clicking on interactive elements
      const target = e.target as HTMLElement;
      const isInteractive = target.closest(interactiveSelectors);

      if (!isInteractive) {
        console.log("Starting drag scroll");
        isDraggingRef.current = true;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        setIsDragging(true);
        scrollContainer.classList.add(draggingClassName);
        scrollContainer.style.cursor = "grabbing";
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      // Scroll the container based on drag movement
      scrollContainer.scrollBy(-deltaX, -deltaY);
      console.log("Dragging scroll:", { deltaX, deltaY });

      dragStartRef.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
      e.stopPropagation();
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
      scrollContainer.classList.remove(draggingClassName);
      scrollContainer.style.cursor = "grab";
    };

    scrollContainer.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      scrollContainer.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [enabled, interactiveSelectors, draggingClassName]);

  const containerProps = {
    className: "drag-scroll-container",
    style: {
      backgroundColor: isDragging ? "#f0f0f0" : "transparent",
      cursor: "grab",
    } as React.CSSProperties,
  };

  return {
    scrollContainerRef,
    isDragging,
    containerProps,
  };
};
