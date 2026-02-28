# 🎯 TalonHire

**AI-powered recruitment platform connecting Brazilian developers with European companies**

## 🚀 Vision
Revolutionize tech recruitment with AI mass matching, creating perfect connections between Brazilian talent and European opportunities.

## ✨ Key Features
- **AI Mass Matching**: 95%+ accuracy matching algorithm
- **Cross-border Compliance**: Automated visa & legal processing
- **Cultural Fit Analysis**: AI-powered cultural compatibility scoring
- **End-to-End Automation**: From discovery to onboarding
- **Real-time Market Intelligence**: Salary trends, skill demand analytics

## 🏗️ Architecture
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: FastAPI (Python) + PostgreSQL + Redis
- **AI/ML**: TensorFlow/PyTorch + OpenAI/Cohere embeddings
- **Infrastructure**: Vercel (frontend), Railway (backend), Pinecone (vector DB)
- **Monitoring**: Sentry, Datadog, PostHog

## 📁 Project Structure
```
talonhire/
├── frontend/                 # Next.js application
├── backend/                  # FastAPI + PostgreSQL
├── ai/                       # ML models & embeddings
├── ops/                      # Infrastructure & deployment
├── docs/                     # Documentation
└── .github/                  # CI/CD workflows
```

## 🎯 Target Market
- **Supply**: 500,000+ Brazilian developers
- **Demand**: European tech companies (Portugal → EU expansion)
- **Revenue Model**: 15% placement fee + 40% markup on services
- **Projection**: €1.6M Year 1, €4.15M Year 2, €8.6M Year 3

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- OpenAI API key

### Quick Start
```bash
# Clone repository
git clone https://github.com/lrs2805/talonhire.git
cd talonhire

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install

# Environment setup
cp .env.example .env.local
# Configure your environment variables

# Run development
npm run dev           # Frontend
python app.py         # Backend
```

## 🔧 Tech Stack

### Frontend
- **Framework**: Next.js 15 + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod

### Backend
- **API**: FastAPI (Python)
- **Database**: PostgreSQL + SQLAlchemy
- **Cache**: Redis
- **Search**: Elasticsearch
- **Queue**: Celery + RabbitMQ

### AI/ML
- **Frameworks**: TensorFlow, PyTorch
- **NLP**: spaCy, Transformers
- **Embeddings**: OpenAI, Cohere
- **Vector DB**: Pinecone, Weaviate

### Infrastructure
- **Hosting**: Vercel (frontend), Railway (backend)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry, Datadog
- **Analytics**: PostHog, Mixpanel

## 📊 Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost/talonhire
REDIS_URL=redis://localhost:6379

# AI Services
OPENAI_API_KEY=your_openai_key
COHERE_API_KEY=your_cohere_key
PINECONE_API_KEY=your_pinecone_key

# Authentication
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
LINKEDIN_CLIENT_ID=your_linkedin_client_id

# Services
STRIPE_SECRET_KEY=your_stripe_key
SENDGRID_API_KEY=your_sendgrid_key
```

## 🤝 Contributing
We use a team of specialized AI agents for development:
- **TAKUMI ARATA**: Tech Lead & Development
- **ARI KATSUO**: System Architecture
- **BUNGŌ SAKKA**: AI Engineering
- **KODO TAKARA**: Process Optimization
- **SAM MAVERICK**: Growth & Marketing

## 📄 License
Proprietary - All rights reserved.

## 📞 Contact
- **Website**: [talonhire.com](https://talonhire.com) (coming soon)
- **Email**: contact@talonhire.com
- **LinkedIn**: [TalonHire](https://linkedin.com/company/talonhire)

---

**Building the future of global tech recruitment with AI** ⚡