import {pipeline, TextGenerationPipeline} from "@huggingface/transformers";
import {TextGenerationResultInterface} from "../types/text-generation-result.interface";

type TaskType = 'text-generation';

export class AnalyzePipeline {
    static pipelineInstance: TextGenerationPipeline | null = null;
    static modelName = 'onnx-community/Qwen3-0.6B-ONNX'
    static task: TaskType = 'text-generation';

    static async init(): Promise<void> {
        if (!this.pipelineInstance) {
            this.pipelineInstance = await pipeline<TaskType>(this.task, this.modelName, {
                dtype: 'q4f16',
            });

            console.log('Pipeline initialized');
        }
    }

    static getPipeline(): TextGenerationPipeline {
        if (!this.pipelineInstance) {
            throw new Error('AnalyzePipeline not initialized. Call init() first.');
        }
        return this.pipelineInstance;
    }

    static async generateText(
        userPrompt: string,
        maxLength: number = 300,
        systemPrompt: string = "You are a helpful assistant that classifies chart types and generates ECharts configs.",
    ): Promise<string> {
        const generator = this.getPipeline();

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: userPrompt }
        ];

        const formattedPrompt = generator.tokenizer.apply_chat_template(messages, {
            tokenize: false,
            add_generation_prompt: true
        }) as string;

        const result = await generator(formattedPrompt, {
            max_new_tokens: maxLength,
            do_sample: false,
            temperature: 0.0,
            top_p: 1.0,
            repetition_penalty: 1.1,
        }) as TextGenerationResultInterface[];

        const fullText = result[0].generated_text;

        return fullText.slice(formattedPrompt.length).trim();
    }
}
