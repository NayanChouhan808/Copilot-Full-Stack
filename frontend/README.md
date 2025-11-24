# Code Generation Copilot - Frontend

A modern, full-featured code generation interface built with Next.js 15, React, TypeScript, and TailwindCSS. Supports both mock API (template-based) and real AI generation (Google Gemini API) modes.

## 🚀 Live Demo
**Frontend (Vercel):** https://copilot-lb5e.vercel.app  
**Backend (Render):** https://copilot-axgr.onrender.com  
**GitHub Frontend:** https://github.com/Arpitkushwahaa/Copilot-Frontend  
**GitHub Backend:** https://github.com/Arpitkushwahaa/Copilot-Backend

## ✨ Features Implemented

### Core Requirements
- ✅ **React/Next.js**: Built with Next.js 15 and React 18
- ✅ **Prompt Input Box**: Multi-line textarea for code requests
- ✅ **Generate Button**: Triggers mock API with loading state
- ✅ **Code Output Box**: Syntax-highlighted code display with `react-syntax-highlighter`
- ✅ **Clean UI**: Minimal design with TailwindCSS
- ✅ **Responsive Layout**: Prompt on left, code output on right (mobile-friendly)
- ✅ **Good Typography**: Optimized spacing and readability
- ✅ **TypeScript**: 100% TypeScript codebase

### Backend API Options
- ✅ **Mode 1 - Mock API** (Next.js API Route): Template-based code generation
  - Smart keyword matching for appropriate templates
  - 7 programming languages with multiple templates each
  - No external dependencies or API costs
  - Instant response (~100ms)
- ✅ **Mode 2 - Real AI Backend** (Express.js + PostgreSQL + Gemini AI):
  - Google Gemini 2.5 Flash model for code generation
  - PostgreSQL database for storing generation history
  - RESTful API with Express.js
  - Deployed on Render with production database

### Bonus Features (All Implemented!)
- ✅ **Language Selector**: Dropdown with 7 languages
- ✅ **Prompt History**: LocalStorage persistence with timestamps
- ✅ **Search/Filter History**: Real-time search through past prompts
- ✅ **Copy to Clipboard**: One-click code copying
- ✅ **Theme Toggle**: Light/Dark mode with system preference detection
- ✅ **Font Size Controls**: Adjustable code display size
- ✅ **Favorite Prompts**: Star/unstar prompts for quick access
- ✅ **Regenerate Code**: Quickly regenerate from history
- ✅ **Loading Animations**: Smooth loading indicators
- ✅ **Error Handling**: User-friendly error messages

## 🏗️ Architecture & Design Decisions

### Technology Stack

**Frontend:**
```
Framework: Next.js 15.5.6 (App Router)
UI Library: React 18
Language: TypeScript
Styling: TailwindCSS 3.4
Syntax Highlighting: react-syntax-highlighter
State Management: React Context API
Storage: Browser LocalStorage
```

**Backend (Optional - for AI mode):**
```
Runtime: Node.js with Express.js
Database: PostgreSQL (Render)
AI Provider: Google Gemini 2.5 Flash
ORM: Native pg library
Hosting: Render.com
```

### Key Design Decisions

1. **Next.js API Routes for Mock Backend**
   - Eliminates need for separate Express server
   - Simplifies deployment (single repository)
   - Uses keyword matching to select appropriate code templates
   - Fast response times (~100ms)

2. **React Context for Global State**
   - `ThemeContext`: Manages light/dark mode across app
   - `PromptHistoryContext`: Centralizes history management
   - Prevents prop drilling and improves maintainability

3. **LocalStorage for Persistence**
   - Prompt history survives page refreshes
   - No database required for assignment scope
   - Easy to migrate to backend API later

4. **Component Architecture**
   - `CodeGeneratorClient`: Main form and logic
   - `CodeOutput`: Reusable code display with syntax highlighting
   - `Navbar`: Theme toggle and branding
   - `Sidebar`: History panel with search and favorites

5. **Responsive Design**
   - Mobile-first approach
   - Flexbox/Grid for layout
   - Collapses to single column on mobile
   - Touch-friendly controls

## 📦 Project Structure

```
frontend/
├── app/
│   ├── api/
│   │   ├── generate/
│   │   │   └── route.ts        # Mock API endpoint
│   │   └── health/
│   │       └── route.ts        # Health check endpoint
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── components/
│   ├── CodeGeneratorClient.tsx # Main code generator UI
│   ├── CodeOutput.tsx          # Code display with syntax highlighting
│   ├── Navbar.tsx              # Top navigation bar
│   └── Sidebar.tsx             # History & favorites panel
├── contexts/
│   ├── ThemeContext.tsx        # Dark/light mode state
│   └── PromptHistoryContext.tsx # History management
├── types/
│   └── index.ts                # TypeScript type definitions
├── public/
│   └── mock/
│       └── data.json           # Additional mock data
└── package.json
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Arpitkushwahaa/Copilot-Frontend.git
   cd Copilot-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Environment Variables

Create a `.env` file in the frontend directory:

**For Mock Mode (Assignment Submission - No Backend Required):**
```bash
MODE=mock
```

**For AI Mode (With Backend):**
```bash
MODE=ai
NEXT_PUBLIC_API_URL=https://copilot-axgr.onrender.com
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### Backend Setup (Optional - For AI Mode)

If you want to use the real AI backend:

1. **Clone backend repository**
   ```bash
   git clone https://github.com/Arpitkushwahaa/Copilot-Backend.git
   cd Copilot-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (backend `.env`)
   ```bash
   PORT=5000
   DATABASE_URL=your_postgresql_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-2.5-flash
   CORS_ORIGIN=https://copilot-lb5e.vercel.app
   ```

4. **Run migrations**
   ```bash
   cd migrations
   node run-migrations.js
   ```

5. **Start backend server**
   ```bash
   npm start
   ```

Backend API will be available at `http://localhost:5000`

## 📡 API Documentation

### POST /api/generate

Generates code based on prompt and language selection.

**Request:**
```json
{
  "prompt": "Write a function to reverse a string",
  "language": "python"
}
```

**Response:**
```json
{
  "code": "def reverse_string(s):\n    \"\"\"Reverse a string using Python slicing\"\"\"\n    return s[::-1]\n\n# Example usage\ntext = \"Hello, World!\"\nreversed_text = reverse_string(text)\nprint(f\"Reversed: {reversed_text}\")",
  "language": "python",
  "timestamp": "2025-11-24T10:30:00.000Z"
}
```

**Supported Languages:**
- `python`
- `javascript`
- `typescript`
- `cpp` (C++)
- `java`
- `go`
- `rust`

**Template Matching Keywords:**
- "sort", "array" → Sorting algorithm
- "reverse", "string" → String reversal
- "fibonacci", "fib" → Fibonacci sequence
- "api", "fetch", "http" → API call example
- "class", "calculator" → Class implementation
- "interface", "type" → Type/interface definition
- "struct" → Struct definition (Go/Rust)

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-24T10:30:00.000Z",
  "environment": "production",
  "mode": "mock"
}
```

## 🎯 Assignment Compliance Checklist

### Core Requirements
- [x] React/Next.js framework
- [x] Prompt input box
- [x] Generate button with loading indicator
- [x] Code output with syntax highlighting (react-syntax-highlighter)
- [x] Clean UI with TailwindCSS
- [x] Responsive layout (prompt left, code right)
- [x] Good typography and spacing
- [x] TypeScript implementation
- [x] Mock API with POST /generate endpoint
- [x] Returns code in specified format

### Strongly Recommended Bonuses
- [x] Language selector (7 languages)
- [x] Prompt history panel
- [x] Search/filter history
- [x] Copy to clipboard
- [x] Adjustable code font size

### Additional Bonuses
- [x] Theme toggle (light/dark)
- [x] Favorite/star prompts
- [x] Multiple code templates per language
- [x] Regenerate from history
- [x] Error handling and validation
- [x] Loading animations
- [x] Keyboard shortcuts (Enter to generate)

## 🎨 UI/UX Highlights

- **Instant Feedback**: Loading states and success animations
- **Keyboard Support**: Enter to generate, Tab navigation
- **Smart Defaults**: System theme preference detection
- **Error Recovery**: Clear error messages with retry options
- **Mobile Optimized**: Touch-friendly controls and responsive design
- **Accessible**: Semantic HTML and ARIA labels

## 🔮 Future Improvements (If I Had More Time)

### Features
1. **Export Options**: Download code as file (.py, .js, .cpp)
2. **Code Execution**: In-browser code execution with Web Workers
3. **Multi-file Generation**: Generate multiple related files (HTML + CSS + JS)
4. **Code Explanation**: AI-powered code explanation panel
5. **Version History**: Track multiple versions of same prompt
6. **Collaboration**: Share prompts via URL
7. **Templates Library**: Pre-made prompt templates for common tasks

### Technical Improvements
1. **Backend Integration**: Real PostgreSQL database for history
2. **Real AI**: Connect to Google Gemini or OpenAI API
3. **Authentication**: User accounts and saved preferences
4. **Rate Limiting**: Prevent abuse with request throttling
5. **Analytics**: Track popular languages and prompts
6. **Progressive Web App**: Offline support with service workers
7. **Testing**: Unit tests (Jest), E2E tests (Playwright)
8. **Performance**: Code splitting, lazy loading, image optimization

### UI/UX
1. **Code Diff**: Compare different generated versions
2. **Split View**: Side-by-side code comparison
3. **Custom Themes**: Multiple color schemes beyond light/dark
4. **Accessibility**: Full screen reader support, keyboard navigation
5. **Animations**: Smoother transitions and micro-interactions
6. **Tooltips**: Contextual help for first-time users

## 🛠️ Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

MIT License - Feel free to use this project for learning and development.

## 👤 Author

**Arpit Kushwaha**
- GitHub: [@Arpitkushwahaa](https://github.com/Arpitkushwahaa)

## 🙏 Acknowledgments

- Next.js team for amazing framework
- TailwindCSS for utility-first CSS
- React Syntax Highlighter for code display
- Vercel for hosting platform

---

**Note**: This is a frontend-only implementation with a mock API for educational purposes. The code templates are hardcoded and don't use actual AI generation. For production use, integrate with a real AI API service.
