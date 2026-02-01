import { InferenceClient } from "@huggingface/inference";

const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
    throw new Error("HF_TOKEN is required");
}

const client = new InferenceClient(HF_TOKEN);

export async function generateTextFromHF(
    prompt: string,
    maxTokens: number = 300,
    model: string = "Qwen/Qwen2.5-7B-Instruct"
): Promise<string> {
    try {
        const completion = await client.chatCompletion({
            model,
            provider: "auto",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that classifies chart types and generates ECharts configs.",
                },
                { role: "user", content: prompt },
            ],
            max_tokens: maxTokens,
            temperature: 0.0,
            top_p: 1.0,
            repetition_penalty: 1.1,
        });

        return completion.choices[0]?.message?.content?.trim() || "";
    } catch (err) {
        throw new Error(`Inference failed`);
    }
}
