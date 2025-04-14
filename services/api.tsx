import { OPENAI_API_KEY } from '@env';

  export const fetchChatGPTResponse = async (userMessage: string) => {
    const requestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
    };
  
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API Error:", errorData);
        throw new Error(`API Error: ${errorData.message}`);
      }
  
      const data = await response.json();
      return data.choices[0].message.content;
      
  
    } catch (error) {
      console.error('Error fetching from ChatGPT API:', error);
      return null;
    }
  };
  
  
  