import { FastifyReply, FastifyRequest } from 'fastify';
import prisma from "../prismaClient";
import {analyzeTextWithLLM} from "../services/analyze-text.service";

export const analyzeController = async (request: FastifyRequest, reply: FastifyReply) => {
    const { text } = request.body as { text: string };

    if (!text || text.length > 1024) {
        return reply.status(400).send({ success: false, error: 'Text is required and max 1024 chars' });
    }

    try {
        const req = await prisma.request.create({ data: { inputText: text } });

        const { chartType, echartsConfig } = await analyzeTextWithLLM(text, req.id);

        await prisma.request.update({
            where: { id: req.id },
            data: { chartType }
        });

        await prisma.result.create({
            data: {
                success: true,
                echartsConfig,
                requestId: req.id
            }
        });

        return reply.send({ success: true, echartsConfig });
    } catch (err: unknown) {
        let errorMessage: string;

        if (err instanceof Error) {
            errorMessage = err.message;
        } else if (typeof err === 'string') {
            errorMessage = err;
        } else {
            errorMessage = String(err);
        }
        return reply.status(500).send({ success: false, error: 'Processing error', details: errorMessage });
    }
};
