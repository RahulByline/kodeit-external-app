import express from "express";
import cors from "cors";
import { runRouter } from "./runController";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api", runRouter);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`editor-backend listening on ${PORT}`));
