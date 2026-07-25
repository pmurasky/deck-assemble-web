import { NextResponse } from 'next/server';
import { MOCK_COMMANDERS } from '@/lib/mock-data/builder';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const colorParam = searchParams.get('colorIdentity');
  const maxBudgetParam = searchParams.get('maxBudget');
  const ownedOnlyParam = searchParams.get('ownedOnly');

  let results = [...MOCK_COMMANDERS];

  if (colorParam) {
    const colors = colorParam.split(',');
    results = results.filter((cmd) => colors.some((c) => cmd.colorIdentity.includes(c)));
  }

  if (maxBudgetParam) {
    const maxBudget = Number(maxBudgetParam);
    if (!isNaN(maxBudget)) {
      results = results.filter((cmd) => cmd.estimatedCostToComplete <= maxBudget);
    }
  }

  if (ownedOnlyParam === 'true') {
    results = results.filter((cmd) => cmd.ownershipCoverage >= 95);
  }

  return NextResponse.json(results);
}
