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

const DraggableResizableImage = ({ image, isSelected, onSelect, onChange, onDelete }) => {
  const [img] = useImage(image.src);
  const imageRef = useRef();
  const transformerRef = useRef();

  React.useEffect(() => {
    if (isSelected && transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Group>
        {/* ✅ Image */}
        <Image
          image={img}
          x={image.x}
          y={image.y}
          draggable
          ref={imageRef}
          width={image.width || 100}
          height={image.height || 100}
          onClick={onSelect}
          onTap={onSelect}
          onDragEnd={(e) => {
            onChange({ ...image, x: e.target.x(), y: e.target.y() });
          }}
        />

        {/* ✅ Question and Marks */}
        <Text
          text={`Q${image.question} → ${image.mark}`}
          fontSize={14}
          x={image.x + 5}
          y={image.y + image.height + 5}
          fill="black"
          fontStyle="bold"
        />

        {/* ✅ Timestamp */}
        <Text
          text={image.timestamp || "No Timestamp"}
          fontSize={12}
          x={image.x + 5}
          y={image.y + image.height + 20}
          fill="gray"
          italic
        />

        {/* ✅ Delete Button */}
        {isSelected && (
          <Text
            text="❌"
            fontSize={20}
            x={image.x + image.width - 15}
            y={image.y - 25}
            fill="red"
            fontStyle="bold"
            onClick={onDelete}
            onTap={onDelete}
            hitStrokeWidth={30}
            draggable={false}
            stroke="white"
            strokeWidth={3}
          />
        )}
      </Group>

      {/* ✅ Transformer for Resizing */}
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

  const handleDrop = (e) => {
    e.preventDefault();
    stageRef.current.setPointersPositions(e);
    const pos = stageRef.current.getPointerPosition();

    // ✅ Retrieve the full data from dragUrl.current
    const draggedData = JSON.parse(dragUrl.current);

    setIcons((prevIcons) => [
      ...prevIcons,
      {
        id: prevIcons.length, // Assign a unique ID
        x: pos.x,
        y: pos.y,
        src: draggedData.src,
        width: 80,
        height: 80,
        question: draggedData.question,
        mark: draggedData.mark,
        timestamp: draggedData.timestamp,
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
        {/* ✅ Wrap Entire Div for Dragging */}
        <div
          draggable="true"
          onDragStart={(e) => {
            dragUrl.current = JSON.stringify({
              src: "/check.png",
              question: 5,
              mark: 20,
              timestamp: "10:44:47",
            });
          }}
          // style={{
          //   display: "inline-block",
          //   padding: "10px",
          //   border: "1px solid gray",
          //   borderRadius: "5px",
          //   cursor: "grab",
          //   background: "white",
          // }}
        >
          {/* Icon Image */}
          <img
            src="/check.png"
            alt="icon"
            width="50"
            style={{ display: "block", margin: "auto" }}
          />

          {/* Allotted Marks and Question */}
          <div className="mt-2 text-center text-xl font-semibold text-gray-700">
            <span className="mr-1">{`Q5`}</span>→
            <span
              className={`ml-1 inline-flex min-w-[1.5rem] items-center justify-center font-extrabold rounded-full bg-gray-50 p-1`}
            >
              {`20`}
            </span>
          </div>

          {/* Timestamp */}
          <div className="mt-1 text-center text-md font-extrabold italic text-gray-700 opacity-75 text" style={{color: "gray"}}>
            {"10:44:47"}
          </div>
        </div>
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
