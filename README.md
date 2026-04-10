# ForexQuant Pro

**Institutional-Grade Quantitative Trading Workstation**

ForexQuant Pro is a high-performance, full-stack trading platform designed for real-time market analysis, algorithmic strategy automation, and institutional-grade backtesting.

## 🚀 Key Features

- **Quant Workstation**: Real-time pricing via WebSockets with institutional charting powered by TradingView.
- **Strategic Automator**: Multi-strategy rule engine for server-side trade execution.
- **Backtest Optimizer**: Integrated parameter sweep engine to identify and exploit market edges.
- **Dual-Layer Security**: Biometric-ready auth matrix with Google OAuth 2.0 and TOTP integration.
- **Institutional Aesthetics**: Premium glassmorphic UI with optimized blur depths and ambient animations.

## 🛠 Tech Stack

- **Backend**: Spring Boot 3.x, Java 21, Spring Security (JWT + OAuth 2.0), Hibernate/JPA.
- **Frontend**: React 18, TypeScript, Vite, TradingView Lightweight Charts, STOMP.js.
- **Infrastructure**: Docker & Docker Compose, MySQL 8.0, Nginx.

## 📦 Quick Start (Docker)

1. **Clone & Configure**: Set your environment variables in `.env`.
2. **Launch Ecosystem**:
   ```bash
   docker-compose up --build
   ```
3. **Access Platform**: 
   - Frontend: `http://localhost`
   - API: `http://localhost:8081/api`

## 🛡 Security Note
Initial registration requires TOTP setup. Ensure you have an Authenticator app ready upon first login.

---
*Built for precision. Engineered for performance.*
