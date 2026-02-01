import prisma from "../prismaClient";
import chartTypes from "../echarts/charts-chart-types.json";
import {getClassifyPromptUtil} from "../utils/get-classify-prompt.util";
import {getEchartConfig} from "../utils/get-echart-config.util";
import {generateTextFromHF} from "../pipline/analyze-pipline";

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

    const chartType = await generateTextFromHF(classifyPrompt, 1000);
    await logStep(requestId, 'classify_llm_response', classifyPrompt, chartType);

    if (!chartType || !Object.keys(chartTypes).includes(chartType)) {
        throw new Error(`Invalid chart type`);
    }

    const combinedPrompt = getEchartConfig(text, chartType);

    const rawOutput = await generateTextFromHF(combinedPrompt, 1200);
    await logStep(requestId, 'echarts_llm_raw_response', combinedPrompt, rawOutput);

    let echartsConfig: object;
    try {
        echartsConfig = JSON.parse(rawOutput);
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
