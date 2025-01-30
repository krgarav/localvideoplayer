import { useEffect, useRef, useState } from "react";

import "./App.css";
import VideoPlayer from "./Component/VideoPlayer";
import Scribble from "./Component/Scribble";

function App() {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const imageRef = useRef(null);

  useEffect(() => {
    const updateImageSize = () => {
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        setImageSize({
          width: rect.width,
          height: rect.height,
          x: rect.left + window.scrollX, // Get correct absolute position
          y: rect.top + window.scrollY,
        });
      }
    };

    // Call initially and on window resize
    updateImageSize();
    window.addEventListener("resize", updateImageSize);
    return () => window.removeEventListener("resize", updateImageSize);
  }, []);
  return (
    <div style={{ position: "relative", width: "fit-content", margin: "auto" }}>
    {/* Image */}
    <img
      ref={imageRef}
      src="http://192.168.1.43:9000/processedFolder/CS101/extractedBooklets/1900074011_CS101/image_1.png"
      alt="answersheet"
      style={{ maxWidth: "100%", height: "auto", display: "block" }} // Ensure proper scaling
    />

    {/* Pass Actual Dimensions & Position to Scribble */}
    {/* {imageSize.width > 0 && imageSize.height > 0 && ( */}
      <Scribble
        width={imageSize.width}
        height={imageSize.height}
        x={imageSize.x}
        y={imageSize.y}

        // width={700}
        // height={400}
        // x={25}
        // y={135}
      />
    {/* )} */}
  </div>
  );
}

export default App;
