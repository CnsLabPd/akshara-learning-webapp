# AksharA - AI-Powered Alphabet Learning Platform

An interactive web application designed to help children learn to write and speak English alphabets (A-Z, a-z), numbers (0-9), and more using AI-powered handwriting and speech recognition.

## Features

### Core Features
- **Interactive Drawing Canvas**: Draw letters on a responsive canvas using mouse or touch
- **AI-Powered Handwriting Recognition**: Uses Tesseract.js OCR and TensorFlow.js models
- **Speech Recognition**: Web Speech API for voice-based learning
- **Text-to-Speech**: Pronunciation guidance for letters and numbers
- **Multi-Mode Learning**: Practice and Test modes for different learning approaches
- **Smart Corrected Tests**: Automatic retest system for incorrect answers until mastery
- **Score Tracking**: Comprehensive scoring system with grades
- **Child-Friendly UI**: Colorful, engaging interface with celebration animations
- **Mobile Responsive**: Works on desktop, tablet, and mobile devices

### Learning Content
- **Capital Letters (A-Z)**: Writing and speaking practice
- **Lowercase Letters (a-z)**: Writing and speaking practice
- **Numbers (0-9)**: Writing and speaking practice

### Learning Modes

#### Writing Section
1. **Practice Mode**: Unlimited attempts, instant feedback, navigate freely
2. **Test Mode**: Single attempt per character, score tracking
3. **Corrected Test**: Retake only the characters you got wrong

#### Reading/Speaking Section
1. **Practice Mode**: Listen and speak with unlimited attempts
2. **Test Mode**: Voice recognition assessment
3. **Learn Mode**: Interactive learning with pronunciation guides

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.5.6 | React framework with App Router |
| React | 19.1.0 | UI library |
| TypeScript | 5.x | Type-safe development |
| Tailwind CSS | 4.x | Utility-first CSS framework |
| Tesseract.js | 6.0.1 | OCR engine for handwriting recognition |
| TensorFlow.js | 4.22.0 | ML model inference |
| gifuct-js | 2.1.2 | GIF animation processing |

### Backend (Optional - for advanced speech features)
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.9+ | Backend runtime |
| FastAPI | 0.109.0 | Web API framework |
| Uvicorn | 0.27.0 | ASGI server |
| TensorFlow | 2.15+ | Neural network inference |
| librosa | 0.10+ | Audio feature extraction |

### Browser APIs
- **Web Speech API**: Speech recognition and synthesis
- **HTML5 Canvas API**: Drawing functionality
- **LocalStorage**: Progress and results persistence

## Requirements

### System Requirements
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (or yarn)
- **Python**: 3.9+ (optional, for backend features)
- **RAM**: ~2GB for running both servers
- **Disk**: ~500MB for dependencies

### Browser Requirements
- **Recommended**: Google Chrome, Microsoft Edge (best speech recognition support)
- **Supported**: Firefox, Safari (limited speech features)

## Getting Started

### Quick Start (Frontend Only)

1. **Clone the repository**:
```bash
git clone <repository-url>
cd akshara
```

2. **Install dependencies**:
```bash
npm install
```

3. **Run the development server**:
```bash
npm run dev
```

4. **Open** [http://localhost:3000](http://localhost:3000) in your browser

### Full Setup (With Python Backend)

#### Option 1: Using Batch Script (Windows)
```bash
# Simply run the batch script
start-servers.bat

# This automatically starts:
# - Python backend on http://localhost:8000
# - Next.js frontend on http://localhost:3000
```

#### Option 2: Manual Setup

**Terminal 1 - Frontend**:
```bash
npm install
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Backend**:
```bash
cd python_backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start the server
python server.py
# Runs on http://localhost:8000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint for code quality |

## Project Structure

```
akshara/
├── app/                           # Next.js App Router
│   ├── page.tsx                   # Home page
│   ├── layout.tsx                 # Root layout
│   ├── globals.css                # Global styles
│   ├── choose-language/           # Language selection
│   ├── practice/                  # Writing practice
│   │   ├── page.tsx               # Capital letters (A-Z)
│   │   ├── numbers/page.tsx       # Numbers (0-9)
│   │   └── small/page.tsx         # Lowercase (a-z)
│   ├── test/                      # Writing tests
│   │   ├── page.tsx               # Capital letters test
│   │   ├── numbers/page.tsx       # Numbers test
│   │   └── small/page.tsx         # Lowercase test
│   ├── reading/                   # Speaking section
│   │   ├── practice/              # Speaking practice
│   │   ├── test/                  # Speaking tests
│   │   └── learn/                 # Learning modes
│   ├── corrected-test/            # Retake wrong answers
│   ├── results/                   # Results & scoring
│   └── api/                       # Backend API routes
│       └── recognize-letter/      # Letter recognition
├── components/                    # React components
│   ├── DrawingCanvas.tsx          # Drawing canvas
│   ├── DrawingAnimation.tsx       # Celebration animations
│   └── KeyboardDrawingTutorial.tsx
├── utils/                         # Utility functions
│   ├── tensorflowModel.ts
│   ├── audioRecorder.ts
│   └── deviceDetection.ts
├── hooks/                         # Custom React hooks
│   └── useKeyboardDrawing.ts
├── public/                        # Static assets
│   ├── images/                    # GIF animations
│   └── js_model/                  # TensorFlow.js model
├── python_backend/                # Python FastAPI backend
│   ├── server.py                  # Main server
│   ├── requirements.txt           # Python dependencies
│   └── README.md                  # Backend docs
├── package.json                   # npm dependencies
├── tsconfig.json                  # TypeScript config
├── next.config.ts                 # Next.js config
├── tailwind.config.ts             # Tailwind config
└── start-servers.bat              # Windows startup script
```

## Application Routes

| Route | Description |
|-------|-------------|
| `/` | Home page - Section & mode selection |
| `/choose-language` | Language selection |
| `/practice` | Capital letters practice (A-Z) |
| `/practice/small` | Lowercase letters practice (a-z) |
| `/practice/numbers` | Numbers practice (0-9) |
| `/test` | Capital letters test |
| `/test/small` | Lowercase letters test |
| `/test/numbers` | Numbers test |
| `/reading/practice` | Speaking practice |
| `/reading/test` | Speaking test |
| `/corrected-test` | Corrected writing test |
| `/results` | Results & scoring |

## User Flow

### Writing Flow
1. **Home Page**: Select "Writing" section
2. **Mode Selection**: Choose Practice or Test
3. **Character Selection**: Capital/Lowercase/Numbers
4. **Draw**: Write the character on canvas
5. **Submit**: Get AI feedback
6. **Results**: View score and take corrected test if needed

### Speaking Flow
1. **Home Page**: Select "Reading" section
2. **Mode Selection**: Choose Practice or Test
3. **Listen**: Hear the pronunciation
4. **Speak**: Say the letter/number
5. **Feedback**: Get recognition result
6. **Progress**: Move to next character

## Scoring System

| Grade | Score Range | Message |
|-------|-------------|---------|
| A+ | 90-100% | Outstanding! |
| A | 80-89% | Excellent! |
| B | 70-79% | Good Job! |
| C | 60-69% | Keep Practicing! |
| D | Below 60% | Need More Practice |

## Troubleshooting

### Common Issues

**Speech recognition not working?**
- Use Chrome or Edge browser
- Allow microphone permissions
- Check your microphone settings

**Handwriting not recognized?**
- Draw clearly within the canvas
- Use thicker strokes
- Wait for the canvas to load completely

**Backend not connecting?**
- Ensure Python virtual environment is activated
- Check if port 8000 is available
- Verify all Python dependencies are installed

## Dependencies

### Frontend (package.json)
```json
{
  "next": "15.5.6",
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "tesseract.js": "^6.0.1",
  "@tensorflow/tfjs": "^4.22.0",
  "gifuct-js": "^2.1.2",
  "tailwindcss": "^4",
  "typescript": "^5"
}
```

### Backend (requirements.txt)
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
numpy>=1.24.0
librosa>=0.10.0
tensorflow>=2.15.0
pydantic>=2.0.0
python-multipart>=0.0.6
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and feature requests, please open an issue on GitHub.

---

**Developed with Neurogati**
