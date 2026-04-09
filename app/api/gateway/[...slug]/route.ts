import { NextRequest, NextResponse } from 'next/server';

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:5002';

const createBackendUrl = (request: NextRequest, slug: string[]) => {
  const url = new URL(request.url);
  const targetPath = slug.join('/');
  const backendUrl = new URL(`${backendBaseUrl}/${targetPath}`);
  backendUrl.search = url.search;
  return backendUrl;
};

async function proxy(request: NextRequest, slug: string[]) {
  const backendUrl = createBackendUrl(request, slug);
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const response = await fetch(backendUrl, {
    method: request.method,
    headers,
    body: hasBody ? await request.text() : undefined,
    redirect: 'manual',
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('transfer-encoding');
  responseHeaders.delete('connection');

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  return proxy(request, slug);
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  return proxy(request, slug);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  return proxy(request, slug);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  return proxy(request, slug);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  return proxy(request, slug);
}
