import {analyzeController} from "../controllers/analyze.controller";
import {FastifyInstance} from "fastify";

export default async function analyzeRoute(fastify: FastifyInstance) {
    fastify.post('/analyze', analyzeController);
}