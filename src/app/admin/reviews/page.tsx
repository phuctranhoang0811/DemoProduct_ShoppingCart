'use client';

import { useState, useMemo } from 'react';
import {
  MessageSquare,
  Star,
  Check,
  EyeOff,
  Trash2,
  Filter,
  CheckCircle,
} from 'lucide-react';
import { useCommerceStore } from '@/stores/useCommerceStore';
import { Review } from '@/types';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminReviewsPage() {
  const reviews = useCommerceStore((state) => state.reviews);
  const updateReviewStatus = useCommerceStore((state) => state.updateReviewStatus);
  const deleteReview = useCommerceStore((state) => state.deleteReview);

  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'hidden'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      return true;
    });
  }, [reviews, statusFilter]);

  const handleApprove = (id: string) => {
    updateReviewStatus(id, 'approved');
    toast.success('Review approved and published to storefront.');
  };

  const handleHide = (id: string) => {
    updateReviewStatus(id, 'hidden');
    toast.info('Review hidden from product page.');
  };

  const handleDelete = (id: string) => {
    deleteReview(id);
    setDeleteId(null);
    toast.success('Review deleted.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E5E5] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111]">
            Reviews Moderation
          </h1>
          <p className="text-sm text-[#666666] mt-1">
            Audit customer feedback. Only approved reviews display publicly on product pages.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-[#E5E5E5] p-1 text-xs">
          {(['all', 'pending', 'approved', 'hidden'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 capitalize font-medium transition-colors ${
                statusFilter === st ? 'bg-white text-[#111111]' : 'text-[#666666]'
              }`}
            >
              {st} ({reviews.filter((r) => st === 'all' || r.status === st).length})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#E5E5E5] overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F7F7F6] text-[#444444] uppercase text-[11px] tracking-wider font-semibold">
              <th className="py-3.5 px-4">Garment</th>
              <th className="py-3.5 px-3">Customer</th>
              <th className="py-3.5 px-3">Rating</th>
              <th className="py-3.5 px-3">Comment</th>
              <th className="py-3.5 px-3">Date</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 px-4 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {filteredReviews.map((r) => (
              <tr key={r.id} className="hover:bg-[#F9F9F8]">
                <td className="py-3 px-4 font-medium text-[#111111] max-w-xs truncate">
                  {r.productName}
                </td>
                <td className="py-3 px-3">
                  <p className="font-semibold text-[#111111]">{r.customerName}</p>
                  <p className="text-[10px] text-[#777777]">{r.customerEmail}</p>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center text-[#111111]">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i <= r.rating ? 'fill-[#111111]' : 'text-[#E5E5E5]'}`}
                      />
                    ))}
                  </div>
                </td>
                <td className="py-3 px-3 text-[#555555] max-w-md">
                  <p className="line-clamp-2 leading-relaxed">{r.comment}</p>
                </td>
                <td className="py-3 px-3 text-[#777777] whitespace-nowrap">
                  {formatDate(r.createdAt)}
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`text-[9px] uppercase font-bold px-2 py-0.5 ${
                      r.status === 'approved'
                        ? 'bg-[#EAF3ED] text-[#477A5A]'
                        : r.status === 'pending'
                        ? 'bg-[#FDF6E2] text-[#8C6D1F]'
                        : 'bg-[#FBEAEA] text-[#B74747]'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    {r.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(r.id)}
                        className="p-1.5 bg-[#EAF3ED] text-[#477A5A] hover:bg-[#d8edd9] rounded-none"
                        title="Approve & Publish"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {r.status !== 'hidden' && (
                      <button
                        onClick={() => handleHide(r.id)}
                        className="p-1.5 bg-[#F5F4F0] text-[#777777] hover:text-[#111111]"
                        title="Hide from store"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteId(r.id)}
                      className="p-1.5 text-[#B74747] hover:bg-[#FBEAEA]"
                      title="Delete review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredReviews.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#777777]">
                  No reviews in this queue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 border border-[#E5E5E5] space-y-4">
            <h3 className="text-base font-semibold text-[#111111]">Delete Review?</h3>
            <p className="text-xs text-[#777777]">
              This review will be permanently deleted from the feedback repository.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-[#B74747] text-white py-2 text-xs uppercase font-semibold"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="flex-1 border text-xs uppercase"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
