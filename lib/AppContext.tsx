'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Class, 
  Category, 
  Post, 
  MingguLiterasiPeriod, 
  Challenge, 
  Announcement, 
  ReadingBook,
  Comment 
} from './types';
import { LiteStore } from './store';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  posts: Post[];
  periods: MingguLiterasiPeriod[];
  classes: Class[];
  categories: Category[];
  challenges: Challenge[];
  announcements: Announcement[];
  readingBooks: ReadingBook[];
  activePeriod: MingguLiterasiPeriod | null;
  mounted: boolean;
  
  // Auth methods
  loginSiswa: (nis: string, tanggalLahir: string) => boolean;
  loginStaff: (username: string, password: string) => boolean;
  logout: () => void;
  setCurrentUser: (user: User | null) => void;

  // Post Actions
  createPost: (data: any) => void;
  updatePost: (id: string, updates: any) => void;
  deletePost: (id: string) => void;
  likePost: (postId: string) => boolean;
  bookmarkPost: (postId: string) => boolean;
  commentPost: (postId: string, text: string) => Comment | null;
  reactPost: (postId: string, reactionType: 'kagum' | 'menginspirasi' | 'kreatif' | 'informatif') => boolean;
  gradePost: (postId: string, score: number, feedback: string) => boolean;

  // Reading & Challenge Actions
  addReadingBook: (book: any) => void;
  updateReadingBookStatus: (id: string, status: any) => void;
  deleteReadingBook: (id: string) => void;
  joinChallenge: (challengeId: string) => void;
  completeChallenge: (challengeId: string) => { success: boolean; poin: number; message: string };

  // Sync
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [periods, setPeriods] = useState<MingguLiterasiPeriod[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [readingBooks, setReadingBooks] = useState<ReadingBook[]>([]);

  const syncAll = () => {
    setUsers(LiteStore.getUsers());
    setPosts(LiteStore.getPosts());
    setPeriods(LiteStore.getPeriods());
    setClasses(LiteStore.getClasses());
    setCategories(LiteStore.getCategories());
    setChallenges(LiteStore.getChallenges());
    setAnnouncements(LiteStore.getAnnouncements());
    setReadingBooks(LiteStore.getReadingBooks());
    setCurrentUser(LiteStore.getCurrentUser());
  };

  useEffect(() => {
    syncAll();
    setMounted(true);
  }, []);

  const loginSiswa = (nis: string, tanggalLahir: string): boolean => {
    const user = LiteStore.loginSiswa(nis.trim(), tanggalLahir.trim());
    if (user) {
      setCurrentUser(user);
      syncAll();
      return true;
    }
    return false;
  };

  const loginStaff = (username: string, password: string): boolean => {
    const user = LiteStore.loginStaff(username.trim(), password.trim());
    if (user) {
      setCurrentUser(user);
      syncAll();
      return true;
    }
    return false;
  };

  const logout = () => {
    LiteStore.logout();
    setCurrentUser(null);
    syncAll();
  };

  const createPost = (data: any) => {
    LiteStore.createPost(data);
    syncAll();
  };

  const updatePost = (id: string, updates: any) => {
    LiteStore.updatePost(id, updates);
    syncAll();
  };

  const deletePost = (id: string) => {
    LiteStore.deletePost(id);
    syncAll();
  };

  const likePost = (postId: string): boolean => {
    if (!currentUser) return false;
    const updated = LiteStore.likePost(postId, currentUser.id);
    if (updated) {
      setPosts(prev => prev.map(p => p.id === postId ? updated : p));
    }
    return true;
  };

  const bookmarkPost = (postId: string): boolean => {
    if (!currentUser) return false;
    const updated = LiteStore.bookmarkPost(postId, currentUser.id);
    if (updated) {
      setPosts(prev => prev.map(p => p.id === postId ? updated : p));
    }
    return true;
  };

  const commentPost = (postId: string, text: string): Comment | null => {
    if (!currentUser) return null;
    const newComment = LiteStore.addComment(postId, {
      authorId: currentUser.id,
      authorNama: currentUser.nama,
      authorRole: currentUser.role,
      authorKelas: currentUser.kelasNama,
      isi: text
    });
    if (newComment) {
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const currentComments = Array.isArray(p.comments) ? p.comments : [];
          if (currentComments.some(c => c.id === newComment.id)) {
            return p;
          }
          return {
            ...p,
            comments: [...currentComments, newComment]
          };
        }
        return p;
      }));
    }
    return newComment;
  };

  const reactPost = (postId: string, reactionType: 'kagum' | 'menginspirasi' | 'kreatif' | 'informatif'): boolean => {
    if (!currentUser) return false;
    const updatedReactions = LiteStore.addReaction(postId, currentUser.id, reactionType);
    if (updatedReactions) {
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            reactions: updatedReactions
          };
        }
        return p;
      }));
    }
    return true;
  };

  const gradePost = (postId: string, score: number, feedback: string): boolean => {
    if (!currentUser || (currentUser.role !== 'guru' && currentUser.role !== 'admin')) return false;
    const updatedPost = LiteStore.gradePost(postId, {
      skor: score,
      catatan: feedback,
      guruId: currentUser.id,
      guruNama: currentUser.nama
    });
    if (updatedPost) {
      setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
    }
    return true;
  };

  const addReadingBook = (book: any) => {
    LiteStore.addReadingBook(book);
    syncAll();
  };

  const updateReadingBookStatus = (id: string, status: any) => {
    LiteStore.updateReadingBookStatus(id, status);
    syncAll();
  };

  const deleteReadingBook = (id: string) => {
    LiteStore.deleteReadingBook(id);
    syncAll();
  };

  const joinChallenge = (challengeId: string) => {
    if (!currentUser) return;
    LiteStore.joinChallenge(challengeId, currentUser.id);
    syncAll();
  };

  const completeChallenge = (challengeId: string) => {
    if (!currentUser) return { success: false, poin: 0, message: 'Silakan login terlebih dahulu.' };
    const res = LiteStore.completeChallenge(challengeId, currentUser.id);
    if (res.success) {
      syncAll();
    }
    return res;
  };

  // Periode hanya dianggap aktif jika isActive = true DAN tanggal hari ini berada di antara tanggalMulai/tanggalPelaksanaan sampai tanggalSelesai
  const activePeriod = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    return periods.find(p => {
      if (!p.isActive) return false;
      const tMulai = p.tanggalPelaksanaan || p.tanggalMulai;
      const tSelesai = p.tanggalSelesai || p.tanggalPelaksanaan || p.tanggalMulai;
      if (tMulai && today < tMulai) return false; // Belum dimulai
      if (tSelesai && today > tSelesai) return false; // Sudah lewat
      return true;
    }) || null;
  }, [periods]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        posts,
        periods,
        classes,
        categories,
        challenges,
        announcements,
        readingBooks,
        activePeriod,
        mounted,
        loginSiswa,
        loginStaff,
        logout,
        setCurrentUser,
        createPost,
        updatePost,
        deletePost,
        likePost,
        bookmarkPost,
        commentPost,
        reactPost,
        gradePost,
        addReadingBook,
        updateReadingBookStatus,
        deleteReadingBook,
        joinChallenge,
        completeChallenge,
        refreshData: syncAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
