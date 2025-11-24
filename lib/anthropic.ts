export async function sendMessageToAI(message: string, conversationHistory: any[] = []) {
  const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
  
  if (!apiKey) {
    throw new Error('Anthropic API key not configured')
  }

  const messages = [
    ...conversationHistory.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    })),
    { role: 'user', content: message }
  ]

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: 'You are Neuronova AI, an empathetic mental wellness coach. Use CBT and DBT techniques. Be supportive, non-judgmental, and concise (2-4 sentences). Always end with a reflective question. If user mentions self-harm or suicide, immediately provide crisis resources: US 988, UK 116 123.',
      messages: messages
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to get AI response')
  }

  const data = await response.json()
  return data.content[0].text
}
