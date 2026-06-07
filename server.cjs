var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  const PORT = process.env.PORT || 3001;
  const isProd = process.env.NODE_ENV === "production" || !import_fs.default.existsSync(import_path.default.join(process.cwd(), "src"));
  
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  const messagesFilePath = import_path.default.join(process.cwd(), "messages.json");

  // GET /api/messages - fetch all chat threads
  app.get("/api/messages", (req, res) => {
    try {
      if (import_fs.default.existsSync(messagesFilePath)) {
        const fileData = import_fs.default.readFileSync(messagesFilePath, "utf8");
        const messages = JSON.parse(fileData);
        res.json(messages);
      } else {
        res.json([]);
      }
    } catch (error) {
      console.error("Error reading messages.json:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // POST /api/messages - send a new message in a thread
  app.post("/api/messages", (req, res) => {
    try {
      const { threadId, text, sender } = req.body;
      if (!threadId || !text || !sender) {
        return res.status(400).json({ error: "Missing required fields: threadId, text, sender" });
      }

      let messagesData = [];
      if (import_fs.default.existsSync(messagesFilePath)) {
        const fileData = import_fs.default.readFileSync(messagesFilePath, "utf8");
        messagesData = JSON.parse(fileData);
      }

      let thread = messagesData.find(t => t.id === threadId);
      if (!thread) {
        thread = {
          id: threadId,
          clientName: threadId.charAt(0).toUpperCase() + threadId.slice(1) + " Family",
          route: "Unknown Route",
          ref: "#QL-" + Math.floor(10000 + Math.random() * 90000),
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
          messages: []
        };
        messagesData.push(thread);
      }

      const newMessage = {
        id: "m" + Date.now(),
        sender,
        text,
        timestamp: new Date().toISOString()
      };

      thread.messages.push(newMessage);

      import_fs.default.writeFileSync(messagesFilePath, JSON.stringify(messagesData, null, 2), "utf8");
      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error writing messages.json:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  if (!isProd) {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
