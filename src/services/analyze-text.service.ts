import prisma from "../prismaClient";
import chartTypes from "../echarts/charts-chart-types.json";
import {AnalyzePipeline} from "../pipline/analyze-pipline";
import {getClassifyPromptUtil} from "../utils/get-classify-prompt.util";
import {getEchartConfig} from "../utils/get-echart-config.util";

interface AnalyzeResult {
    chartType: string;
    echartsConfig: object;
}

export async function analyzeTextWithLLM(text: string, requestId: string): Promise<AnalyzeResult> {
    const timeout = (ms: number) => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));

    try {
        return await Promise.race([timeout(120000), processSteps(text, requestId)]);
    } catch (err: unknown) {
        let errorMessage: string;

        if (err instanceof Error) {
            errorMessage = err.message;
        } else if (typeof err === 'string') {
            errorMessage = err;
        } else {
            errorMessage = String(err);
        }

        await prisma.result.create({
            data: {
                requestId,
                success: false,
                errorMessage,
            },
        });
        throw err;
    }
}

async function processSteps(text: string, requestId: string): Promise<AnalyzeResult> {
    const classifyPrompt = getClassifyPromptUtil(text);

    const chartTypeRaw = await AnalyzePipeline.generateText(classifyPrompt, 1000);
    await logStep(requestId, 'classify_llm_response', classifyPrompt, chartTypeRaw);

    let chartType = chartTypeRaw.trim().toLowerCase();

    const thinkEnd = chartType.lastIndexOf('</think>');
    if (thinkEnd !== -1) {
        chartType = chartType.slice(thinkEnd + 8).trim();
    }
    chartType = chartType.replace(/[^a-z-]/g, '');

    if (!chartType || !Object.keys(chartTypes).includes(chartType)) {
        throw new Error(`Invalid chart type`);
    }

    const combinedPrompt = getEchartConfig(text, chartType);

    const rawOutput = await AnalyzePipeline.generateText(combinedPrompt, 1200);
    await logStep(requestId, 'echarts_llm_raw_response', combinedPrompt, rawOutput);

    let jsonStr = rawOutput.trim();
    const lastThinkClose = jsonStr.lastIndexOf('</think>');
    if (lastThinkClose !== -1) {
        jsonStr = jsonStr.slice(lastThinkClose + 8).trim();
    }

    const firstBrace = jsonStr.indexOf('{');
    if (firstBrace !== -1) {
        jsonStr = jsonStr.slice(firstBrace);
    }

    const lastBrace = jsonStr.lastIndexOf('}');
    if (lastBrace !== -1) {
        jsonStr = jsonStr.slice(0, lastBrace + 1);
    }

    let echartsConfig: object;
    try {
        echartsConfig = JSON.parse(jsonStr);
    } catch (e) {
        throw new Error('Failed to parse ECharts configuration');
    }

    return { chartType, echartsConfig };
}

async function logStep(requestId: string, stepName: string, prompt: string, response: string | null) {
    await prisma.requestStep.create({
        data: {
            requestId,
            stepName,
            prompt,
            response,
        }
    });
}