import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("Request body:", body); // Log the request body

        const fastapiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        console.log("FastAPI URL:", fastapiUrl);
        console.log("Full fetch URL", `${fastapiUrl}/calculate_dcf`)
        
        const response = await fetch(`${fastapiUrl}/calculate_dcf`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Error from FastAPI:", errorData);
          return new NextResponse(JSON.stringify(errorData), { status: response.status, headers: {'Content-Type': 'application/json'} })
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error proxying:", error);
        return new NextResponse(JSON.stringify({ detail: "Proxy error" }), { status: 500 });
    }
}