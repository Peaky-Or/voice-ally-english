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

    // Simple grammar analysis without external API
    console.log('Processing grammar check for:', text)

    // Basic grammar analysis
    let grammarScore = 85 // Default score
    let errors: string[] = []

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