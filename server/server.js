const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const videosDir = path.join(__dirname, "videos");
const app = express();
const mime = require("mime-types");
app.use(cors());
// ✅ API to Get All Video Filenames
app.get("/videos", (req, res) => {
  fs.readdir(videosDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Unable to fetch videos" });
    }

    // Supported video file extensions
    const videoExtensions = [
      ".mp4",
      ".mkv",
      ".avi",
      ".mov",
      ".webm",
      ".flv",
      ".wmv",
    ];

    // Filter files that match video extensions
    const videoFiles = files.filter((file) =>
      videoExtensions.some((ext) => file.toLowerCase().endsWith(ext))
    );

    res.json(videoFiles);
  });
});

// ✅ API to Stream Selected Video
app.get("/video/:filename", (req, res) => {
  const videoFile = req.params.filename;
  const videoPath = path.join(videosDir, videoFile);

  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: "Video not found" });
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;
  const mimeType = mime.lookup(videoPath) || "application/octet-stream"; // Auto-detect type

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": mimeType, // Use detected MIME type
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": mimeType, // Use detected MIME type
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
