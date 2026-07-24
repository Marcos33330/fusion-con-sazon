import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { generalRateLimiter } from "./middleware/rateLimiters";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/auth.routes";
import contentRoutes from "./routes/content.routes";
import mediaRoutes from "./routes/media.routes";
import testimonialsRoutes from "./routes/testimonials.routes";
import contactRoutes from "./routes/contact.routes";

const app = express(); app.set("trust proxy", 1);

// Helmet agrega cabeceras de seguridad (X-Content-Type-Options,
// X-Frame-Options, Strict-Transport-Security, etc.) con defaults sensatos.
app.use(helmet());

// CORS restringido: solo el frontend configurado puede llamar a la API,
// y `credentials: true` permite el envío de la cookie httpOnly.
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(generalRateLimiter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/testimonials", testimonialsRoutes);
app.use("/api/contact", contactRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
