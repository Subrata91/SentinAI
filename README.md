🛡️ SentinAI: Real-Time Event-Driven AI Moderation & Security Gateway
SentinAI is an enterprise-grade, event-driven microservice gateway designed to inspect unstructured text and code payloads in real time. Built with a decoupled microservice architecture using Java 21 (Spring Boot), 
Python 3.14 (VADER NLP), Aiven Apache Kafka, MongoDB Atlas, and Upstash Redis, SentinAI separates client-facing API ingestion from resource-intensive artificial intelligence inference.

🌐 Live Application Demo
🔗 Explore the SentinAI Dashboard: https://sentinai-ui.netlify.app

⚡ Architecture Overview [A detailed overview is present inside the project report]
SentinAI utilizes a hybrid fast-path caching and asynchronous message-driven pipeline:

[ Client Web UI (Netlify) ]
            │
            │ HTTP POST /api/v1/scan
            ▼
┌───────────────────────────────────────┐
│ Spring Boot API Gateway (Render Cloud) │
└──────┬────────────────────┬───────────┘
       │                    │
 1. Cache Lookup      2. Async Kafka Publish
       │                    │
       ▼                    ▼
┌──────────────┐   ┌─────────────────────────────┐
│ Upstash Redis│   │ Aiven Kafka (scan-requests) │
└──────────────┘   └──────────────┬──────────────┘
                                  │
                                  ▼
                   ┌─────────────────────────────┐
                   │ Python AI Worker (VADER NLP)│
                   └──────────────┬──────────────┘
                                  │
                            3. Save Verdict
                                  │
                                  ▼
                   ┌─────────────────────────────┐
                   │ MongoDB Atlas (scan_logs)   │
                   └─────────────────────────────┘


1. Fast-Path (Cache Hit - ~12ms): Inbound payloads are hashed using SHA-256. If a matching verdict exists in Upstash Redis, it is returned immediately.
2. Cold-Path (Async Queue - ~1.5s): Cache misses trigger an immediate HTTP 200 response with status: "PROCESSING" while publishing the event to Aiven Kafka.
3. AI Worker Inference: The Python worker consumes the event, executes rule-based threat checks and VADER sentiment analysis, caches the outcome in Redis (24h TTL), and updates MongoDB Atlas.

🛠️ Tech Stack & Infrastructure
  a. Frontend: React.js hosted on Netlify
  b. API Gateway: Java 21 LTS, Spring Boot 3, Spring Kafka, Spring Data MongoDB (Hosted on Render)
  c. AI Worker: Python 3.14, vaderSentiment, Kafka Consumer (Hosted on Render)
  d. Event Broker: Managed Apache Kafka with SASL_SSL & SCRAM-SHA-256 on Aiven Cloud
  e. Persistent Database: MongoDB Atlas (sentinai_db cluster)
  f. In-Memory Cache: Upstash Redis
  g. Containerization: Docker multi-stage builds

⚠️ Free-Tier Service Delay Notice
Important Note on Initial Latency:

  1. The backend services (sentinai-api and sentinai-ai-worker) are deployed on Render's Free Tier. 
  Free-tier web services automatically spin down into a dormant state after 15 minutes of inactivity.
  2. Cold Starts: If the service is asleep, your first scan request may take 50+ seconds while Render provisions and boots the container. 
  Subsequent requests will process in sub-2-seconds.
  3. Manual Service Wake-up: If requests continuously time out or take too long, please feel free to reach out to me directly at subrataron916@gmail.com. 
  I will manually restart the Render services to wake up the containers immediately for your testing session.

📂 Repository Structure
sentinai/
├── sentinai-api/       # Java 21 Spring Boot REST API & Kafka Producer/Consumer
├── sentinai-worker/    # Python 3.14 AI Sentiment & Threat Classifier Service
└── sentinai-ui/        # React.js Single Page Application Frontend

📜 License
This project was built and published as part of the Master of Science in Computer Science Applied Software Project capstone degree.
