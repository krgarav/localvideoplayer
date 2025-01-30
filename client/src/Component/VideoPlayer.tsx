import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";

function VideoPlayer() {
  const [videos, setVideos] = useState([]); // Store video filenames
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const playerRef = useRef(null);

  // Fetch video list from backend
  useEffect(() => {
    fetch("http://localhost:5000/videos")
      .then((response) => response.json())
      .then((data) => {
        setVideos(data);
        if (data.length > 0) setCurrentVideo(data[0]); // Set first video as default
      })
      .catch((error) => console.error("Error fetching videos:", error));
  }, []);
  // Handle Next
  const handleNext = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  // Handle Prev
  const handlePrev = () => {
    setCurrentVideoIndex((prevIndex) =>
      prevIndex === 0 ? videos.length - 1 : prevIndex - 1
    );
  };
  return (
    <div style={{ maxWidth: "800px", margin: "auto", textAlign: "center" }}>
      <h2>Video Player</h2>

      {currentVideo && (
        <ReactPlayer
          url={`http://localhost:5000/video/${currentVideo}`}
          controls
          width="100%"
          height="450px"
          muted={false} // Ensure video is not muted
          volume={1}    // Set volume to max
          playing={true}
        />
      )}

      {/* Video Playlist */}
      <h3>Playlist</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {videos.map((video, index) => (
          <li key={index} style={{ margin: "10px 0" }}>
            <button
              onClick={() => setCurrentVideo(video)}
              style={{
                padding: "8px 12px",
                border: "none",
                backgroundColor: currentVideo === video ? "#007bff" : "#ccc",
                color: "white",
                cursor: "pointer",
                borderRadius: "5px",
              }}
            >
              {video}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VideoPlayer;
