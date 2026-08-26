import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  askDocumentQuestion,
  getDocuments,
} from './services/ragApi'

const currentUser = {
  id: 1,
  name: 'User 1',
  role: 'MANAGER',
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'documents', label: 'Documents', icon: '▤' },
  { id: 'upload', label: 'Upload Document', icon: '↥' },
  { id: 'assistant', label: 'AI Assistant', icon: '✦' },
  { id: 'my-documents', label: 'My Documents', icon: '▯' },
]

const adminItems = [
  { id: 'users', label: 'Users', icon: '♧' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

const fallbackDocuments = [
  {
    id: 1,
    name: 'Aditya IG certificate.pdf',
    filePath: 'uploads/Aditya IG certificate.pdf',
  },
  {
    id: 4,
    name: 'Adityaoptcl front.pdf',
    filePath: 'uploads/Adityaoptcl front.pdf',
  },
  {
    id: 8,
    name: 'Aditya optcl content.pdf',
    filePath: 'uploads/Aditya optcl content.pdf',
  },
]

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function App() {
  const [activePage, setActivePage] = useState('dashboard')

  const [documents, setDocuments] = useState([])
  const [documentsLoading, setDocumentsLoading] = useState(true)
  const [documentsError, setDocumentsError] = useState('')

  const [selectedDocumentIds, setSelectedDocumentIds] = useState([])

  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loadingAnswer, setLoadingAnswer] = useState(false)
  const [assistantError, setAssistantError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')

  const [selectedFile, setSelectedFile] = useState(null)

  const inputRef = useRef(null)

  /*
   * Load real documents from Spring Boot.
   */
  useEffect(() => {
    async function loadDocuments() {
      setDocumentsLoading(true)
      setDocumentsError('')

      try {
        const result = await getDocuments()

        // Ignore malformed database records such as id=3 with no name.
        const validDocuments = result.filter(
          (document) =>
            document &&
            document.id != null &&
            document.name
        )

        setDocuments(validDocuments)

        // Automatically select the first real document.
        if (validDocuments.length > 0) {
          setSelectedDocumentIds([validDocuments[0].id])
        }
      } catch (error) {
        console.error('Could not load documents:', error)
        setDocumentsError(
          error.message || 'Could not load documents from the backend.'
        )

        // Keep the UI usable if the backend temporarily fails.
        setDocuments(fallbackDocuments)
      } finally {
        setDocumentsLoading(false)
      }
    }

    loadDocuments()
  }, [])

  const filteredDocuments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    if (!term) {
      return documents
    }

    return documents.filter((document) =>
      document.name.toLowerCase().includes(term)
    )
  }, [documents, searchTerm])

  /*
   * Toggle a real database document.
   */
  function toggleDocument(documentId) {
    setSelectedDocumentIds((current) => {
      if (current.includes(documentId)) {
        return current.filter((id) => id !== documentId)
      }

      return [...current, documentId]
    })

    setAssistantError('')
  }

  /*
   * Main RAG request.
   */
  async function submitQuestion(questionToSubmit = question) {
    const cleanQuestion = questionToSubmit.trim()

    if (!cleanQuestion) {
      return
    }

    if (selectedDocumentIds.length === 0) {
      setAssistantError(
        'Please select at least one document before asking a question.'
      )
      return
    }

    if (loadingAnswer) {
      return
    }

    const documentId = selectedDocumentIds[0]

    const selectedDocument = documents.find(
      (document) => document.id === documentId
    )

    setAssistantError('')
    setLoadingAnswer(true)

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        type: 'user',
        text: cleanQuestion,
      },
    ])

    setQuestion('')

    try {
      const answer = await askDocumentQuestion(
        documentId,
        cleanQuestion
      )

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          type: 'assistant',
          text: answer,
          documentName: selectedDocument?.name || 'Selected document',
        },
      ])
    } catch (error) {
      console.error('RAG request failed:', error)

      setAssistantError(
        error.message ||
          'Could not get an answer from the document service.'
      )
    } finally {
      setLoadingAnswer(false)

      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }

  function handleQuestionKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submitQuestion()
    }
  }

  function handleSuggestedQuestion(text) {
    setQuestion(text)
    submitQuestion(text)
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  function navigate(page) {
    setActivePage(page)
  }

  function renderDashboard() {
    return (
      <PageLayout
        eyebrow="MONDAY, AUGUST 24, 2026"
        title={`Good morning, ${currentUser.name}`}
        subtitle="Here’s what’s happening across your document workspace today."
        actions={
          <>
            <button
              className="btn btn-light dms-action-button"
              onClick={() => navigate('upload')}
            >
              ↥ &nbsp; Upload document
            </button>

            <button
              className="btn btn-primary dms-action-button"
              onClick={() => navigate('assistant')}
            >
              ✦ &nbsp; Ask AI
            </button>
          </>
        }
      >
        <div className="stats-grid">
          <StatCard
            icon="▤"
            number={documents.length}
            label="Total documents"
          />

          <StatCard
            icon="↥"
            number="—"
            label="Uploaded recently"
          />

          <StatCard
            icon="▱"
            number="—"
            label="Storage used"
          />

          <StatCard
            icon="✦"
            number={messages.filter((m) => m.type === 'user').length}
            label="AI queries"
          />
        </div>

        <div className="dashboard-grid">
          <section className="dms-card recent-card">
            <div className="card-header-row">
              <div>
                <div className="card-eyebrow">WORKSPACE ACTIVITY</div>
                <h3>Recent documents</h3>
              </div>

              <button
                className="link-button"
                onClick={() => navigate('documents')}
              >
                View all →
              </button>
            </div>

            <div className="document-table">
              {documents.slice(0, 6).map((document) => (
                <div className="document-row" key={document.id}>
                  <div className="document-icon">PDF</div>

                  <div className="document-main">
                    <strong>{document.name}</strong>
                    <span>Document ID: {document.id}</span>
                  </div>

                  <div className="document-owner">
                    {document.owner?.name || currentUser.name}
                  </div>
                </div>
              ))}

              {!documents.length && !documentsLoading && (
                <div className="empty-state">
                  No documents found.
                </div>
              )}
            </div>
          </section>

          <section className="dms-card">
            <div className="card-eyebrow">DOCUMENT INTELLIGENCE</div>
            <h3>Ask questions about your documents</h3>

            <p className="muted-text">
              Select a document and use the AI Assistant to ask
              questions grounded in its contents.
            </p>

            <button
              className="btn btn-primary"
              onClick={() => navigate('assistant')}
            >
              Open AI Assistant →
            </button>
          </section>
        </div>
      </PageLayout>
    )
  }

  function renderDocuments() {
    return (
      <PageLayout
        eyebrow="WORKSPACE"
        title="Documents"
        subtitle="Browse the documents available in your workspace."
      >
        {documentsError && (
          <div className="alert alert-warning">
            {documentsError}
          </div>
        )}

        <section className="dms-card">
          <div className="card-header-row">
            <div>
              <div className="card-eyebrow">DOCUMENT LIBRARY</div>
              <h3>Your documents</h3>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => navigate('upload')}
            >
              Upload document
            </button>
          </div>

          <div className="document-search">
            <span>⌕</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search documents..."
            />
          </div>

          {documentsLoading ? (
            <div className="loading-state">
              Loading documents...
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="empty-state">
              No documents match your search.
            </div>
          ) : (
            <div className="document-list">
              {filteredDocuments.map((document) => (
                <div className="document-list-row" key={document.id}>
                  <div className="document-icon">PDF</div>

                  <div className="document-main">
                    <strong>{document.name}</strong>
                    <span>
                      ID: {document.id} ·{' '}
                      {document.owner?.name || currentUser.name}
                    </span>
                  </div>

                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => {
                      setSelectedDocumentIds([document.id])
                      navigate('assistant')
                    }}
                  >
                    Ask AI
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </PageLayout>
    )
  }

  function renderAssistant() {
    return (
      <PageLayout
        eyebrow="DOCUMENT INTELLIGENCE"
        title="AI Assistant"
        subtitle="Ask questions about your documents and get answers grounded in your workspace."
        actions={
          <span className="assistant-status">
            <span className="status-dot" />
            Ready to assist
          </span>
        }
      >
        <div className="assistant-layout">
          <section className="dms-card assistant-card">
            <div className="assistant-header">
              <div className="assistant-avatar">✦</div>

              <div>
                <strong>DocuVault Assistant</strong>
                <span>
                  Grounded in your selected documents
                </span>
              </div>
            </div>

            <div className="conversation-area">
              {messages.length === 0 && !loadingAnswer ? (
                <div className="assistant-empty">
                  <div className="assistant-empty-icon">✦</div>

                  <h2>What can I help you find?</h2>

                  <p>
                    Ask a question about your document library.
                    I’ll cite the source file used for each answer.
                  </p>

                  <div className="suggested-questions">
                    <button
                      onClick={() =>
                        handleSuggestedQuestion(
                          'What changed in the latest financial results?'
                        )
                      }
                    >
                      What changed in the latest financial results?
                    </button>

                    <button
                      onClick={() =>
                        handleSuggestedQuestion(
                          'Summarize the selected document.'
                        )
                      }
                    >
                      Summarize the selected document.
                    </button>
                  </div>
                </div>
              ) : (
                <div className="messages">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${
                        message.type === 'user'
                          ? 'message-user'
                          : 'message-assistant'
                      }`}
                    >
                      <div className="message-label">
                        {message.type === 'user'
                          ? currentUser.name
                          : 'DocuVault Assistant'}
                      </div>

                      <div className="message-content">
                        {message.text}
                      </div>

                      {message.documentName && (
                        <div className="message-source">
                          Source: {message.documentName}
                        </div>
                      )}
                    </div>
                  ))}

                  {loadingAnswer && (
                    <div className="message message-assistant">
                      <div className="message-label">
                        DocuVault Assistant
                      </div>

                      <div className="message-content">
                        <span className="typing-indicator">
                          <span />
                          <span />
                          <span />
                        </span>
                        Thinking...
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {assistantError && (
              <div className="assistant-error">
                <span>?</span>
                {assistantError}
              </div>
            )}

            <div className="assistant-input-wrapper">
              <input
                ref={inputRef}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={handleQuestionKeyDown}
                disabled={loadingAnswer}
                placeholder="Ask anything about your documents..."
              />

              <button
                className="send-button"
                onClick={() => submitQuestion()}
                disabled={
                  loadingAnswer || !question.trim()
                }
                title="Send question"
              >
                {loadingAnswer ? '...' : '➤'}
              </button>
            </div>
          </section>

          <section className="dms-card selected-documents-card">
            <div className="card-eyebrow">SEARCH SCOPE</div>

            <h3>Selected documents</h3>

            <p className="muted-text">
              Choose the files the assistant can use for its
              answer.
            </p>

            {documentsLoading ? (
              <div className="loading-state">
                Loading documents...
              </div>
            ) : documents.length === 0 ? (
              <div className="empty-state">
                No documents available.
              </div>
            ) : (
              <div className="selected-document-list">
                {documents.map((document) => (
                  <label
                    className="selected-document-row"
                    key={document.id}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocumentIds.includes(
                        document.id
                      )}
                      onChange={() =>
                        toggleDocument(document.id)
                      }
                    />

                    <div className="document-icon small">
                      PDF
                    </div>

                    <span>{document.name}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="selection-footer">
              {selectedDocumentIds.length} selected
            </div>
          </section>
        </div>
      </PageLayout>
    )
  }

  function renderUpload() {
    return (
      <PageLayout
        eyebrow="WORKSPACE"
        title="Upload Document"
        subtitle="Add a document to your workspace."
      >
        <section className="dms-card upload-card">
          <div className="upload-dropzone">
            <div className="upload-icon">↥</div>

            <h3>Select a document</h3>

            <p>
              Choose a file from your computer. Backend upload
              will be connected next.
            </p>

            <label className="btn btn-primary">
              Choose file
              <input
                type="file"
                hidden
                onChange={handleFileChange}
              />
            </label>

            {selectedFile && (
              <div className="selected-file">
                <strong>{selectedFile.name}</strong>
                <span>
                  {formatFileSize(selectedFile.size)}
                </span>
              </div>
            )}
          </div>
        </section>
      </PageLayout>
    )
  }

  function renderPlaceholder(title, subtitle) {
    return (
      <PageLayout
        eyebrow="WORKSPACE"
        title={title}
        subtitle={subtitle}
      >
        <section className="dms-card placeholder-page">
          <div className="assistant-empty">
            <div className="assistant-empty-icon">✦</div>
            <h2>{title}</h2>
            <p>
              This section is ready for its backend integration.
            </p>
          </div>
        </section>
      </PageLayout>
    )
  }

  function renderCurrentPage() {
    switch (activePage) {
      case 'documents':
        return renderDocuments()

      case 'upload':
        return renderUpload()

      case 'assistant':
        return renderAssistant()

      case 'my-documents':
        return renderDocuments()

      case 'users':
        return renderPlaceholder(
          'Users',
          'Manage workspace users and their roles.'
        )

      case 'settings':
        return renderPlaceholder(
          'Settings',
          'Configure your document workspace.'
        )

      case 'dashboard':
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="dms-app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">▣</div>

          <div>
            <strong>DocuVault</strong>
            <span>Document workspace</span>
          </div>
        </div>

        <div className="workspace-selector">
          <div className="workspace-avatar">AC</div>

          <div>
            <span>Workspace</span>
            <strong>Acme Corporation</strong>
          </div>

          <span className="workspace-arrow">⌄</span>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-heading">WORKSPACE</div>

          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${
                activePage === item.id ? 'active' : ''
              }`}
              onClick={() => navigate(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>

              {item.id === 'assistant' && (
                <span className="new-badge">NEW</span>
              )}
            </button>
          ))}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-heading">ADMINISTRATION</div>

          {adminItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${
                activePage === item.id ? 'active' : ''
              }`}
              onClick={() => navigate(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="storage-label">
            <span>Storage</span>
            <span>68.4 / 100 GB</span>
          </div>

          <div className="storage-bar">
            <div />
          </div>

          <div className="current-user">
            <div className="user-avatar">
              {getInitials(currentUser.name)}
            </div>

            <div>
              <strong>{currentUser.name}</strong>
              <span>{currentUser.role}</span>
            </div>

            <span className="user-menu">•••</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span>›</span>
            <strong>
              {navItems
                .concat(adminItems)
                .find((item) => item.id === activePage)?.label ||
                'Dashboard'}
            </strong>
          </div>

          <div className="topbar-actions">
            <div className="top-search">
              <span>⌕</span>

              <input
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                onFocus={() => navigate('documents')}
                placeholder="Search documents..."
              />
            </div>

            <div className="notification">♧</div>

            <div className="top-user">
              <div className="user-avatar small">
                {getInitials(currentUser.name)}
              </div>

              <span>{currentUser.name}</span>
              <span>⌄</span>
            </div>
          </div>
        </header>

        <div className="page-content">
          {renderCurrentPage()}
        </div>
      </main>
    </div>
  )
}

function PageLayout({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="page-eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {actions && (
          <div className="page-actions">{actions}</div>
        )}
      </div>

      {children}
    </>
  )
}

function StatCard({ icon, number, label }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <div className="stat-number">{number}</div>

      <div className="stat-label">{label}</div>
    </div>
  )
}

export default App