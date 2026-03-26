# Multi-Layer Orchestration Platform (AI Agent Command Center)

A premium, enterprise-grade platform to launch, monitor, and control multiple AI agents working on parallel tasks with human-in-the-loop oversight, multi-tenancy, and advanced system controls.

## 0. Product Overview
- **Capabilities**: Signup, create workspace, launch AI agents, monitor tasks, approve actions, and manage billing.
- **Goal**: Full lifecycle management of autonomous and semi-autonomous agentic workflows.

---

## 1. Authentication & Multi-Tenancy
### Signup Flow
- **User** → Signup Page → Enter Details → Verify Email → Create Workspace.
- **Backend**: Password hashing (bcrypt), email verification, workspace (tenant) creation.
- **Ownership**: The first user of a workspace is assigned as the **Owner**.

### Login Flow
- **Validation**: Email/Password → JWT Token → Access Dashboard.
- **RBAC**: Owner, Admin, Operator, Viewer.
- **Isolation**: Every table follows a `workspace_id` pattern for data isolation (SaaS readiness).

---

## 2. Onboarding & Dashboard
### Onboarding
- Pre-configured agents and pre-built workflows are automatically available upon workspace creation.

### Command Centre UI
- **Overview**: Active tasks, running agents, cost/token usage.
- **Tasks**: Create new tasks, view execution history.
- **Agents**: List of agents, Status (idle/running/error).
- **Approvals**: Pending human-in-the-loop decisions.
- **Logs**: Full trace of agent actions and reasoning.

---

## 3. Core Workflow & Agent Execution
### Task Creation Flow
1. **Input**: User defines goal, constraints, and selects appropriate agents.
2. **Planner**: Task → Planner → Task Graph (DAG).
3. **Queue**: Ready tasks are pushed to a queue (Redis/Kafka).

### Agent Execution
1. **Worker**: Picks job from queue.
2. **Context**: Loads task context and memory.
3. **Run**: LLM execution + Tool usage.
4. **Memory**: 
   - **Short-term**: Redis (session-level).
   - **Long-term**: Vector DB (workspace knowledge base).
5. **Output**: Result saved and aggregated.

---

## 4. Advanced System Controls
### Intelligence Layer
- **Task States**: `pending`, `planned`, `running`, `waiting_for_approval`, `completed`, `failed`, `cancelled`.
- **Node States**: `queued`, `running`, `success`, `retrying`, `failed`, `blocked`.
- **Planner Versioning**: Track `planner_version`, `prompt_version`, and `workflow_template_id` for replays and safety.
- **Cost Control**: Real-time token tracking and budget limits per workspace.
- **Decision Logging**: Structured reasoning (`thought`, `action`, `reason`, `tool_used`) for debugging and trust.

### System Safety
- **Tool Guardrails**: Permission checks, usage limits, and parameter validation.
- **Human Approval**: Triggered by high budget spend, external actions, or low AI confidence.
- **Replanning**: Failure → Planner re-runs → New DAG generated.

---

## 5. Billing & Infrastructure
### Billing System
- **Models**: Pay-per-task or Subscription + Usage (Stripe integration).
- **Notifications**: Email, In-app alerts, Webhooks (B2B).

### Infrastructure
- **API Gateway**: Single entry point handling Auth, Routing, Rate Limiting.
- **Microservices**: Auth, Task, Agent, Billing, Notification.
- **Observability**: Real-time dashboard with "Replay System" for re-running tasks with changes.

---

## Tech Stack
- **Backend**: Node.js + Fastify + SQLite (local) / PostgreSQL (production) + Redis + OpenAI API.
- **Frontend**: Next.js 14 (App Router) + Vanilla CSS (Premium Glassmorphism).
- **Real-time**: WebSocket for live updates.
- **Infrastructure**: Queue System (Redis/Kafka), Worker Nodes, Vector DB.
