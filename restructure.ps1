# Restructure Script - Run this to organize folders

Write-Host "🔄 Restructuring project for submission..." -ForegroundColor Cyan

# Create frontend folder
Write-Host "`n📁 Creating /frontend folder..." -ForegroundColor Yellow
New-Item -Path "frontend" -ItemType Directory -Force | Out-Null

# Move frontend files to /frontend
Write-Host "📦 Moving frontend files..." -ForegroundColor Yellow
$frontendItems = @(
    "app",
    "components",
    "contexts",
    "lib",
    "public",
    "types",
    "next.config.js",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "tailwind.config.ts",
    "postcss.config.js",
    "next-env.d.ts"
)

foreach ($item in $frontendItems) {
    if (Test-Path $item) {
        Write-Host "  Moving $item..." -ForegroundColor Gray
        Move-Item -Path $item -Destination "frontend\" -Force
    }
}

# Create frontend .env.example
Write-Host "`n📝 Creating frontend/.env.example..." -ForegroundColor Yellow
@"
# Frontend Environment Variables

# Mode: 'ai' for Gemini API, 'mock' for static responses
MODE=ai

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Backend API URL (use deployed backend URL in production)
NEXT_PUBLIC_API_URL=http://localhost:5000

# Enable API documentation page
NEXT_PUBLIC_ENABLE_DOCS=true
"@ | Out-File -FilePath "frontend\.env.example" -Encoding UTF8

Write-Host "`n✅ Restructuring complete!" -ForegroundColor Green
Write-Host "`nNew structure:" -ForegroundColor Cyan
Write-Host "  /frontend  - Next.js application"
Write-Host "  /backend   - Express API server"
Write-Host "  /docs      - ER diagram and documentation"
Write-Host "  README.md  - Main project README"
