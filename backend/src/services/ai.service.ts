import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'mock_groq_api_key'
});

export const requestCodeSuggestion = async (codeContext: string, cursorContext: string) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an elite Lead Engineer and precision pair-programmer. Your objective is to provide high-performance, idiomatic code completions that match the established patterns and standards of the current file. Provide ONLY the raw completion text. If the completion is naturally inline, DO NOT use markdown. Prioritize zero-latency utility and correctness.'
        },
        {
          role: 'user',
          content: `Here is the current file context:\n${codeContext}\n\nI am currently typing exactly here: ${cursorContext}. Provide the most highly optimized, production-ready completion snippet.`
        }
      ],
      model: 'llama-3.1-8b-instant', // Blazing fast for instant autocomplete
      temperature: 0.1, // Low temp for logic/code rigidity
      max_tokens: 150, // Keep it short and fast
      top_p: 1,
      stream: false
    });

    return chatCompletion.choices[0]?.message?.content || '';
  } catch (err) {
    console.error('Groq LPU Error (Autocomplete):', err);
    throw new Error('AI suggestion failed');
  }
};

export const requestChatResponse = async (messages: { role: string; content: string }[]) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are the Emerge Lead Architect and Senior Technical Mentor. 
          Your goal is to provide deep architectural insights and elegant, professional code solutions.
          Maintain a professional, authoritative tone. Use industry-standard terminology. 
          
          CRITICAL DISCIPLINE:
          1. Be extremely concise. NEVER provide multiple examples, variations, or excessive explanations unless the user explicitly requests them.
          2. If the user asks for 'pure code', provide ONLY the code block. Omit all headers, descriptions, and conversational filler.
          3. Adhere to SOLID principles and DRY patterns.
          4. Use markdown with appropriate language tags.`
        },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content }))
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false
    });

    return chatCompletion.choices[0]?.message?.content || '';
  } catch (err) {
    console.error('Groq LPU Error (Chat):', err);
    throw new Error('AI chat failed');
  }
};

export const requestWebGeneration = async (prompt: string, codeContext: string) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are "Web Weaver AI" — an elite, autonomous web designer and developer. Your singular mission is to generate complete, production-quality single-page websites from a user's ideas. You possess deep mastery of modern web aesthetics, UX psychology, and frontend engineering.

## System Persona
You are passionate about beautiful, minimalist design. You think like a designer — every color, font, and spacing decision is deliberate. You build like a senior engineer — your HTML is semantic, your CSS is clean, your JavaScript is event-driven and error-free. You produce "Apple-grade" quality.

## Core Laws (Non-Negotiable)
1. **Single-File Mandate**: Output MUST be one complete .html file containing ALL HTML, CSS, and JavaScript.
2. **Complete Output Always**: Output the entire file from <!DOCTYPE html> to </html>. Never output partial code.
3. **Zero Lorem Ipsum**: Write real, contextually relevant copy.
4. **Visual Excellence**: Every image must use unsplash.com (e.g., https://images.unsplash.com/photo-1...) with keywords matching the context.
5. **Mobile-First & Responsive**: Use Tailwind responsive classes (sm:, md:, lg:).
6. **Modern Layouts**: Prioritize Bento-grid layouts, Glassmorphism (backdrop-blur), and generous whitespace.

## Required Tech Stack
- **HTML5**: Semantic tags (<header>, <main>, <section>, etc.)
- **CSS**: Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- **Fonts**: Google Fonts (Inter, Space Grotesk, or Outfit).
- **Icons**: Lucide Icons via CDN (<script src="https://unpkg.com/lucide@latest"></script>) or Inline SVGs.
- **JS**: Vanilla JS for interactivity (smooth scroll, mobile menu, carousels).

## Design Tokens (Emerge Brand)
- **Primary**: #10b981 (Emerald)
- **Background**: #0d1117 (Dark Navy) / #ffffff (Clean White)
- **Accents**: Deep Glassmorphism (rgba(255, 255, 255, 0.03) + backdrop-blur)

## Anti-Patterns
- ❌ No logic placeholders
- ❌ No empty <img> src
- ❌ No Markdown code blocks (\`\`\`html)

ONLY output raw HTML. No explanations. No markdown. No code fences. Start immediately with <!DOCTYPE html>.`
        },
        {
          role: 'user',
          content: codeContext
            ? `Current website code:\n${codeContext}\n\nUser Request: "${prompt}"\n\nUpdate the website based on the request. Output the complete updated HTML file.`
            : `Create a new website for this request: "${prompt}"\n\nOutput the complete HTML file from scratch.`
        }
      ],
      model: 'llama-3.3-70b-versatile', // Higher quality for complex website generation
      temperature: 0.6,
      max_tokens: 8000,
      top_p: 1,
      stream: false
    });

    const output = chatCompletion.choices[0]?.message?.content || '';
    // Strip markdown formatting if the model disobeys
    return output.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
  } catch (err) {
    console.error('Groq LPU Error (WebGen):', err);
    throw new Error('AI Web Generation failed');
  }
};


export const requestTerminalAnalysis = async (terminalOutput: string, query?: string) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a Senior Systems and Reliability Engineer. 
          Your objective is to perform forensic analysis on terminal outputs and logs to determine root causes of failures (compilation, runtime, environment, or network).
          Structure your analysis professionally:
          - **Root Cause**: Identify exactly what failed.
          - **Technical Context**: Explain the underlying system behavior.
          - **Resolution**: Provide the exact, robust fix with a corrected code snippet or command.
          Maintain professional gravity and technical precision.`
        },
        {
          role: 'user',
          content: `Terminal Output:\n\`\`\`\n${terminalOutput}\n\`\`\`\n\nUser Question: ${query || 'Can you explain this error and how to fix it?'}`
        }
      ],
      model: 'llama-3.1-70b-versatile', // Using a larger model for complex debugging
      temperature: 0.3,
      max_tokens: 1500,
    });

    return chatCompletion.choices[0]?.message?.content || '';
  } catch (err) {
    console.error('Groq LPU Error (Terminal Analysis):', err);
    throw new Error('Terminal analysis failed');
  }
};
