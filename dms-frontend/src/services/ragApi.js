const API_BASE_URL = '/api'
const JWT_TOKEN = import.meta.env.VITE_JWT_TOKEN

function getAuthHeaders() {
  if (!JWT_TOKEN) {
    throw new Error(
      'JWT token is not configured. Check the frontend .env file.'
    )
  }

  return {
    Accept: 'application/json, text/plain, */*',
    Authorization: `Bearer ${JWT_TOKEN}`,
  }
}

function readAnswer(payload) {
  if (typeof payload === 'string') {
    return payload.trim()
  }

  if (payload && typeof payload === 'object') {
    const answer =
      payload.answer ??
      payload.response ??
      payload.content ??
      payload.message ??
      payload.result

    if (typeof answer === 'string') {
      return answer.trim()
    }

    return JSON.stringify(payload, null, 2)
  }

  return ''
}


/* =========================================================
   GET ALL DOCUMENTS
   Backend:
   GET http://localhost:8081/documents
   Frontend:
   GET /api/documents
   ========================================================= */

export async function getDocuments() {
  const response = await fetch(
    `${API_BASE_URL}/documents`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  )

  const responseText = await response.text()

  let payload = responseText

  try {
    payload = responseText ? JSON.parse(responseText) : []
  } catch {
    // Backend should return JSON for /documents.
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        'Authentication failed. Your JWT token may be expired or invalid.'
      )
    }

    const detail =
      readAnswer(payload) ||
      response.statusText ||
      'Could not load documents.'

    throw new Error(`${response.status} — ${detail}`)
  }

  if (!Array.isArray(payload)) {
    throw new Error('The document service returned an invalid document list.')
  }

  return payload
}


/* =========================================================
   ASK QUESTION ABOUT A DOCUMENT
   Backend:
   GET http://localhost:8081/rag/ask
   Frontend:
   GET /api/rag/ask
   ========================================================= */

export async function askDocumentQuestion(documentId, question) {
  if (!documentId) {
    throw new Error('Please select a document first.')
  }

  if (!question || !question.trim()) {
    throw new Error('Please enter a question.')
  }

  const params = new URLSearchParams({
    documentId: String(documentId),
    question: question.trim(),
  })

  const response = await fetch(
    `${API_BASE_URL}/rag/ask?${params.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  )

  const responseText = await response.text()

  let payload = responseText

  try {
    payload = responseText ? JSON.parse(responseText) : ''
  } catch {
    // Backend may return plain text.
  }

  if (!response.ok) {
    const detail =
      readAnswer(payload) ||
      response.statusText ||
      'The assistant request failed.'

    if (response.status === 401) {
      throw new Error(
        'Authentication failed. Your JWT token may be expired or invalid.'
      )
    }

    throw new Error(`${response.status} — ${detail}`)
  }

  const answer = readAnswer(payload)

  if (!answer) {
    throw new Error('The assistant returned an empty answer.')
  }

  return answer
}