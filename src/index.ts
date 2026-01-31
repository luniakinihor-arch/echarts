import Fastify from "fastify";
import dotenv from "dotenv";
import analyzeRoute from "./routes/analyze.route";
import {AnalyzePipeline} from "./pipline/analyze-pipline";

dotenv.config();

const fastify = Fastify({ logger: true });

AnalyzePipeline.init()
fastify.register(analyzeRoute, { prefix: '/api' });
const PORT = Number(process.env.PORT) || 3100;
fastify.listen({ port: PORT, host: "0.0.0.0" }).then(() => {
    console.log(`Server running on port ${PORT}`);
});

