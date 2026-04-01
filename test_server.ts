import express from "express";
const app = express();
const PORT = 3000;
console.log("Minimal server starting...");
app.get("/", (req, res) => res.send("Hello from minimal server!"));
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Minimal server running on http://localhost:${PORT}`);
});
