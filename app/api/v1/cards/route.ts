import { NextRequest, NextResponse } from 'next/server';
import { fetchCards } from '@/lib/api/catalog';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const pageRaw = parseInt(searchParams.get('page') || '0', 10);
  const page = searchParams.has('limit') && pageRaw > 0 ? pageRaw - 1 : Math.max(pageRaw, 0);
  const size = parseInt(searchParams.get('limit') || searchParams.get('size') || '50', 10);
  const query = searchParams.get('query') ?? searchParams.get('q') ?? '';
  const type = searchParams.get('type') ?? '';
  const setCode = searchParams.get('setCode') ?? '';
  const colorIdentity = searchParams.get('colorIdentity') ?? '';
  const sort = searchParams.get('sort') ?? '';
  const commanderEligible = searchParams.get('commanderEligible') === 'true';
  const partnerForCardId = searchParams.get('partnerForCardId') ?? undefined;

  const name = searchParams.get('name') ?? undefined;
  const oracleText = searchParams.get('oracleText') ?? undefined;
  const minCmc = searchParams.has('minCmc') ? parseInt(searchParams.get('minCmc')!, 10) : undefined;
  const maxCmc = searchParams.has('maxCmc') ? parseInt(searchParams.get('maxCmc')!, 10) : undefined;
  const power = searchParams.get('power') ?? undefined;
  const toughness = searchParams.get('toughness') ?? undefined;
  const loyalty = searchParams.get('loyalty') ?? undefined;
  const rarity = searchParams.get('rarity') ?? undefined;
  const format = searchParams.get('format') ?? undefined;
  const keywords = searchParams.get('keywords') ?? undefined;
  const artist = searchParams.get('artist') ?? undefined;
  const isReserved = searchParams.has('isReserved') ? searchParams.get('isReserved') === 'true' : undefined;
  const isFullArt = searchParams.has('isFullArt') ? searchParams.get('isFullArt') === 'true' : undefined;
  const isPromo = searchParams.has('isPromo') ? searchParams.get('isPromo') === 'true' : undefined;

  try {
    const data = await fetchCards({
      query,
      page,
      size,
      type,
      setCode,
      colorIdentity,
      sort,
      commanderEligible,
      partnerForCardId,
      name,
      oracleText,
      minCmc,
      maxCmc,
      power,
      toughness,
      loyalty,
      rarity,
      format,
      keywords,
      artist,
      isReserved,
      isFullArt,
      isPromo,
    });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: 'Card catalog unavailable' } },
      { status: 502 }
    );
  }
}

