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
      category: {
        read: true,
      },
      cart: {
        read: true,
        update: true,
        create: true,
      },
      order: {
        read: true,
        update: true,
        create: true,
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
      "Your primary goal is to help the user manage products, categories, carts, and orders. " +
      "When interacting with carts: " +
      "  - If the user wants to view or modify an *existing* cart, ask for the cart ID or key before using 'read_cart' or 'update_cart'. " +
      "  - If the user wants to *create* a new cart or add items and hasn't mentioned an existing cart ID/key, use the 'create_cart' tool first. You don't need an ID to create a cart. " +
      "When you use tools to retrieve information (like product listings), summarize the key information from the tool results in your response. " +
      "If a tool call results in an error: Inform the user that the action failed, state the reason if known, and ask if they want to try something else or provide more details (e.g., 'I couldn't find a cart with that ID. Would you like to try a different ID or create a new cart?'). " +
      "After receiving successful tool results, ALWAYS generate a final text message for the user based on those results.",
    messages,
    tools: {
      ...commercetoolsAgentToolkit.getTools(),
    },
    maxSteps: 5, // Allow multiple steps for tool execution
  })

  // Return the result as a Data Stream Response
  return result.toDataStreamResponse()

}
