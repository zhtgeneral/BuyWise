import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { InferenceClient } from "@huggingface/inference";
import { ChatbotResponse } from "../types/ChatbotResponse";

const debug = false;

// TODO move to a secure place
const ghToken = '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';
const endpoint = "https://models.github.ai/inference";
const modelName = "meta/Meta-Llama-3.1-8B-Instruct";
const ghClient = ModelClient(endpoint, new AzureKeyCredential(ghToken));

const hdToken = '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';
const hfClient = new InferenceClient(hdToken);

export class AIService {
  /**
   * This function calls the Azure API to get the Llama model for text completion.
   * 
   * This call is rate limited with 150/day, 15/minute, 8000 token/request in, 4000 token/request out.
   * 
   * useful links: 
   * (rate limits) https://docs.github.com/en/github-models/use-github-models/prototyping-with-ai-models
   * (sample code) https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/ai/ai-inference-rest/samples/v1-beta/typescript/src/chatCompletions.ts
   * (testing) https://github.com/marketplace/models/azureml-meta/Meta-Llama-3-1-8B-Instruct/playground/json
   */
  public static async chatCompletionGithubModel(message: string): Promise<ChatbotResponse> {
    const response = await ghClient.path("/chat/completions").post({
      body: {
        messages: [
          { 
            role:"system", 
            content: `
              This is what the user said: ${message}
              Give appropriate responses using this business logic. The business logic contains possible scenarios and responses. Don't explain the reasoning. 
              
              how to create responses:
              ChatbotMessage is the expected response of the bot.
              ProductRequested is true when the user is looking for a product.
              ProductQuery is only filled in when ProductRequested is true and the user searches for a valid product. Keep ProductQuery empty unless the user is searching for a product.

              Return the response like this. 

              ChatbotMessage=<Chatbot message>
              ProductRequested=true/false
              ProductQuery=<Key words of the user's product description>

              business instructions: 
              if user sends none/empty message, 
                bot: "What type of electronics are you looking for?"

              if user sends any synonyms of 'laptop', 'phone', 'computer' (PC, tablet, mobiles all accepted),
                bot sends one of these
                  "I was able to find these laptops/phones/computers on the web", or
                  "I could not find anything with that description on the web. Let me know if you would like to change your preferences."

              if user searches for something other than  'laptop', 'phone', 'computer',
                bot sends "My AI can only search for laptops, phones, and computers. Would you like to search for any of these?"

              if the user asks how the chatbot is used,
                bot sends "I can help you search for laptops, phones, or computers on the web. Would you like to do that?"

              if the user says "yes" without any context,
                bot sends "Here are all products that I found. Let me know if you'd like to narrow down your search"

              if user sends unknown command or unspecified request,
                bot sends "As a chatbot, am I unsure what to do with that request. I can help you find laptops, phones, and computers on the web."
              
              if user sends something like "Why can't I purchase or checkout"
                bot sends "You are meant to purchase via the vendor. We don't stock the items."

              if user sends anything like "update budget to X"
                bot sends "backend (updates budget to min 0, max X). I have updated your max budget to X."

              if user sends anything like "these are too expensive" or "expensive"
                bot sends "backend (updates budget to min 0, max new number). I have updated your max budget to X."

              if user sends anything like "change location to X"
                bot sends one of 
                  "backend (updates store to X). You should now see products from X sites"
                  "I am unable to search for products from that location."

              if user sends anything like "higher ratings" or "set ratings to 5 stars"
                bot sends "backend (updates rating to 5). You should now see products with higher ratings"

              if user sends anything like "update account information or user preference to something"
                bot sends "There is an option to update you profile. Please visit that page."

              if user sends anything like "this product is too old/slow" or "I want a specific model"
                bot sends "Our AI doesn't have the ability to search for individual items. Would you like to change your budget preferences?"

              if user sends anything like "bad products" or "bad" or "these are garbage"
                bot sends "Our AI fetches products from the web and we rely on websites to stock better products."

              if user sends a compliment like as "good", "nice" or "these products are good" or anything like this
                bots sends "We recommend you give us a 5 star rating."

              if user sends anything like "what do you sell?" or "what can I search for?"
                bots sends "I can help you find laptops, phones and computers on the web."
              
              if user sends anything referencing history like "use previous history" or "you said A B C in the past"
                bot sends "As a chatbot I can only look at the most recent prompts you give me."

              if user sends anything not in english
                bot sends "I can only respond to requests in English. What would you like to search for?"

              if user asks to buy anything used
                bots sends "I can only search for new laptops, phones, or computers on the web. Would you like to continue searching?"
            `,
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.2,
        top_p: 0.1,
        max_tokens: 1000,
        model: modelName
      }
    });

    if (isUnexpected(response)) {
        throw response.body.error;
    }

    // TODO save chatbot response to database with user id and timestamp for history feature.
    // TODO History can be used to suggest products in Explore page

    const chatbotText = response.body.choices[0].message.content || '';
    return AIService.parseChatbotMessage(chatbotText);  
  }
  public static parseChatbotMessage(response: string): ChatbotResponse {
    const chatbotMessageMatch = response.match(/ChatbotMessage=(.*?)(\n|$)/);
    const productRequestedMatch = response.match(/ProductRequested=(.*?)(\n|$)/);
    const productQueryMatch = response.match(/ProductQuery=(.*?)(\n|$)/);

    if (debug) {
      console.log("Chatbot test: " + response);
      console.log("chatbotMessageMatch: " + chatbotMessageMatch);
      console.log("productRequestedMatch: " + productRequestedMatch);
    }

    if (!chatbotMessageMatch || !productRequestedMatch || !productQueryMatch) {
      return {
        chatbotMessage: 'No message',
        productRequested: false,
        productQuery: ""
      };
    }

    return {
      chatbotMessage: chatbotMessageMatch[1],
      productRequested: productRequestedMatch[1] === 'true',
      productQuery: productQueryMatch[1]
    };
  }
  public static async chatCompleteHuggingFace(message: string) {
  const chatCompletion = await hfClient.chatCompletion({
      provider: "fireworks-ai",
      model: "meta-llama/Llama-3.1-70B-Instruct",
      messages: [
        {
          role: "user",
          content: `
            This is what the user said: ${message}
            Give appropriate responses using this business logic. The business logic contains possible scenarios and responses. Don't explain the reasoning. 
            business instructions: 
            if user sends none/empty message, 
              bot: "What type of electronics are you looking for?"

            if user sends any synonyms of 'laptop', 'phone', 'computer' (PC, tablet, mobiles all accepted),
              bot sends one of these
                "Based on you preferences I recommend these laptops/phones/computers (compares 3-5 together). If you would like to update your preferences, just let me know",
                "I could not find anything with your preferences on the web. Let me know if you would like to change your preferences."

            if user sends something other than  'laptop', 'phone', 'computer',
              bot sends "My AI can only search for laptops, phones, and computers. Would you like to search for any of these?"

            if the user asks how the chatbot is used,
              bot sends "I can help you search for laptops, phones, or computers on the web. Would you like to do that?"

            if the user says "yes" without any context,
              bot sends "Here are all products that I found. Let me know if you'd like to narrow down your search"

            if user sends unknown command or unspecified request,
              bot sends "As a chatbot, am I unsure what to do with that request. I can help you find laptops, phones, and computers on the web."
            
            if user sends something like "Why can't I purchase or checkout"
              bot sends "You are meant to purchase via the vendor. We don't stock the items."

            if user sends anything like "update budget to X"
              bot sends "backend (updates budget to min 0, max X). I have updated your max budget to X."

            if user sends anything like "these are too expensive" or "expensive"
              bot sends "backend (updates budget to min 0, max new number). I have updated your max budget to X."

            if user sends anything like "change location to X"
              bot sends one of 
                "backend (updates store to X). You should now see products from X sites"
                "I am unable to search for products from that location."

            if user sends anything like "higher ratings" or "set ratings to 5 stars"
              bot sends "backend (updates rating to 5). You should now see products with higher ratings"

            if user sends anything like "update account information or user preference to something"
              bot sends "There is an option to update you profile. Please visit that page."

            if user sends anything like "this product is too old/slow" or "I want a specific model"
              bot sends "Our AI doesn't have the ability to search for individual items. Would you like to change your budget preferences?"

            if user sends anything like "bad products" or "bad" or "these are garbage"
              bot sends "Our AI fetches products from the web and we rely on websites to stock better products."

            if user sends a compliment like as "good", "nice" or "these products are good" or anything like this
              bots sends "We recommend you give us a 5 star rating."

            if user sends anything like "what do you sell?" or "what can I search for?"
              bots sends "I can help you find laptops, phones and computers on the web."
            
            if user sends anything referencing history like "use previous history" or "you said A B C in the past"
              bot sends "As a chatbot I can only look at the most recent prompts you give me."

            if user sends anything not in english
              bot sends "I can only respond to requests in English. What would you like to search for?"

            if user asks to buy anything used
              bots sends "I can only search for new laptops, phones, or computers on the web. Would you like to continue searching?"
          `,
        },
      ],
    });
    const chatbotResponse = chatCompletion.choices[0].message.content;
    return chatbotResponse;
  }
}