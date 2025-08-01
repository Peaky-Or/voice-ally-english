import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    // Use Hugging Face's free grammar checking model
    const response = await fetch(
      'https://api-inference.huggingface.co/models/textattack/roberta-base-CoLA',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('Grammar check result:', result)

    // Process the result to extract grammar analysis
    let grammarScore = 85 // Default score
    let errors: string[] = []

    if (Array.isArray(result) && result.length > 0) {
      const colaScore = result[0]
      if (colaScore.label === 'LABEL_1') {
        grammarScore = Math.round(colaScore.score * 100)
      } else {
        grammarScore = Math.round((1 - colaScore.score) * 100)
        errors.push('Grammar issues detected in sentence structure')
      }
    }

    // Simple additional grammar checks
    const simpleErrors = []
    if (text.length > 0 && !text[0].match(/[A-Z]/)) {
      simpleErrors.push('Sentence should start with a capital letter')
    }
    if (!text.match(/[.!?]$/)) {
      simpleErrors.push('Sentence should end with proper punctuation')
    }

    return new Response(
      JSON.stringify({
        grammarScore: Math.max(grammarScore - simpleErrors.length * 10, 0),
        errors: [...errors, ...simpleErrors],
        suggestions: simpleErrors.length > 0 ? ['Check capitalization and punctuation'] : []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Grammar check error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        grammarScore: 50,
        errors: ['Unable to check grammar at this time']
      }),
      {
        status: 200, // Return 200 with fallback data
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})