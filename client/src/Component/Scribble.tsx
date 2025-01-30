import React, { useState, useRef } from "react";
import {
  Stage,
  Layer,
  Line,
  Image,
  Transformer,
  Group,
  Text,
} from "react-konva";
import useImage from "use-image";
import Tools from "./Tools";

const DraggableResizableImage = ({
  image,
  isSelected,
  onSelect,
  onChange,
  onDelete,
}) => {
  const [img] = useImage(image.src);
  const imageRef = useRef();
  const transformerRef = useRef();

  // Apply Transformer when selected
  React.useEffect(() => {
    if (isSelected) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Group>
        <Image
          image={img}
          x={image.x}
          y={image.y}
          draggable={true}
          ref={imageRef}
          width={image.width || 100}
          height={image.height || 100}
          onClick={onSelect}
          onTap={onSelect}
          onDragEnd={(e) => {
            onChange({ ...image, x: e.target.x(), y: e.target.y() });
          }}
          onTransformEnd={(e) => {
            const node = imageRef.current;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            // Update state with new width/height and reset scale
            onChange({
              ...image,
              x: node.x(),
              y: node.y(),
              width: node.width() * scaleX,
              height: node.height() * scaleY,
              scaleX: 1,
              scaleY: 1, // Reset scale after applying new width and height
            });

            node.scaleX(1);
            node.scaleY(1);
          }}
        />
        {/* Delete Button (Cross) */}
        {isSelected && (
          <Text
            text="❌"
            fontSize={22}
            x={image.x + (image.width || 100) - 15} // Position top-right of image
            y={image.y - 25}
            fill="red"
            fontStyle="bold"
            onClick={onDelete}
            onTap={onDelete}
            hitStrokeWidth={30} // Increase hit area
            align="center"
            draggable={false} // Prevent accidental drag
            stroke="white" // Makes it more visible on dark backgrounds
            strokeWidth={3} // Outline effect for visibility
          />
        )}
      </Group>
      {isSelected && <Transformer ref={transformerRef} />}
    </>
  );
};

const ScribbleCanvas = ({ height, width, x, y }) => {
  const [tool, setTool] = useState("pen"); // Current tool state
  const [lines, setLines] = useState([]); // Stores drawn lines
  const [icons, setIcons] = useState([]); // Stores dragged icons
  const [selectedId, setSelectedId] = useState(null); // Tracks selected image for resizing
  const isDrawing = useRef(false);
  const stageRef = useRef();
  const dragUrl = useRef();

  // Handle drawing with pen/eraser
  const handleMouseDown = (e) => {
    if (tool !== "pen" && tool !== "eraser") return;
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([
      ...lines,
      {
        tool,
        points: [pos.x, pos.y],
        color: tool === "eraser" ? "white" : "black",
      },
    ]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    setLines((prevLines) => {
      const lastLine = prevLines[prevLines.length - 1];
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      return [...prevLines];
    });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    stageRef.current.setPointersPositions(e);

    const pos = stageRef.current.getPointerPosition();

    setIcons((prevIcons) => [
      ...prevIcons,
      {
        x: pos.x,
        y: pos.y,
        src: dragUrl.current, // Ensure the correct image URL is used
        width: 100,
        height: 100,
      },
    ]);
  };

  // Toolbar Buttons
  const Toolbar = () => (
    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
      <button
        onClick={() => setTool("pen")}
        style={{ background: tool === "pen" ? "lightblue" : "white" }}
      >
        🖊️ Pen
      </button>
      <button
        onClick={() => setTool("eraser")}
        style={{ background: tool === "eraser" ? "lightblue" : "white" }}
      >
        🧽 Eraser
      </button>
      <button
        onClick={() => setTool("icon")}
        style={{ background: tool === "icon" ? "lightblue" : "white" }}
      >
        📌 Drag Icons
      </button>
      <button onClick={() => setLines([])}>❌ Clear</button>
    </div>
  );

  return (
    <div>
      <Toolbar />
      {/* <Tools /> */}
      <div>
        Drag these images into the canvas:
        <br />
        <img
          alt="star"
          src="/blank.jpg"
          draggable="true"
          width="50"
          onDragStart={(e) => {
            dragUrl.current = e.target.src;
          }}
          style={{ marginRight: 10, cursor: "grab" }}
        />
        <img
          alt="heart"
          src="/check.png"
          draggable="true"
          width="50"
          onDragStart={(e) => (dragUrl.current = e.target.src)}
          style={{ cursor: "grab" }}
        />
      </div>

      {/* Scribble Canvas Positioned Exactly Over the Image */}
      <div
        style={{
          position: "absolute",
          top: y,
          left: x,
          width: width,
          height: height,
          pointerEvents: "none", // Prevents interference with background image clicks
        }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <Stage
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            border: "1px solid black",
            pointerEvents: "all", // Allows interactions
          }}
          ref={stageRef}
        >
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={tool === "eraser" ? 20 : 3}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
              />
            ))}
            {icons.map((image, i) => (
              <DraggableResizableImage
                key={i}
                image={image}
                isSelected={i === selectedId}
                onSelect={() => setSelectedId(i)}
                onDelete={() => {
                  setIcons(icons.filter((_, index) => index !== i));
                  setSelectedId(null);
                }}
                onChange={(newAttrs) => {
                  const updatedIcons = icons.slice();
                  updatedIcons[i] = newAttrs;
                  setIcons(updatedIcons);
                }}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default ScribbleCanvas;
