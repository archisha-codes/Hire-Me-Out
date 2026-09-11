import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TalentScoreBadge } from '../common/TalentScoreBadge';
import { MessageSquare, Heart, Share2, Plus, Sparkles, ShieldCheck } from 'lucide-react';

export const SocialFeedView: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(false);

  const loadPosts = async () => {
    try {
      const data = await api.getPosts();
      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!newContent.trim()) return;
    setLoading(true);
    try {
      await api.createPost({ content: newContent, type: 'MILESTONE' });
      setNewContent('');
      await loadPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: string) => {
    try {
      await api.likePost(id);
      await loadPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Post Creator Box */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-400" /> Share Learning Milestone or Project Update
        </h3>
        <textarea
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          rows={3}
          placeholder="Share your latest project, certification, or AI assessment milestone with recruiters and peers..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:border-brand-500 outline-none leading-relaxed"
        />
        <div className="flex justify-end">
          <button
            onClick={handleCreatePost}
            disabled={!newContent.trim() || loading}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-600/30 disabled:opacity-40"
          >
            {loading ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {posts.map((post, idx) => {
          const student = post.studentProfile || {};
          const user = student.user || {};
          return (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-brand-300 text-sm">
                    {user.name ? user.name[0] : 'S'}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{user.name || 'Candidate'}</h4>
                    <p className="text-[11px] text-slate-400">Verified Talent • {new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <TalentScoreBadge score={student.talentScore || 87} tier={student.talentTier || 'Tier A'} showDetails={false} size="sm" />
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">{post.content}</p>

              <div className="flex items-center gap-6 pt-3 border-t border-slate-800 text-xs text-slate-400">
                <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 hover:text-red-400">
                  <Heart className="w-4 h-4" /> <span>{post.likesCount || 0} Likes</span>
                </button>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> <span>{post.commentsCount || 0} Comments</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
