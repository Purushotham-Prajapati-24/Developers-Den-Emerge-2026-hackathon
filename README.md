<div align="center">
  <h1>🚀 Emerge - Developer's Den</h1>
  <p><h3>The Kinetic Forge for Collaborative Engineering</h3></p>
</div>

[![Maintained: Yes](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/Purushotham-Prajapati-24/Emerge-2026/graphs/commit-activity)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

**Developer's Den** is a high-performance, cloud-based collaborative IDE engineered for 100+ simultaneous users. 
It bridges the gap between raw CLI power and modern creative fluidity.

[**Explore the Docs**](./docs/archive) • [**GitHub Workflow**](./GITHUB.md) • [**Request Feature**](https://github.com/Purushotham-Prajapati-24/Emerge-2026/issues)

</div>

---

## 🏗️ The Engineering Blueprint

Our architecture is designed for **Laminar Flow Synchronization**. We utilize Yjs (CRDT) over WebSockets to ensure conflict-free editing even at high concurrency.

```mermaid
graph TD
    subgraph Client_Layer [Frontend: Kinetic Terminal]
        Editor[Monaco Editor]
        Context[Context Engine]
        Terminal[Kinetic Terminal]
    end

    subgraph Sync_Layer [Orchestration]
        Socket[Socket.IO Server]
        YJS[Yjs Shared Types]
    end

    subgraph Service_Layer [Intelligence & Execution]
        AI[Groq LPU Architect]
        Docker[Sandboxed Runtimes]
    end

    Editor <-->|CRDT Diffs| YJS
    YJS <--> Socket
    Context -->|Focused Window| AI
    Terminal -->|Forensic Logs| AI
    Editor -->|Run Code| Docker
```

---

## ⚡ Live Visual Tour

Experience the **Kinetic Terminal** in action. Our interface is designed for focus, utilizing deep tonal shifts and glassmorphism.

| **The Workspace** | **AI Architect** |
| :---: | :---: |
| ![Workspace](frontend/public/assets/showcase/workspace.png) | ![Architect](frontend/public/assets/showcase/ai_architect.png) |
| *Real-time collaborative editor* | *Context-aware engineering assistant* |

| **Project Dashboard** | **Multiplayer Chat** |
| :---: | :---: |
| ![Dashboard](frontend/public/assets/showcase/dashboard.png) | ![Chat](frontend/public/assets/showcase/chat.png) |
| *Team project management* | *Laminar sync communication* |

---


## 💎 Premium Features

| Feature | Description | Implementation |
| :--- | :--- | :--- |
| **Project Shadow** | Global session memory tracking recent files. | `useCollaborationStore` + Yjs |
| **Hyper-Focus** | AI context limited to ±50 lines for precision. | Dynamic Buffer Interceptor |
| **Forensic Debug** | Root-cause analysis of terminal outputs. | `/debug` Command Parser |
| **Multiplayer Cursor** | Real-time presence with user flags. | Socket.io Presence API |
| **Laminar Sync** | 100+ concurrent user support. | Yjs CRDT + WebSocket |

---

## 🛠️ The Tech Forge

<div align="center">

| Frontend | Backend | Database | AI & Auth |
| :---: | :---: | :---: | :---: |
| <img src="https://cdn.simpleicons.org/react/61DAFB" width="40" height="40" alt="React" /> | <img src="https://cdn.simpleicons.org/nodedotjs/339933" width="40" height="40" alt="Node" /> | <img src="https://cdn.simpleicons.org/mongodb/47A248" width="40" height="40" alt="MongoDB" /> | <img src="https://cdn.simpleicons.org/clerk/6C47FF" width="40" height="40" alt="Clerk" /> |
| **React 19** | **Express** | **MongoDB** | **Clerk** |
| [Vite](https://vitejs.dev/) | [Socket.io](https://socket.io/) | [Atlas](https://www.mongodb.com/atlas) | [Groq LPU](https://groq.com/) |

</div>

---

## 📡 REST API Documentation

### Project Management
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/projects` | Initialize a new collaborative project. | ✅ |
| `GET` | `/api/projects` | Fetch all projects for the active user. | ✅ |
| `GET` | `/api/projects/:id` | Open a specific project workspace. | ✅ |
| `POST` | `/api/projects/:id/invite` | Invite a collaborator via email. | ✅ |
| `POST` | `/api/projects/:id/deploy` | Push project to Vercel/Production. | ✅ |

### Intelligence & Execution
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/chat` | Query the Architect with context. | ✅ |
| `POST` | `/api/execution` | Execute code in isolated sandbox. | ✅ |

---

## 🚀 Installation & Setup

### Environment Checklist
Create `.env` files in both directories following this schema:

| Variable | Source | Purpose |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas | Data persistence. |
| `GROQ_API_KEY` | Groq Console | Intelligence Engine. |
| `CLERK_PUBLISHABLE_KEY` | Clerk Dash | OAuth & Identity. |
| `JWT_SECRET` | Manual | Session signing. |

### Terminal Jumpstart
```bash
# 1. Setup Backend
cd backend && npm install && npm run dev

# 2. Setup Frontend
cd frontend && npm install && npm run dev
```

---

## 🧬 Project Structure

```text
Emerge/
├── backend/              # Node.js Express Server
│   ├── src/controllers/  # Business Logic
│   ├── src/services/     # AI & Execution Logic
│   └── src/routes/       # API Definitions
├── frontend/             # React (Vite) Client
│   ├── src/features/     # Modular Components (AI, Editor)
│   ├── src/store/        # Zustand State Management
│   └── src/hooks/        # Specialized Logic (Real-time)
└── docs/archive/         # Technical Specifications
```

---

## 🤝 Contributing
Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feat/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feat/AmazingFeature`)
5. Open a Pull Request

---
<div align="center">
Built for the 2026 Hackathon Showcase.  
© 2026 Developer's Den Team.  
</div>
