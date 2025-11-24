import { NextRequest, NextResponse } from "next/server";
import { CodeGenerationRequest, CodeGenerationResponse } from "@/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Mock code templates for different languages and prompts
const codeTemplates: Record<string, Record<string, string>> = {
  python: {
    default: `def solution():\n    """Your generated function"""\n    pass\n\n# Example usage\nresult = solution()\nprint(result)`,
    sort: `def sort_array(arr):\n    """Sort an array using the built-in sorted function"""\n    return sorted(arr)\n\n# Example usage\nnumbers = [64, 34, 25, 12, 22, 11, 90]\nsorted_numbers = sort_array(numbers)\nprint(f"Sorted array: {sorted_numbers}")`,
    reverse: `def reverse_string(s):\n    """Reverse a string using Python slicing"""\n    return s[::-1]\n\n# Example usage\ntext = "Hello, World!"\nreversed_text = reverse_string(text)\nprint(f"Reversed: {reversed_text}")`,
    fibonacci: `def fibonacci(n):\n    """Generate Fibonacci sequence up to n terms"""\n    if n <= 0:\n        return []\n    elif n == 1:\n        return [0]\n    elif n == 2:\n        return [0, 1]\n    \n    fib = [0, 1]\n    for i in range(2, n):\n        fib.append(fib[i-1] + fib[i-2])\n    return fib\n\n# Example usage\nprint(fibonacci(10))`,
    api: `import requests\n\ndef fetch_data(url):\n    """Fetch data from an API endpoint"""\n    try:\n        response = requests.get(url)\n        response.raise_for_status()\n        return response.json()\n    except requests.exceptions.RequestException as e:\n        print(f"Error: {e}")\n        return None\n\n# Example usage\ndata = fetch_data("https://api.example.com/data")\nif data:\n    print(data)`,
  },
  javascript: {
    default: `function solution() {\n  // Your generated function\n  return null;\n}\n\n// Example usage\nconst result = solution();\nconsole.log(result);`,
    sort: `function sortArray(arr) {\n  // Sort array in ascending order\n  return arr.sort((a, b) => a - b);\n}\n\n// Example usage\nconst numbers = [64, 34, 25, 12, 22, 11, 90];\nconst sorted = sortArray([...numbers]);\nconsole.log("Sorted array:", sorted);`,
    reverse: `function reverseString(str) {\n  // Reverse a string using array methods\n  return str.split('').reverse().join('');\n}\n\n// Example usage\nconst text = "Hello, World!";\nconst reversed = reverseString(text);\nconsole.log("Reversed:", reversed);`,
    fibonacci: `function fibonacci(n) {\n  // Generate Fibonacci sequence\n  if (n <= 0) return [];\n  if (n === 1) return [0];\n  if (n === 2) return [0, 1];\n  \n  const fib = [0, 1];\n  for (let i = 2; i < n; i++) {\n    fib.push(fib[i-1] + fib[i-2]);\n  }\n  return fib;\n}\n\n// Example usage\nconsole.log(fibonacci(10));`,
    api: `async function fetchData(url) {\n  // Fetch data from an API\n  try {\n    const response = await fetch(url);\n    if (!response.ok) {\n      throw new Error(\`HTTP error! status: \${response.status}\`);\n    }\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error("Error fetching data:", error);\n    return null;\n  }\n}\n\n// Example usage\nfetchData("https://api.example.com/data")\n  .then(data => console.log(data));`,
  },
  typescript: {
    default: `function solution(): any {\n  // Your generated function\n  return null;\n}\n\n// Example usage\nconst result = solution();\nconsole.log(result);`,
    sort: `function sortArray(arr: number[]): number[] {\n  // Sort array in ascending order\n  return arr.sort((a, b) => a - b);\n}\n\n// Example usage\nconst numbers: number[] = [64, 34, 25, 12, 22, 11, 90];\nconst sorted = sortArray([...numbers]);\nconsole.log("Sorted array:", sorted);`,
    interface: `interface User {\n  id: string;\n  name: string;\n  email: string;\n  age?: number;\n  isActive: boolean;\n}\n\nfunction createUser(data: Partial<User>): User {\n  return {\n    id: data.id || Math.random().toString(36),\n    name: data.name || "Anonymous",\n    email: data.email || "user@example.com",\n    isActive: data.isActive ?? true,\n    ...data\n  };\n}\n\n// Example usage\nconst user = createUser({ name: "John", email: "john@example.com" });\nconsole.log(user);`,
    class: `class Calculator {\n  private result: number = 0;\n\n  add(value: number): this {\n    this.result += value;\n    return this;\n  }\n\n  subtract(value: number): this {\n    this.result -= value;\n    return this;\n  }\n\n  multiply(value: number): this {\n    this.result *= value;\n    return this;\n  }\n\n  divide(value: number): this {\n    if (value === 0) throw new Error("Division by zero");\n    this.result /= value;\n    return this;\n  }\n\n  getResult(): number {\n    return this.result;\n  }\n\n  reset(): this {\n    this.result = 0;\n    return this;\n  }\n}\n\n// Example usage\nconst calc = new Calculator();\nconst result = calc.add(10).multiply(5).subtract(20).getResult();\nconsole.log(result); // 30`,
  },
  cpp: {
    default: `#include <iostream>\n\nint main() {\n    // Your generated code\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}`,
    sort: `#include <iostream>\n#include <vector>\n#include <algorithm>\n\nvoid sortArray(std::vector<int>& arr) {\n    std::sort(arr.begin(), arr.end());\n}\n\nint main() {\n    std::vector<int> numbers = {64, 34, 25, 12, 22, 11, 90};\n    sortArray(numbers);\n    \n    std::cout << "Sorted array: ";\n    for (int num : numbers) {\n        std::cout << num << " ";\n    }\n    std::cout << std::endl;\n    \n    return 0;\n}`,
    class: `#include <iostream>\n#include <string>\n\nclass Calculator {\nprivate:\n    double result;\n\npublic:\n    Calculator() : result(0) {}\n    \n    Calculator& add(double value) {\n        result += value;\n        return *this;\n    }\n    \n    Calculator& subtract(double value) {\n        result -= value;\n        return *this;\n    }\n    \n    Calculator& multiply(double value) {\n        result *= value;\n        return *this;\n    }\n    \n    Calculator& divide(double value) {\n        if (value == 0) {\n            throw std::invalid_argument("Division by zero");\n        }\n        result /= value;\n        return *this;\n    }\n    \n    double getResult() const {\n        return result;\n    }\n    \n    void reset() {\n        result = 0;\n    }\n};\n\nint main() {\n    Calculator calc;\n    double result = calc.add(10).multiply(5).subtract(20).getResult();\n    std::cout << "Result: " << result << std::endl;\n    return 0;\n}`,
  },
  java: {
    default: `public class Main {\n    public static void main(String[] args) {\n        // Your generated code\n        System.out.println("Hello, World!");\n    }\n}`,
    sort: `import java.util.Arrays;\n\npublic class ArraySorter {\n    public static int[] sortArray(int[] arr) {\n        Arrays.sort(arr);\n        return arr;\n    }\n    \n    public static void main(String[] args) {\n        int[] numbers = {64, 34, 25, 12, 22, 11, 90};\n        sortArray(numbers);\n        \n        System.out.print("Sorted array: ");\n        for (int num : numbers) {\n            System.out.print(num + " ");\n        }\n        System.out.println();\n    }\n}`,
    class: `public class Calculator {\n    private double result;\n    \n    public Calculator() {\n        this.result = 0;\n    }\n    \n    public Calculator add(double value) {\n        result += value;\n        return this;\n    }\n    \n    public Calculator subtract(double value) {\n        result -= value;\n        return this;\n    }\n    \n    public Calculator multiply(double value) {\n        result *= value;\n        return this;\n    }\n    \n    public Calculator divide(double value) {\n        if (value == 0) {\n            throw new IllegalArgumentException("Division by zero");\n        }\n        result /= value;\n        return this;\n    }\n    \n    public double getResult() {\n        return result;\n    }\n    \n    public void reset() {\n        result = 0;\n    }\n    \n    public static void main(String[] args) {\n        Calculator calc = new Calculator();\n        double result = calc.add(10).multiply(5).subtract(20).getResult();\n        System.out.println("Result: " + result);\n    }\n}`,
  },
  go: {
    default: `package main\n\nimport "fmt"\n\nfunc main() {\n    // Your generated code\n    fmt.Println("Hello, World!")\n}`,
    sort: `package main\n\nimport (\n    "fmt"\n    "sort"\n)\n\nfunc sortArray(arr []int) []int {\n    sort.Ints(arr)\n    return arr\n}\n\nfunc main() {\n    numbers := []int{64, 34, 25, 12, 22, 11, 90}\n    sorted := sortArray(numbers)\n    fmt.Println("Sorted array:", sorted)\n}`,
    struct: `package main\n\nimport "fmt"\n\ntype User struct {\n    ID       string\n    Name     string\n    Email    string\n    IsActive bool\n}\n\nfunc NewUser(name, email string) *User {\n    return &User{\n        ID:       generateID(),\n        Name:     name,\n        Email:    email,\n        IsActive: true,\n    }\n}\n\nfunc generateID() string {\n    // Simple ID generation\n    return "user-" + fmt.Sprint(time.Now().Unix())\n}\n\nfunc main() {\n    user := NewUser("John Doe", "john@example.com")\n    fmt.Printf("Created user: %+v\\n", user)\n}`,
  },
  rust: {
    default: `fn main() {\n    // Your generated code\n    println!("Hello, World!");\n}`,
    sort: `fn sort_array(arr: &mut Vec<i32>) {\n    arr.sort();\n}\n\nfn main() {\n    let mut numbers = vec![64, 34, 25, 12, 22, 11, 90];\n    sort_array(&mut numbers);\n    println!("Sorted array: {:?}", numbers);\n}`,
    struct: `struct User {\n    id: String,\n    name: String,\n    email: String,\n    is_active: bool,\n}\n\nimpl User {\n    fn new(name: String, email: String) -> Self {\n        User {\n            id: uuid::Uuid::new_v4().to_string(),\n            name,\n            email,\n            is_active: true,\n        }\n    }\n    \n    fn display(&self) {\n        println!("User: {} ({})", self.name, self.email);\n    }\n}\n\nfn main() {\n    let user = User::new(\n        String::from("John Doe"),\n        String::from("john@example.com")\n    );\n    user.display();\n}`,
  },
};

// Validate if prompt is code-related
function isCodeRelatedPrompt(prompt: string): boolean {
  const lowerPrompt = prompt.toLowerCase().trim();
  
  // Code-related keywords
  const codeKeywords = [
    // Programming actions
    'write', 'create', 'generate', 'build', 'make', 'implement', 'develop',
    'code', 'program', 'function', 'method', 'class', 'algorithm',
    
    // Programming concepts
    'loop', 'array', 'list', 'dict', 'object', 'variable', 'const', 'let',
    'if', 'else', 'switch', 'case', 'for', 'while', 'return',
    'async', 'await', 'promise', 'callback', 'api', 'fetch', 'request',
    
    // Data structures & algorithms
    'sort', 'search', 'tree', 'graph', 'stack', 'queue', 'heap',
    'hash', 'map', 'set', 'linked list', 'binary', 'recursive',
    'fibonacci', 'factorial', 'prime', 'palindrome',
    
    // Programming terms
    'function', 'class', 'interface', 'type', 'struct', 'enum',
    'import', 'export', 'module', 'package', 'library',
    'database', 'query', 'sql', 'crud', 'rest', 'graphql',
    'component', 'props', 'state', 'hook', 'effect',
    
    // Problem solving
    'solve', 'calculate', 'compute', 'find', 'check', 'validate',
    'reverse', 'convert', 'transform', 'parse', 'format',
    
    // Common DSA questions
    'two sum', 'leetcode', 'hackerrank', 'codechef', 'codeforces',
    'dynamic programming', 'dp', 'greedy', 'backtrack', 'divide and conquer'
  ];
  
  // Check if prompt contains any code-related keywords
  const hasCodeKeyword = codeKeywords.some(keyword => lowerPrompt.includes(keyword));
  
  // Check for code-like patterns (contains = or {} or () or ;)
  const hasCodePattern = /[={}();]|->|=>|::/.test(prompt);
  
  // Check if it's a question about coding
  const isCodingQuestion = /how to|how do|can you|write a|create a|implement|build a/i.test(prompt);
  
  return hasCodeKeyword || hasCodePattern || isCodingQuestion;
}

// Match prompt keywords to appropriate templates (for mock mode)
function selectTemplate(prompt: string, language: string): string {
  const lowerPrompt = prompt.toLowerCase();
  const templates = codeTemplates[language];
  
  if (!templates) {
    return codeTemplates[language]?.default || "// Code generation not available for this language";
  }
  
  // Match keywords with priority order
  if (lowerPrompt.includes("sort")) {
    return templates.sort || templates.default;
  }
  if (lowerPrompt.includes("reverse")) {
    return templates.reverse || templates.default;
  }
  if (lowerPrompt.includes("fibonacci") || lowerPrompt.includes("fib")) {
    return templates.fibonacci || templates.default;
  }
  if (lowerPrompt.includes("api") || lowerPrompt.includes("fetch") || lowerPrompt.includes("http") || lowerPrompt.includes("request")) {
    return templates.api || templates.default;
  }
  if (lowerPrompt.includes("interface") || (lowerPrompt.includes("type") && language === "typescript")) {
    return templates.interface || templates.default;
  }
  if (lowerPrompt.includes("class") || lowerPrompt.includes("calculator") || lowerPrompt.includes("object")) {
    return templates.class || templates.default;
  }
  if (lowerPrompt.includes("struct")) {
    return templates.struct || templates.default;
  }
  
  // More specific matching for array/string operations
  if (lowerPrompt.includes("array") && !lowerPrompt.includes("sort")) {
    return templates.sort || templates.default; // Default array template
  }
  if (lowerPrompt.includes("string") && !lowerPrompt.includes("reverse")) {
    return templates.reverse || templates.default; // Default string template
  }
  
  // Generate a custom comment if no template matches
  const comment = language === "python" ? "#" : "//";
  return templates.default.replace(
    language === "python" ? '"""Your generated function"""' : '// Your generated function',
    `${comment} TODO: Implement ${prompt.substring(0, 60)}...`
  );
}

// Generate code using Gemini API with correct v1 endpoint
async function generateWithGemini(prompt: string, language: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  // Use the correct model name from environment or default to gemini-2.5-flash
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  
  const enhancedPrompt = `Generate ${language} code for the following request.
Only return the code without any explanations, markdown formatting, or code block markers.
Just the raw, executable code.

Language: ${language}
Request: ${prompt}

Code:`;

  try {
    // Use the correct v1 endpoint with proper request format
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: enhancedPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,        // Lower for faster, more focused responses
        maxOutputTokens: 1024,   // Reduced for faster generation
        topP: 0.8,
        topK: 10
      }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      // Provide clearer messaging for common issues
      if (res.status === 404 && /not found/i.test(errText)) {
        throw new Error(`Model '${modelName}' not found or not supported. Response: ${errText}`);
      }
      if (res.status === 403 && /reported as leaked/i.test(errText)) {
        throw new Error(`API key reported as leaked. Rotate your key in Google AI Studio and update GEMINI_API_KEY. Details: ${errText}`);
      }
      if (res.status === 429) {
        throw new Error(`Gemini rate limit exceeded. Consider backoff or lowering request frequency. Details: ${errText}`);
      }
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${errText}`);
    }

    const json = await res.json();

    // Parse the response from Gemini API v1
    let code = "";
    if (json.candidates && Array.isArray(json.candidates) && json.candidates.length > 0) {
      const candidate = json.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        code = candidate.content.parts[0].text || "";
      }
    }

    if (!code) {
      throw new Error("No text found in Gemini response");
    }

    // Clean up any markdown code blocks if present
    return code
      .replace(/```[\w]*\n/g, '')
      .replace(/```$/g, '')
      .trim();
      
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Gemini API error: ${errorMessage}`);
  }
}

// Rate limiting (simple in-memory implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = parseInt(process.env.API_RATE_LIMIT || "60", 10);
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";

    // Rate limiting check
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const body: CodeGenerationRequest = await request.json();
    const { prompt, language } = body;

    // Enhanced input validation
    if (!prompt || !language) {
      return NextResponse.json(
        { error: "Prompt and language are required" },
        { status: 400 }
      );
    }

    if (prompt.length > 5000) {
      return NextResponse.json(
        { error: "Prompt is too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    const validLanguages = ["python", "javascript", "typescript", "cpp", "java", "go", "rust"];
    if (!validLanguages.includes(language)) {
      return NextResponse.json(
        { error: "Invalid language specified" },
        { status: 400 }
      );
    }

    // Validate if prompt is code-related
    if (!isCodeRelatedPrompt(prompt)) {
      return NextResponse.json(
        { 
          error: "Invalid prompt: This tool is for code generation only",
          message: "Please provide a coding-related request. Examples:\n" +
                   "• 'Write a function to reverse a string'\n" +
                   "• 'Create a sorting algorithm'\n" +
                   "• 'Implement a binary search tree'\n" +
                   "• 'Build a REST API endpoint'\n" +
                   "• 'Solve the two-sum problem'",
          type: "non_code_prompt"
        },
        { status: 400 }
      );
    }

    let code: string;
    const mode = process.env.MODE || "mock";
    const hasApiKey = !!process.env.GEMINI_API_KEY;
    const isProduction = process.env.NODE_ENV === "production";

    // Debug logging
    console.log("[API] MODE:", mode);
    console.log("[API] Has API Key:", hasApiKey);
    console.log("[API] Will use:", mode === "ai" && hasApiKey ? "GEMINI AI" : "MOCK TEMPLATES");

    // Use Gemini API if available and mode is 'ai', otherwise use mock templates
    if (mode === "ai" && hasApiKey) {
      try {
        code = await generateWithGemini(prompt, language);
        
        // Log success in production
        if (isProduction) {
          console.log(`[Gemini AI] Generated ${language} code in ${Date.now() - startTime}ms`);
        }
      } catch (apiError) {
        const errorMessage = apiError instanceof Error ? apiError.message : "Unknown error";
        console.error("Gemini API error, falling back to mock:", errorMessage);

        // Provide structured error meta for client (non-sensitive)
        const leakDetected = /reported as leaked/i.test(errorMessage);
        const modelNotFound = /not found/i.test(errorMessage) && /Model/.test(errorMessage);
        const rateLimited = /rate limit/i.test(errorMessage);

        // Fallback to mock if API fails (NO DELAY - instant response)
        code = selectTemplate(prompt, language);

        if (isProduction) {
          console.warn(`[Fallback] Using mock template for ${language}`);
        }

        // Attach diagnostic headers
        const diagHeaders: Record<string,string> = {};
        if (leakDetected) diagHeaders['X-Gemini-Key-Status'] = 'leaked';
        if (modelNotFound) diagHeaders['X-Gemini-Model-Status'] = 'not-found';
        if (rateLimited) diagHeaders['X-Gemini-RateLimit'] = 'exceeded';
        // We'll merge these later before return
        (globalThis as any).__lastGeminiDiag = diagHeaders;
      }
    } else {
      // Mock mode: instant response (no artificial delay)
      code = selectTemplate(prompt, language);
      
      if (isProduction && process.env.LOG_LEVEL !== "error") {
        console.log(`[Mock Mode] Generated ${language} code in ${Date.now() - startTime}ms`);
      }
    }

    const response: CodeGenerationResponse = {
      code,
      language,
    };

    // Add response headers
    const res = NextResponse.json(response);
    // Merge diagnostic headers if present
    const diag = (globalThis as any).__lastGeminiDiag as Record<string,string> | undefined;
    if (diag) {
      Object.entries(diag).forEach(([k,v]) => res.headers.set(k,v));
      delete (globalThis as any).__lastGeminiDiag;
    }
    res.headers.set("X-Response-Time", `${Date.now() - startTime}ms`);
    res.headers.set("X-Mode", mode);
    
    return res;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating code:", errorMessage);
    
    // Don't expose internal errors in production
    const isProduction = process.env.NODE_ENV === "production";
    return NextResponse.json(
      { 
        error: isProduction 
          ? "Failed to generate code. Please try again." 
          : `Failed to generate code: ${errorMessage}`
      },
      { status: 500 }
    );
  }
}
