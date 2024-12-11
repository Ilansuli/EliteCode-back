import express from "express";
import cors from "cors";
import path from "path";
import axios from "axios";
import { loggerService } from "./services/logger.service";
import { router as codeBlockRoutes } from "./api/codeBlock/codeBlock.routes";
import { createServer } from "http";
import { config as dotenvConfig } from "dotenv";
import { setupSocketAPI } from "./services/socket.service";
//INIT
const app = express();
app.use(express.json());
const http = createServer(app);
dotenvConfig();
setupSocketAPI(http);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "public")));
} else {
  const corsOptions = {
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    credentials: true,
  };
  app.use(cors(corsOptions));
}

app.use("/api/codeBlock", codeBlockRoutes);

app.get("/api/test", async (req, res) => {
  try {
    res.send("test");
  } catch (err) {
    loggerService.error("Failed to get test", err);
    res.status(500).send({ err: "Failed to get test" });
  }
});

//keeping server alive in free hosting
setInterval(async () => {
  try {
    const response = await axios.get(
      `https://elitecode-api.onrender.com/api/test`
    );
    console.log("Request to / successful:", response.data);
  } catch (error) {
    console.error("Error making request to /:", error.message);
  }
}, 13 * 60 * 1000);

// Make every server-side-route to match the index.html
// so when requesting http://localhost:3030/index.html/codeBlock/123 it will still respond with
// our SPA (single page app) (the index.html file) and allow vue/react-router to take it from there
app.get("/**", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3030;
http.listen(port, () => {
  loggerService.info("Server is running on http://localhost:" + port);
});
