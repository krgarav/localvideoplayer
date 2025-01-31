import React from "react";

const DraggableSVG = ({ imageUrl, setSelectedImage, selectedImage }) => {
  return (
    <div
      onClick={() => setSelectedImage(imageUrl)} // ✅ Select the image instead of dragging
      style={{
        display: "inline-block",
        padding: "10px",
        border: selectedImage === imageUrl ? "2px solid blue" : "1px solid gray",
        borderRadius: "5px",
        cursor: "pointer",
        background: "white",
        margin: "5px",
      }}
    >
      {/* Icon Image */}
      <img
        src={imageUrl}
        alt="icon"
        width="50"
        style={{ display: "block", margin: "auto" }}
      />
    </div>
  );
};

export default DraggableSVG;
