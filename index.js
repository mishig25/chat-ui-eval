import axios from 'axios'
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'
import { prompts } from './prompts.js'

dotenv.config()

const COMMON_REQUEST_HEADERS = {
  'Content-Type': 'application/json',
  Cookie: `${process.env.COOKIE_NAME}=${process.env.COOKIE_VALUE}`,
}

async function createConversation() {
  const response = await axios.post(
    `${process.env.CHAT_HOST}/conversation`,
    {
      model: process.env.MODEL,
    },
    {
      headers: COMMON_REQUEST_HEADERS,
    }
  )
  const { conversationId } = response.data
  return conversationId
}

async function generateMessage(prompt, conversationId, web_search, parentId) {
  try {
    const response = await axios.post(
      `${process.env.CHAT_HOST}/conversation/${conversationId}`,
      {
        id: parentId,
        inputs: prompt,
        is_retry: false,
        web_search,
        files: [],
      },
      {
        headers: COMMON_REQUEST_HEADERS,
        responseType: 'stream',
      }
    )

    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        try {
          const buffer = Buffer.from(chunk)
          const jsonString = buffer.toString()
          const jsonChunk = JSON.parse(jsonString)
          const { type, text } = jsonChunk
          if (type === 'finalAnswer') {
            resolve(text)
          }
        } catch (err) {
          // console.error(err)
        }
      })

      response.data.on('end', () => {
        resolve(null) // You can choose to resolve with a default value or reject if the expected result was not received
      })

      response.data.on('error', (error) => {
        reject(error) // If there's an error while streaming, reject the promise
      })
    })
  } catch (error) {
    console.error(
      `Error ${error.response.status}: ${error.response.statusText}`
    )
    throw error // Re-throw the error so it can be handled by the caller if needed
  }
}

async function generateWithWebSearch(prompt) {
  const conversationId = await createConversation()

  const options = {
    headers: COMMON_REQUEST_HEADERS,
  }
  const response = await axios.get(
    `${process.env.CHAT_HOST}/api/conversation/${conversationId}`,
    options
  )
  const parentId = response.data.messages[0].id

  const webSearch = true
  const generatedText = await generateMessage(
    prompt,
    conversationId,
    webSearch,
    parentId
  )
  return generatedText.trim()
}

const generations = []
const filePath = `data/${process.env.EXPERIMENT_ID}/${process.env.CHAT_UI_BRANCH_NAME}.json`

for (const testPrompt of prompts) {
  const { question, answer } = testPrompt
  console.log(question)

  const generation = await generateWithWebSearch(question)
  generations.push({
    prompt: question,
    answer,
    generation,
  })

  const dirname = path.dirname(filePath)
  await fs.mkdir(dirname, { recursive: true })

  await fs.writeFile(filePath, JSON.stringify(generations, null, 2))
}

console.log('Wrote results to file', filePath)
