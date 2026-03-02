import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) return Response.json({ error: "prompt required" }, { status: 400 });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);

    return Response.json({ response: result.response.text() });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
