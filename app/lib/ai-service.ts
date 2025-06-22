import OpenAI from 'openai'

class AIService {
  private static instance: OpenAI | null = null
  
  static getClient(): OpenAI {
    if (!this.instance) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured')
      }
      this.instance = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
    }
    return this.instance
  }
}

export default AIService
