import chartTypes from "../echarts/charts-chart-types.json";

export const getClassifyPromptUtil = (text: string) => {
    const typesDesc = Object.entries(chartTypes)
        .map(([key, desc]) => `${key}: ${desc}`)
        .join('\n');

    return `Classify the chart type based on this text: "${text}"

    Available types:
        ${typesDesc}

    Output ONLY the chart type name in English (e.g. "bar", "line", "pie").
    NO explanations, NO thinking, NO <think> tags, NO extra words.
     Strictly one word only.`;
}