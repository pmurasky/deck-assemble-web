'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@auth0/nextjs-auth0/client';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { AuthGate } from '@/components/auth/AuthGate';
import { isAdmin } from '@/lib/utils/permissions';
import { BeginnerGuideQueueTable } from '@/components/admin/BeginnerGuideQueueTable';
import { BeginnerGuideEditPanel } from '@/components/admin/BeginnerGuideEditPanel';
import {
  getAdminBeginnerGuides,
  type AdminBeginnerGuideItem,
  type AdminBeginnerGuidePage,
} from '@/lib/api/beginnerGuides';
import { BookOpen, ShieldAlert, ArrowLeft } from 'lucide-react';

function AdminUnauthorizedView() {
  return (
    <AuthGate
      title="Admin Access Required"
      description="You must be an administrator with appropriate permissions to view and moderate the beginner guide review queue."
      features={[
        'Review AI-generated beginner rules and mechanics explanations',
        'Edit and curate strategy tips for new MTG players',
        'Publish, regenerate, or reject guides across the card catalog',
      ]}
      icon={<ShieldAlert className="w-8 h-8 text-rose-400" />}
    />
  );
}

function PageHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/imports"
            className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Admin Imports</span>
          </Link>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent mt-1">
          BEGINNER GUIDES REVIEW QUEUE
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Review, edit, and publish AI-generated rules explanations, stale guides, and user-reported cards.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/admin/imports"
          className="px-3.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 transition-colors"
        >
          Card Imports
        </Link>
      </div>
    </div>
  );
}

function QueueOverviewCards({ data }: { data?: AdminBeginnerGuidePage }) {
  const items = data?.content || [];
  const draftCount = items.filter((i) => i.status === 'DRAFT').length;
  const staleCount = items.filter((i) => i.status === 'STALE').length;
  const reportedCount = items.filter((i) => i.status === 'REPORTED').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total in Queue</div>
        <div className="text-2xl font-black text-white mt-1">{data?.totalElements ?? 0}</div>
      </div>
      <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3.5">
        <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Drafts</div>
        <div className="text-2xl font-black text-amber-300 mt-1">{draftCount}</div>
      </div>
      <div className="rounded-xl border border-orange-500/20 bg-orange-950/20 p-3.5">
        <div className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">Stale</div>
        <div className="text-2xl font-black text-orange-300 mt-1">{staleCount}</div>
      </div>
      <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-3.5">
        <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Reported</div>
        <div className="text-2xl font-black text-rose-300 mt-1">{reportedCount}</div>
      </div>
    </div>
  );
}

export default function AdminBeginnerGuidesPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [selectedGuide, setSelectedGuide] = useState<AdminBeginnerGuideItem | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminBeginnerGuides', page, pageSize],
    queryFn: () => getAdminBeginnerGuides({ page, size: pageSize, status: 'DRAFT,STALE,REPORTED' }),
    enabled: Boolean(user && isAdmin(user)),
  });

  if (isUserLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!isAdmin(user)) {
    return (
      <div className="container mx-auto py-8 px-4">
        <AdminUnauthorizedView />
      </div>
    );
  }

  const handlePublishSuccess = (publishedItem: AdminBeginnerGuideItem) => {
    queryClient.setQueryData<AdminBeginnerGuidePage>(
      ['adminBeginnerGuides', page, pageSize],
      (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          content: prev.content.filter((item) => item.cardId !== publishedItem.cardId),
          totalElements: Math.max(0, prev.totalElements - 1),
        };
      }
    );
    setSelectedGuide(null);
    queryClient.invalidateQueries({ queryKey: ['adminBeginnerGuides'] });
  };

  const handleRejectSuccess = (cardId: string) => {
    queryClient.setQueryData<AdminBeginnerGuidePage>(
      ['adminBeginnerGuides', page, pageSize],
      (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          content: prev.content.filter((item) => item.cardId !== cardId),
          totalElements: Math.max(0, prev.totalElements - 1),
        };
      }
    );
    setSelectedGuide(null);
    queryClient.invalidateQueries({ queryKey: ['adminBeginnerGuides'] });
  };

  const handleRegenerateSuccess = (regeneratedItem: AdminBeginnerGuideItem) => {
    queryClient.setQueryData<AdminBeginnerGuidePage>(
      ['adminBeginnerGuides', page, pageSize],
      (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          content: prev.content.map((item) =>
            item.cardId === regeneratedItem.cardId ? regeneratedItem : item
          ),
        };
      }
    );
    setSelectedGuide(regeneratedItem);
  };

  const handleSaveSuccess = (updatedItem: AdminBeginnerGuideItem) => {
    queryClient.setQueryData<AdminBeginnerGuidePage>(
      ['adminBeginnerGuides', page, pageSize],
      (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          content: prev.content.map((item) =>
            item.cardId === updatedItem.cardId ? updatedItem : item
          ),
        };
      }
    );
    setSelectedGuide(updatedItem);
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <PageHeader />
      <QueueOverviewCards data={data} />

      {selectedGuide && (
        <div className="mb-6">
          <BeginnerGuideEditPanel
            guide={selectedGuide}
            onClose={() => setSelectedGuide(null)}
            onPublishSuccess={handlePublishSuccess}
            onRejectSuccess={handleRejectSuccess}
            onRegenerateSuccess={handleRegenerateSuccess}
            onSaveSuccess={handleSaveSuccess}
          />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            Pending Queue Items
          </h2>
        </div>

        <BeginnerGuideQueueTable
          items={data?.content || []}
          totalElements={data?.totalElements || 0}
          currentPage={page}
          pageSize={pageSize}
          isLoading={isLoading}
          error={error instanceof Error ? error : null}
          selectedCardId={selectedGuide?.cardId}
          onSelectGuide={(guide) => setSelectedGuide(guide)}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>
    </div>
  );
}
