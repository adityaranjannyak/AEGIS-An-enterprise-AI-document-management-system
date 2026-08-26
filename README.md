# AEGIS — AI-Enhanced Governance & Information Security

AEGIS (AI-Enhanced Governance & Information Security) is a full-stack enterprise document management system designed to securely store, organize, manage, and control access to enterprise documents. It provides secure JWT-based authentication, role-based access control, document-level permissions, user and role management, document search and filtering, metadata management, activity and audit tracking, notifications, and protected API endpoints. The system is built using React, Spring Boot, Spring Security, JPA/Hibernate, REST APIs, and a relational database, with a focus on secure document governance and controlled access to enterprise information.

AEGIS also integrates an AI-powered document assistant using Retrieval-Augmented Generation (RAG), allowing users to interact with their documents through natural-language questions. Uploaded documents are processed through PDF text extraction, text chunking, embedding generation, vector storage, and semantic retrieval before relevant context is provided to the language model. The AI chatbot uses this retrieved context to generate document-grounded responses, while Ollama provides local LLM and embedding capabilities. This combines enterprise document governance and information security with AI-assisted document discovery and knowledge retrieval.

---

## Features

### Authentication & Security

- Secure JWT-based authentication
- Spring Security integration
- Role-based access control (RBAC)
- Document-level permissions
- Protected REST API endpoints
- Access-denied handling
- Configurable JWT signing secret
- Secure separation of application secrets from source control

### Document Management

- Document upload and management
- Document-level permission management
- Document search and filtering
- Document metadata management
- Secure document retrieval
- PDF text extraction
- Document organization and management

### User & Role Management

- User management
- Role management
- Role-based authorization
- Permission management
- User profile and settings
- Controlled access to administrative functionality

### Activity & Notifications

- Activity tracking
- Audit-oriented activity records
- Document activity tracking
- User activity tracking
- System notifications

### AI-Powered Document Assistant

- AI-powered document chatbot
- Retrieval-Augmented Generation (RAG)
- Natural-language document queries
- PDF text extraction
- Intelligent text chunking
- Vector embeddings
- Semantic document retrieval
- Context-aware question answering
- Ollama-based local LLM integration
- Ollama-based embedding generation

---

# Technology Stack

## Backend

- Java
- Spring Boot
- Spring Security
- Spring Data JPA / Hibernate
- REST APIs
- JWT Authentication
- Maven

## Frontend

- React
- JavaScript
- HTML5
- CSS3
- Vite

## AI / RAG

- Retrieval-Augmented Generation (RAG)
- Ollama
- LLM integration
- Text embeddings
- Semantic retrieval
- PDF text extraction
- Document chunking

## Database

- Relational database
- JPA / Hibernate
- Separate database configuration for application and RAG data

## Development & Tools

- Git
- GitHub
- Postman
- Maven
- npm

---

# System Architecture

AEGIS follows a layered full-stack architecture separating the presentation, application, security, persistence, and AI layers.

```text
                         ┌───────────────────────┐
                         │       React UI        │
                         │       Frontend        │
                         └───────────┬───────────┘
                                     │
                                  REST APIs
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │     Spring Boot       │
                         │       Backend         │
                         ├───────────────────────┤
                         │ Controllers            │
                         │ Services               │
                         │ Security / JWT         │
                         │ Repositories           │
                         └───────────┬─────┬──────┘
                                     │     │
                      ┌──────────────┘     └──────────────┐
                      ▼                                   ▼
             ┌─────────────────┐                 ┌──────────────────┐
             │   Application   │                 │    RAG Pipeline  │
             │    Database     │                 │                  │
             └─────────────────┘                 │ PDF Extraction   │
                                                 │ Chunking         │
                                                 │ Embeddings       │
                                                 │ Retrieval        │
                                                 │ LLM Generation   │
                                                 └──────────────────┘
```

---

# AI & RAG Pipeline

AEGIS integrates an AI-powered document assistant based on Retrieval-Augmented Generation.

The RAG pipeline processes uploaded documents and retrieves relevant information before generating an answer. This allows the AI assistant to provide responses grounded in the available document content rather than relying solely on the language model's general knowledge.

```text
                  Document Upload
                        │
                        ▼
              PDF Text Extraction
                        │
                        ▼
                 Text Chunking
                        │
                        ▼
              Embedding Generation
                        │
                        ▼
                 Vector Storage
                        │
                        ▼
               Semantic Retrieval
                        │
                        ▼
               Relevant Context
                        │
                        ▼
                       LLM
                        │
                        ▼
              Context-Aware Answer
```

### RAG Flow

1. **Document Upload**  
   A user uploads a document into the system.

2. **PDF Text Extraction**  
   Text is extracted from supported PDF documents.

3. **Text Chunking**  
   Extracted content is divided into smaller chunks for efficient retrieval.

4. **Embedding Generation**  
   Document chunks are converted into vector embeddings.

5. **Vector Storage**  
   Embeddings and associated document information are stored for retrieval.

6. **Semantic Retrieval**  
   When a user asks a question, the system searches for the most relevant document chunks.

7. **Context Construction**  
   Relevant chunks are provided to the language model as contextual information.

8. **LLM Generation**  
   The language model generates a response based on the retrieved document context.

---

# Security Architecture

Security is a core component of AEGIS.

The system implements multiple layers of application and document security:

- JWT-based authentication
- Spring Security
- Role-based authorization
- Document-level permissions
- Protected API endpoints
- Access-denied handling
- Configurable JWT signing secret
- Controlled administrative access
- Separation of sensitive configuration from source control

Sensitive configuration such as database credentials, JWT secrets, and environment-specific settings is intentionally excluded from the repository.

> **Do not commit real credentials, JWT secrets, database passwords, API keys, or other sensitive configuration to Git.**

---

# Project Structure

```text
Enterprise-AI-Document-Management-System/
│
├── DMS/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/aditya/DMS/
│   │   │   │       ├── config/
│   │   │   │       ├── controller/
│   │   │   │       ├── entity/
│   │   │   │       ├── repository/
│   │   │   │       └── service/
│   │   │   │
│   │   │   └── resources/
│   │   │       └── application.properties.example
│   │   │
│   │   └── test/
│   │
│   └── pom.xml
│
├── dms-frontend/
│   ├── public/
│   ├── screenshots/
│   ├── src/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── package.json
│   └── vite.config.js
│
└── .gitignore
```

---

# Running Locally

## Prerequisites

Make sure the following are installed:

- Java
- Maven
- Node.js
- npm
- A relational database
- Ollama, if using the local AI/RAG functionality

---

## Backend

Navigate to the backend directory:

```bash
cd DMS
```

Configure the local application properties using:

```text
DMS/src/main/resources/application.properties.example
```

Create:

```text
DMS/src/main/resources/application.properties
```

and configure the required database, security, and AI/RAG settings.

### Run the Backend

On Linux/macOS:

```bash
./mvnw spring-boot:run
```

On Windows:

```bash
mvnw.cmd spring-boot:run
```

---

## Frontend

Open another terminal and navigate to the frontend:

```bash
cd dms-frontend
```

Install the dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Vite will provide the frontend URL in the terminal.

---

# Configuration

The repository contains example configuration files for environment-specific settings.

For the backend, create:

```text
DMS/src/main/resources/application.properties
```

using:

```text
DMS/src/main/resources/application.properties.example
```

Configure the required:

- Database connection
- JWT configuration
- Application settings
- Ollama configuration
- RAG-related settings

Do not commit real credentials or secrets.

---

# Future Enhancements

Potential future improvements include:

- Cloud deployment
- Object-storage integration
- Advanced document versioning
- More sophisticated semantic search
- Additional LLM providers
- Automated document classification
- OCR support for scanned documents
- Enterprise-scale observability and monitoring
- Advanced document analytics
- Scalable vector database integration
- Multi-tenant enterprise support

---

# Project Status

**AEGIS is an ongoing project.**

The current implementation provides core document management, authentication, authorization, document permissions, activity tracking, user management, and AI/RAG functionality. Further improvements and production-oriented capabilities are planned.

---

# Author

**Aditya Ranjan**

GitHub: [@adityaranjannyak](https://github.com/adityaranjannyak)

---

# Acknowledgements

AEGIS was developed as a full-stack software engineering project combining enterprise application development, secure backend architecture, modern frontend development, and AI-powered document retrieval.

The project integrates:

**React + Spring Boot + Spring Security + JPA/Hibernate + JWT + RAG + Ollama + Relational Database**

into a unified enterprise document management and information security platform.
