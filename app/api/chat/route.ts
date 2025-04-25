import { openai } from "@ai-sdk/openai"
// import { generateText } from "ai" // Remove generateText
import { streamText } from "ai" // Add streamText
import { CommercetoolsAgentToolkit } from "@commercetools-demo/ct-agent-toolkit/ai-sdk"
import 'dotenv/config'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// Initialize Commercetools Toolkit
const commercetoolsAgentToolkit = new CommercetoolsAgentToolkit({
  clientId: process.env.CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!,
  authUrl: process.env.AUTH_URL!,
  projectKey: process.env.PROJECT_KEY!,
  apiUrl: process.env.API_URL!,
  configuration: {
    actions: {
      products: {
        read: true,
      },
    },
  },
})

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Use streamText for streaming and tool handling
  const result = await streamText({
    model: openai("gpt-4o"),
    system:
      "You are a helpful assistant that can access Commercetools data. " +
      "When you use tools to retrieve information (like product listings), " +
      "your primary goal is to formulate a user-facing text response summarizing the key information from the tool results. " +
      "After receiving the tool results, ALWAYS generate a final text message for the user based on those results.",
    messages,
    tools: {
      ...commercetoolsAgentToolkit.getTools(),
    },
    maxSteps: 5, // Allow multiple steps for tool execution
  })

  // Return the result as a Data Stream Response
  return result.toDataStreamResponse()

  /* // Remove old generateText logic
  // Use generateText instead of streamText to support tools
  const result = await generateText({
    model: openai("gpt-4o"),
    system:
      "You are a helpful assistant that can access Commercetools data. " +
      "When you use tools to retrieve information (like product listings), " +
      "your primary goal is to formulate a user-facing text response summarizing the key information from the tool results. " +
      "After receiving the tool results, ALWAYS generate a final text message for the user based on those results.",
    messages,
    tools: {
      ...commercetoolsAgentToolkit.getTools(),
    },
  })

  // Return the result (adjust response format as needed)
  // Note: generateText doesn't return a stream directly like streamText.
  // You might need to adjust how you send the response back to the client.
  // For now, returning the full result object as JSON.
  return Response.json(result)
  */
}
