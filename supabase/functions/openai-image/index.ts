import { corsHeaders } from '../_shared/cors.ts'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ImageRequest {
  message: string;
  imagePrompt: string;
  conversationHistory?: ChatMessage[];
}

interface ImageGenerationRequest {
  model: string;
  prompt: string;
  n: number;
  quality: 'standard' | 'hd';
  response_format: 'url' | 'b64_json';
  size: '1024x1024' | '1792x1024' | '1024x1792';
  style: 'vivid' | 'natural';
}

interface ImageGenerationResponse {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('OpenAI Image function called');
    
    const { message, imagePrompt, conversationHistory = [] }: ImageRequest = await req.json()
    console.log('Request data:', { 
      message: message?.substring(0, 50) + '...', 
      imagePrompt: imagePrompt?.substring(0, 50) + '...',
      historyLength: conversationHistory.length 
    });

    if (!message || !imagePrompt) {
      console.error('Message and imagePrompt are required');
      return new Response(
        JSON.stringify({ error: 'Message and imagePrompt are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY environment variable not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Generating image with DALL-E 3');
    
    // Generate image using DALL-E 3
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: imagePrompt,
        n: 1,
        quality: 'standard',
        response_format: 'url',
        size: '1024x1024',
        style: 'natural'
      } as ImageGenerationRequest),
    })

    if (!imageResponse.ok) {
      const errorData = await imageResponse.text()
      console.error('DALL-E API error:', imageResponse.status, errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to generate image' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const imageData: ImageGenerationResponse = await imageResponse.json()
    const imageUrl = imageData.data[0]?.url

    if (!imageUrl) {
      console.error('No image URL returned from DALL-E');
      return new Response(
        JSON.stringify({ error: 'No image URL returned from DALL-E' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Image generated successfully, now generating explanatory text');

    // Generate explanatory text using GPT
    const textMessages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an AI tutoring assistant. A visual diagram has been created for the user's request. Provide a brief, helpful explanation of what the diagram shows and how it can be used for learning. Keep it concise and educational.`
      },
      ...conversationHistory,
      {
        role: 'user',
        content: `I've created a visual diagram for your request: "${message}". Please provide a brief explanation of what the diagram shows and how it can be used for learning.`
      }
    ]

    const textResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: textMessages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!textResponse.ok) {
      const errorData = await textResponse.text()
      console.error('GPT API error for text:', textResponse.status, errorData)
      // Return image with basic explanation if text generation fails
      return new Response(
        JSON.stringify({ 
          message: "I've created a visual diagram for your request. The image above shows the requested visualization.",
          imageUrl: imageUrl
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const textData = await textResponse.json()
    const explanationText = textData.choices[0]?.message?.content

    if (!explanationText) {
      console.error('No explanation text generated');
      return new Response(
        JSON.stringify({ 
          message: "I've created a visual diagram for your request. The image above shows the requested visualization.",
          imageUrl: imageUrl
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Successfully generated image and explanation');

    return new Response(
      JSON.stringify({ 
        message: explanationText,
        imageUrl: imageUrl,
        usage: textData.usage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in openai-image function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})