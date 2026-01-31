export const getEchartConfig = (text: string, chartType: string) => {
    return `From this text: "${text}"

    Generate a valid ECharts configuration JSON for chart type "${chartType}".
    
    Rules you MUST follow:
    - Extract labels/categories and numeric values from the text
    - Output ONLY valid JSON object — start directly with { and end with }
    - NO explanations, NO thinking, NO <think>, NO markdown, NO extra text
    - IMPORTANT: For the title — use the EXACT phrasing and language from the user's text if it contains a title-like phrase (e.g. "Продажі за місяцями", "Доходи по кварталам" etc.). 
      Do NOT translate it to English.
    - Include reasonable title if it makes sense from the text
    - Structure must match standard ECharts options for ${chartType}
    
    Examples:
    
    Bar chart:
    {
      "title": { "text": "Продажі за місяцями" },
      "tooltip": {},
      "xAxis": { "type": "category", "data": ["Jan", "Feb", "Mar"] },
      "yAxis": { "type": "value" },
      "series": [{ "type": "bar", "data": [120, 150, 180] }]
    }
    
    Pie chart:
    {
      "title": { "text": "Розподіл часток" },
      "tooltip": { "trigger": "item" },
      "series": [{
        "type": "pie",
        "data": [
          { "value": 40, "name": "A" },
          { "value": 60, "name": "B" }
        ]
      }]
    }
    
    Start directly with {`;
}