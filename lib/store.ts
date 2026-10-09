'use client';

import { 
  User, 
  Class, 
  Category, 
  Post, 
  MingguLiterasiPeriod, 
  Challenge, 
  Announcement, 
  ReadingBook, 
  LibraryBook,
  SchoolSettings,
  CertificateRecord,
  AuditLog,
  Comment,
  Reaction,
  Grade,
  Achievement,
  UserRole
} from './types';

// Initial Categories
const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', nama: 'Buku Harian', kode: 'buku-harian', ikon: '📔', isActive: true },
  { id: 'cat-2', nama: 'Sinopsis & Resensi Buku', kode: 'sinopsis-resensi', ikon: '📚', isActive: true },
  { id: 'cat-3', nama: 'Cerpen', kode: 'cerpen', ikon: '✍️', isActive: true },
  { id: 'cat-4', nama: 'Puisi', kode: 'puisi', ikon: '🌸', isActive: true },
  { id: 'cat-5', nama: 'Laporan Hasil Pengamatan', kode: 'laporan-pengamatan', ikon: '🔬', isActive: true },
  { id: 'cat-6', nama: 'Esai & Opini', kode: 'esai', ikon: '💬', isActive: true },
  { id: 'cat-7', nama: 'Berita & Artikel', kode: 'berita', ikon: '📰', isActive: true },
  { id: 'cat-8', nama: 'Dongeng & Cerita Rakyat', kode: 'dongeng', ikon: '🧚', isActive: true },
  { id: 'cat-9', nama: 'Lainnya', kode: 'lainnya', ikon: '📝', isActive: true },
];

// Initial Classes (Bersih)
const INITIAL_CLASSES: Class[] = [];

// Initial Users (Hanya Akun Admin Utama Bersih)
const INITIAL_USERS: User[] = [
  { 
    id: 'usr-admin', 
    username: 'admin', 
    nama: 'Admin Koordinator Literasi', 
    role: 'admin', 
    bio: 'Tim Admin IT E-Literasi MA NU 01 Banyuputih.', 
    poin: 0, 
    createdAt: '2026-08-01T06:00:00Z' 
  }
];

// Initial Scheduled Literacy Agendas (Bersih)
const INITIAL_PERIODS: MingguLiterasiPeriod[] = [];

// Initial Posts (Literacy works written by students)
const INITIAL_POSTS: Post[] = [];

// Initial Challenges
const INITIAL_CHALLENGES: Challenge[] = [];

// Initial Announcements
const INITIAL_ANNOUNCEMENTS: Announcement[] = [];

// Initial Reading Books
const INITIAL_READING_BOOKS: ReadingBook[] = [];

// Initial School Profile & Settings
const INITIAL_SCHOOL_SETTINGS: SchoolSettings = {
  namaMadrasah: 'MA NU 01 Banyuputih',
  motto: 'Generasi Literat, Berakhlak Mulia & Berprestasi Unggul',
  logoUrl: '',
  alamat: 'Jl. Lapangan Banyuputih No. 01, Kec. Banyuputih, Kab. Batang, Jawa Tengah',
  telepon: '(0285) 666123',
  email: 'manubanyuputih@gmail.com',
  tahunAjaran: '2026/2027',
  semester: 'Ganjil',
  kepalaMadrasahNama: 'H. Ahmad Muzaki, S.Ag.',
  kepalaMadrasahNip: '197508122005011003',
  koordinatorLiterasiNama: 'Pak Slamet Wibowo, S.Pd.',
  koordinatorLiterasiNip: '198203152009021004',
  poinSettings: {
    poinSetorKarya: 50,
    poinSuka: 5,
    poinKomentar: 10,
    poinBukuMandiri: 30,
    poinNilaiGuruMultiplier: 0.5,
  },
  updatedAt: '2026-09-15T08:30:00Z'
};

// Initial Library Books
const INITIAL_LIBRARY_BOOKS: LibraryBook[] = [];

// Initial Certificates
const INITIAL_CERTIFICATES: CertificateRecord[] = [];

// Initial Audit Logs
const INITIAL_AUDIT_LOGS: AuditLog[] = [];

// Standard Achievements List
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'ach-1', nama: 'Penulis Pemula', deskripsi: 'Publikasikan 1 tulisan pertamamu', ikon: '🌱', kriteria: 'Menulis 1 karya', poinDibutuhkan: 10 },
  { id: 'ach-2', nama: 'Rajin Berliterasi', deskripsi: 'Publikasikan minimal 5 tulisan di web', ikon: '📚', kriteria: 'Menulis 5 karya', poinDibutuhkan: 50 },
  { id: 'ach-3', nama: 'Pujangga Sastra', deskripsi: 'Mendapat 10 like dari karya-karyamu', ikon: '💖', kriteria: 'Mendapat 10 like', poinDibutuhkan: 100 },
  { id: 'ach-4', nama: 'Pejuang Minggu Literasi', deskripsi: 'Menyelesaikan 2 Minggu Literasi berturut-turut', ikon: '🏆', kriteria: 'Menyelesaikan 2 Minggu Literasi', poinDibutuhkan: 150 },
  { id: 'ach-5', nama: 'Master Literasi', deskripsi: 'Mencapai total 500 poin di web', ikon: '👑', kriteria: 'Mendapat total 500 poin', poinDibutuhkan: 500 },
];

// Auto-clean legacy mock posts and challenges from browser localStorage on initial update (preserve users and settings!)
if (typeof window !== 'undefined') {
  try {
    const CLEAN_KEY = 'eliterasi_clean_data_20261009';
    if (!localStorage.getItem(CLEAN_KEY)) {
      localStorage.removeItem('eliterasi_posts');
      localStorage.removeItem('eliterasi_periods');
      localStorage.removeItem('eliterasi_classes');
      localStorage.removeItem('eliterasi_challenges');
      localStorage.removeItem('eliterasi_announcements');
      localStorage.removeItem('eliterasi_reading_books');
      localStorage.removeItem('eliterasi_library_books');
      localStorage.removeItem('eliterasi_certificates');
      localStorage.removeItem('eliterasi_audit_logs');
      localStorage.setItem(CLEAN_KEY, 'true');
    }
  } catch (_) {}
}

export class LiteStore {
  private static getStored<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(`eliterasi_${key}`);
      if (!item || item === 'undefined' || item === 'null') return defaultValue;
      return JSON.parse(item);
    } catch (e) {
      console.warn(`[LiteStore] Corrupted JSON detected in eliterasi_${key}, healing back to default:`, e);
      try {
        localStorage.removeItem(`eliterasi_${key}`);
      } catch (_) {}
      return defaultValue;
    }
  }

  private static setStored<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`eliterasi_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error(e);
    }
  }

  // State Getters (Data Bersih Produksi)
  static getUsers(): User[] {
    const stored = this.getStored<User[]>('users', INITIAL_USERS);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      this.saveUsers(INITIAL_USERS);
      return INITIAL_USERS;
    }

    // Pastikan akun admin utama selalu tersedia dengan password yang sinkron
    const customAdminPass = this.getStored<string>('admin_password', '');
    const adminUser = stored.find(u => u.role === 'admin' || u.username === 'admin');
    if (!adminUser) {
      const newAdmin = { ...INITIAL_USERS[0], password: customAdminPass || undefined };
      const merged = [newAdmin, ...stored];
      this.saveUsers(merged);
      return merged;
    } else if (customAdminPass && adminUser.password !== customAdminPass) {
      adminUser.password = customAdminPass;
      this.saveUsers(stored);
    }
    return stored;
  }

  static getPosts(): Post[] {
    const stored = this.getStored<Post[]>('posts', INITIAL_POSTS);
    if (!stored || !Array.isArray(stored)) {
      this.savePosts(INITIAL_POSTS);
      return INITIAL_POSTS;
    }
    return stored;
  }

  static getPeriods(): MingguLiterasiPeriod[] {
    const stored = this.getStored<MingguLiterasiPeriod[]>('periods', INITIAL_PERIODS);
    if (!stored || !Array.isArray(stored)) {
      this.savePeriods(INITIAL_PERIODS);
      return INITIAL_PERIODS;
    }
    return stored;
  }

  static getClasses(): Class[] {
    const stored = this.getStored<Class[]>('classes', INITIAL_CLASSES);
    if (!stored || !Array.isArray(stored)) {
      this.saveClasses(INITIAL_CLASSES);
      return INITIAL_CLASSES;
    }
    return stored;
  }

  static getCategories(): Category[] {
    const stored = this.getStored<Category[]>('categories', INITIAL_CATEGORIES);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      this.saveCategories(INITIAL_CATEGORIES);
      return INITIAL_CATEGORIES;
    }
    const existingIds = new Set(stored.map(c => c.id));
    const missing = INITIAL_CATEGORIES.filter(c => !existingIds.has(c.id));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      this.saveCategories(merged);
      return merged;
    }
    return stored;
  }

  static getChallenges(): Challenge[] {
    const stored = this.getStored<Challenge[]>('challenges', INITIAL_CHALLENGES);
    if (!stored || !Array.isArray(stored)) {
      this.saveChallenges(INITIAL_CHALLENGES);
      return INITIAL_CHALLENGES;
    }
    return stored;
  }

  static getAnnouncements(): Announcement[] {
    const stored = this.getStored<Announcement[]>('announcements', INITIAL_ANNOUNCEMENTS);
    if (!stored || !Array.isArray(stored)) {
      this.saveAnnouncements(INITIAL_ANNOUNCEMENTS);
      return INITIAL_ANNOUNCEMENTS;
    }
    return stored;
  }

  static getReadingBooks(): ReadingBook[] {
    const stored = this.getStored<ReadingBook[]>('reading_books', INITIAL_READING_BOOKS);
    if (!stored || !Array.isArray(stored)) {
      this.saveReadingBooks(INITIAL_READING_BOOKS);
      return INITIAL_READING_BOOKS;
    }
    return stored;
  }

  static getSchoolSettings(): SchoolSettings {
    const stored = this.getStored<SchoolSettings>('school_settings', INITIAL_SCHOOL_SETTINGS);
    if (!stored || !stored.namaMadrasah) {
      this.saveSchoolSettings(INITIAL_SCHOOL_SETTINGS);
      return INITIAL_SCHOOL_SETTINGS;
    }
    return stored;
  }

  static getLibraryBooks(): LibraryBook[] {
    const stored = this.getStored<LibraryBook[]>('library_books', INITIAL_LIBRARY_BOOKS);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      this.saveLibraryBooks(INITIAL_LIBRARY_BOOKS);
      return INITIAL_LIBRARY_BOOKS;
    }
    const existingIds = new Set(stored.map(b => b.id));
    const missing = INITIAL_LIBRARY_BOOKS.filter(b => !existingIds.has(b.id));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      this.saveLibraryBooks(merged);
      return merged;
    }
    return stored;
  }

  static getCertificates(): CertificateRecord[] {
    const stored = this.getStored<CertificateRecord[]>('certificates', INITIAL_CERTIFICATES);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      this.saveCertificates(INITIAL_CERTIFICATES);
      return INITIAL_CERTIFICATES;
    }
    const existingIds = new Set(stored.map(c => c.id));
    const missing = INITIAL_CERTIFICATES.filter(c => !existingIds.has(c.id));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      this.saveCertificates(merged);
      return merged;
    }
    return stored;
  }

  static getAuditLogs(): AuditLog[] {
    const stored = this.getStored<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      this.saveAuditLogs(INITIAL_AUDIT_LOGS);
      return INITIAL_AUDIT_LOGS;
    }
    return stored;
  }

  static getCurrentUser(): User | null {
    return this.getStored<User | null>('current_user', null);
  }

  static resetToDefault(): void {
    if (typeof window === 'undefined') return;
    this.saveUsers(INITIAL_USERS);
    this.savePosts(INITIAL_POSTS);
    this.savePeriods(INITIAL_PERIODS);
    this.saveClasses(INITIAL_CLASSES);
    this.saveCategories(INITIAL_CATEGORIES);
    this.saveChallenges(INITIAL_CHALLENGES);
    this.saveAnnouncements(INITIAL_ANNOUNCEMENTS);
    this.saveReadingBooks(INITIAL_READING_BOOKS);
    this.saveSchoolSettings(INITIAL_SCHOOL_SETTINGS);
    this.saveLibraryBooks(INITIAL_LIBRARY_BOOKS);
    this.saveCertificates(INITIAL_CERTIFICATES);
    this.saveAuditLogs(INITIAL_AUDIT_LOGS);
  }

  // Mutators
  static saveUsers(users: User[]) { this.setStored('users', users); }
  static savePosts(posts: Post[]) { this.setStored('posts', posts); }
  static savePeriods(periods: MingguLiterasiPeriod[]) { this.setStored('periods', periods); }
  static saveClasses(classes: Class[]) { this.setStored('classes', classes); }
  static saveCategories(categories: Category[]) { this.setStored('categories', categories); }
  static saveChallenges(challenges: Challenge[]) { this.setStored('challenges', challenges); }
  static saveReadingBooks(books: ReadingBook[]) { this.setStored('reading_books', books); }
  static saveAnnouncements(anns: Announcement[]) { this.setStored('announcements', anns); }
  static saveSchoolSettings(settings: SchoolSettings) { this.setStored('school_settings', settings); }
  static saveLibraryBooks(books: LibraryBook[]) { this.setStored('library_books', books); }
  static saveCertificates(certs: CertificateRecord[]) { this.setStored('certificates', certs); }
  static saveAuditLogs(logs: AuditLog[]) { this.setStored('audit_logs', logs); }
  static saveCurrentUser(user: User | null) { this.setStored('current_user', user); }

  static updateUserBio(userId: string, bio: string): boolean {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return false;
    users[index].bio = bio;
    this.saveUsers(users);

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.bio = bio;
      this.saveCurrentUser(currentUser);
    }
    return true;
  }

  static updateUserPhoto(userId: string, fotoProfil: string): boolean {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return false;
    users[index].fotoProfil = fotoProfil;
    this.saveUsers(users);

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.fotoProfil = fotoProfil;
      this.saveCurrentUser(currentUser);
    }
    return true;
  }

  // Authentication
  static loginSiswa(nis: string, tanggalLahir: string): User | null {
    const users = this.getUsers();
    // Normalisasi format tanggal lahir siswa (misal user input dd-mm-yyyy atau ddmmyyyy)
    const normalizedInputDate = tanggalLahir.replace(/[-/]/g, '').trim(); // e.g. "17082010"
    
    const siswa = users.find(u => {
      if (u.role !== 'siswa' || !u.nis || !u.tanggalLahir) return false;
      const normalizedSiswaDate = u.tanggalLahir.replace(/[-/]/g, '').trim();
      return u.nis === nis && normalizedSiswaDate === normalizedInputDate;
    });

    if (siswa) {
      this.saveCurrentUser(siswa);
      return siswa;
    }
    return null;
  }

  static loginStaff(username: string, password: string): User | null {
    const users = this.getUsers();
    const staff = users.find(u => {
      if (u.role === 'siswa' || !u.username) return false;
      
      const isCorrectUser = u.username.toLowerCase() === username.toLowerCase().trim();
      if (!isCorrectUser) return false;

      // Cek password kustom admin persisten
      const customAdminPass = this.getStored<string>('admin_password', '');
      if (u.role === 'admin' && customAdminPass) {
        return password.trim() === customAdminPass;
      }

      // Jika user sudah memiliki password kustom yang disimpan
      if (u.password) {
        return u.password === password.trim();
      }

      // Password default bawaan
      if (u.role === 'admin' && !customAdminPass && password === 'admin123') return true;
      if (u.role === 'kepala_madrasah' && password === 'kepala123') return true;
      if (u.role === 'guru' && password === 'password123') return true;

      return false;
    });

    if (staff) {
      this.saveCurrentUser(staff);
      return staff;
    }
    return null;
  }

  static updateAdminPassword(newPassword: string): { success: boolean; message: string } {
    const trimmed = newPassword.trim();
    this.setStored('admin_password', trimmed);

    const users = this.getUsers();
    const adminIndex = users.findIndex(u => u.role === 'admin' || u.username === 'admin');
    if (adminIndex !== -1) {
      users[adminIndex].password = trimmed;
      this.saveUsers(users);
    }

    const currentUser = this.getCurrentUser();
    if (currentUser && (currentUser.role === 'admin' || currentUser.username === 'admin')) {
      currentUser.password = trimmed;
      this.saveCurrentUser(currentUser);
    }
    return { success: true, message: 'Kata sandi Administrator berhasil diperbarui!' };
  }

  static logout() {
    this.saveCurrentUser(null);
  }

  // Post Actions
  static createPost(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments' | 'reactions' | 'jumlahKata'>): Post {
    const posts = this.getPosts();
    const wordsCount = data.isi.trim().split(/\s+/).filter(Boolean).length;
    
    const newPost: Post = {
      ...data,
      id: `post-${Date.now()}`,
      jumlahKata: wordsCount,
      likes: [],
      comments: [],
      reactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    posts.unshift(newPost);
    this.savePosts(posts);

    // Tambah poin siswa jika status dipublikasikan
    if (data.status === 'published') {
      const users = this.getUsers();
      const userIndex = users.findIndex(u => u.id === data.authorId);
      if (userIndex !== -1) {
        // Tulisan Minggu Literasi bernilai 30 poin, tulisan bebas bernilai 15 poin
        const poinReward = data.isMingguLiterasi ? 30 : 15;
        users[userIndex].poin += poinReward;
        this.saveUsers(users);
        
        // Update current user if matching
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === data.authorId) {
          currentUser.poin += poinReward;
          this.saveCurrentUser(currentUser);
        }
      }
    }

    return newPost;
  }

  static updatePost(id: string, updates: Partial<Post>): Post | null {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) return null;

    const oldPost = posts[index];
    const isNowPublished = oldPost.status === 'draft' && updates.status === 'published';
    
    if (updates.isi !== undefined) {
      updates.jumlahKata = updates.isi.trim().split(/\s+/).filter(Boolean).length;
    }

    const updatedPost: Post = {
      ...oldPost,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    posts[index] = updatedPost;
    this.savePosts(posts);

    // Tambahkan poin jika baru dipublikasikan dari draft
    if (isNowPublished) {
      const users = this.getUsers();
      const userIndex = users.findIndex(u => u.id === oldPost.authorId);
      if (userIndex !== -1) {
        const poinReward = updatedPost.isMingguLiterasi ? 30 : 15;
        users[userIndex].poin += poinReward;
        this.saveUsers(users);
        
        // Update current user if matching
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === oldPost.authorId) {
          currentUser.poin += poinReward;
          this.saveCurrentUser(currentUser);
        }
      }
    }

    return updatedPost;
  }

  static deletePost(id: string): boolean {
    const posts = this.getPosts();
    const originalLength = posts.length;
    const filtered = posts.filter(p => p.id !== id);
    if (filtered.length === originalLength) return false;
    this.savePosts(filtered);
    return true;
  }

  static likePost(postId: string, userId: string): Post | null {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index === -1) return null;

    const post = posts[index];
    const likeIndex = post.likes.indexOf(userId);
    
    if (likeIndex === -1) {
      post.likes.push(userId);
      // Tambah poin pembuat tulisan ketika dapat like (+2 poin)
      const users = this.getUsers();
      const authorIndex = users.findIndex(u => u.id === post.authorId);
      if (authorIndex !== -1) {
        users[authorIndex].poin += 2;
        this.saveUsers(users);
      }
    } else {
      post.likes.splice(likeIndex, 1);
      // Kurangi poin jika unlike (-2 poin)
      const users = this.getUsers();
      const authorIndex = users.findIndex(u => u.id === post.authorId);
      if (authorIndex !== -1 && users[authorIndex].poin >= 2) {
        users[authorIndex].poin -= 2;
        this.saveUsers(users);
      }
    }

    posts[index] = post;
    this.savePosts(posts);
    return post;
  }

  static bookmarkPost(postId: string, userId: string): Post | null {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index === -1) return null;

    const post = posts[index];
    if (!post.bookmarks) {
      post.bookmarks = [];
    }

    const bmIndex = post.bookmarks.indexOf(userId);
    if (bmIndex === -1) {
      post.bookmarks.push(userId);
    } else {
      post.bookmarks.splice(bmIndex, 1);
    }

    posts[index] = post;
    this.savePosts(posts);
    return post;
  }

  static addComment(postId: string, data: { authorId: string; authorNama: string; authorRole: UserRole; authorKelas?: string; isi: string }): Comment | null {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index === -1) return null;

    const newComment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      postId,
      ...data,
      createdAt: new Date().toISOString()
    };

    const currentComments = Array.isArray(posts[index].comments) ? posts[index].comments : [];
    posts[index].comments = [...currentComments, newComment];
    this.savePosts(posts);

    // Tambahkan poin ke pembuat komentar (+1 poin) dan pembuat tulisan (+1 poin)
    const users = this.getUsers();
    const commenterIndex = users.findIndex(u => u.id === data.authorId);
    if (commenterIndex !== -1) {
      users[commenterIndex].poin += 1;
    }
    const authorIndex = users.findIndex(u => u.id === posts[index].authorId);
    if (authorIndex !== -1) {
      users[authorIndex].poin += 1;
    }
    this.saveUsers(users);

    return newComment;
  }

  static addReaction(postId: string, userId: string, tipeReaksi: 'kagum' | 'menginspirasi' | 'kreatif' | 'informatif'): Reaction[] | null {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index === -1) return null;

    const post = posts[index];
    const existingIndex = post.reactions.findIndex(r => r.userId === userId);

    if (existingIndex !== -1) {
      if (post.reactions[existingIndex].tipeReaksi === tipeReaksi) {
        // Jika klik reaksi yang sama, hapus reaksi
        post.reactions.splice(existingIndex, 1);
      } else {
        // Jika klik reaksi berbeda, ganti reaksi
        post.reactions[existingIndex].tipeReaksi = tipeReaksi;
      }
    } else {
      // Tambah reaksi baru
      post.reactions.push({
        id: `react-${Date.now()}`,
        postId,
        userId,
        tipeReaksi,
        createdAt: new Date().toISOString()
      });
      
      // Tambah poin (+1 poin ke pembuat tulisan)
      const users = this.getUsers();
      const authorIndex = users.findIndex(u => u.id === post.authorId);
      if (authorIndex !== -1) {
        users[authorIndex].poin += 1;
        this.saveUsers(users);
      }
    }

    posts[index] = post;
    this.savePosts(posts);
    return post.reactions;
  }

  static gradePost(postId: string, data: Omit<Grade, 'gradedAt'>): Post | null {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index === -1) return null;

    const oldGrade = posts[index].grade;
    const isFirstTimeGraded = !oldGrade;

    const newGrade: Grade = {
      ...data,
      gradedAt: new Date().toISOString()
    };

    posts[index].grade = newGrade;
    this.savePosts(posts);

    // Setiap nilai (0–100) yang disimpan langsung menambahkan bonus poin bintang (Nilai ÷ 2) ke akun siswa
    const users = this.getUsers();
    const authorIndex = users.findIndex(u => u.id === posts[index].authorId);
    if (authorIndex !== -1) {
      if (isFirstTimeGraded) {
        const bonusPoin = Math.round(data.skor / 2);
        users[authorIndex].poin = (users[authorIndex].poin || 0) + bonusPoin;
      } else {
        const oldBonus = Math.round((oldGrade.skor || 0) / 2);
        const newBonus = Math.round(data.skor / 2);
        users[authorIndex].poin = Math.max(0, (users[authorIndex].poin || 0) + (newBonus - oldBonus));
      }
      this.saveUsers(users);

      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === posts[index].authorId) {
        currentUser.poin = users[authorIndex].poin;
        this.saveCurrentUser(currentUser);
      }
    }

    return posts[index];
  }

  // Admin Actions
  static createPeriod(
    nama: string, 
    tanggalMulai: string, 
    tanggalSelesai: string,
    kategoriIdWajib: string = 'bebas',
    kategoriNamaWajib: string = 'Bebas (Pilihan Siswa)',
    temaInstruksi: string = '',
    izinkanBebas: boolean = true
  ): MingguLiterasiPeriod {
    const periods = this.getPeriods();
    
    const newPeriod: MingguLiterasiPeriod = {
      id: `per-${Date.now()}`,
      nama,
      tanggalPelaksanaan: tanggalMulai,
      tanggalMulai,
      tanggalSelesai,
      isActive: false,
      kategoriIdWajib,
      kategoriNamaWajib,
      temaInstruksi,
      izinkanBebas,
      createdAt: new Date().toISOString()
    };

    periods.push(newPeriod);
    this.savePeriods(periods);
    return newPeriod;
  }

  static setPeriodActive(periodId: string, isActive: boolean): MingguLiterasiPeriod[] {
    let periods = this.getPeriods();
    if (isActive) {
      // Nonaktifkan semua periode lain terlebih dahulu
      periods = periods.map(p => ({ ...p, isActive: false }));
    }
    
    periods = periods.map(p => {
      if (p.id === periodId) {
        return { ...p, isActive };
      }
      return p;
    });

    this.savePeriods(periods);
    return periods;
  }

  static createCategory(nama: string, kode: string, ikon: string): Category {
    const categories = this.getCategories();
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      nama,
      kode,
      ikon,
      isActive: true
    };
    categories.push(newCategory);
    this.saveCategories(categories);
    return newCategory;
  }

  static updateCategory(id: string, updates: Partial<Category>): Category | null {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return null;

    categories[index] = { ...categories[index], ...updates };
    this.saveCategories(categories);
    return categories[index];
  }

  static deleteCategory(id: string): boolean {
    const categories = this.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    if (filtered.length === categories.length) return false;
    this.saveCategories(filtered);
    return true;
  }

  // Student CRUD (Admin)
  static addStudent(data: { nis: string; nama: string; tanggalLahir: string; kelasId: string }): User {
    const users = this.getUsers();
    const classes = this.getClasses();
    const targetClass = classes.find(c => c.id === data.kelasId);

    const newUser: User = {
      id: `usr-sis-${Date.now()}`,
      nis: data.nis,
      nama: data.nama,
      tanggalLahir: data.tanggalLahir,
      kelasId: data.kelasId,
      kelasNama: targetClass ? targetClass.namaKelas : undefined,
      role: 'siswa',
      bio: 'Siswa MA NU 01 Banyuputih yang rajin menulis.',
      poin: 0,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  static updateStudent(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    const classes = this.getClasses();
    if (updates.kelasId) {
      const targetClass = classes.find(c => c.id === updates.kelasId);
      if (targetClass) {
        updates.kelasNama = targetClass.namaKelas;
      }
    }

    users[index] = { ...users[index], ...updates };
    this.saveUsers(users);
    return users[index];
  }

  static deleteUser(id: string): boolean {
    const users = this.getUsers();
    const originalLength = users.length;
    const target = users.find(u => u.id === id);
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === originalLength) return false;
    this.saveUsers(filtered);
    if (target) {
      this.addAuditLog('HAPUS_USER', `Menghapus akun ${target.nama} (${target.role.toUpperCase()})`);
    }
    return true;
  }

  // Class Management Operations (Admin)
  static addClass(data: { namaKelas: string; tingkat: 'X' | 'XI' | 'XII'; tahunAjaran: string; waliKelasId?: string; waliKelasNama?: string }): Class {
    const classes = this.getClasses();
    const newClass: Class = {
      id: `cls-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      namaKelas: data.namaKelas.trim(),
      tingkat: data.tingkat,
      tahunAjaran: data.tahunAjaran.trim() || '2026/2027',
      waliKelasId: data.waliKelasId || '',
      waliKelasNama: data.waliKelasNama || '-'
    };
    classes.push(newClass);
    this.saveClasses(classes);
    this.addAuditLog('LAINNYA', `Menambahkan rombel kelas baru: ${newClass.namaKelas} (${newClass.tingkat})`);
    return newClass;
  }

  static updateClass(id: string, updates: Partial<Class>): Class | null {
    const classes = this.getClasses();
    const idx = classes.findIndex(c => c.id === id);
    if (idx === -1) return null;
    classes[idx] = { ...classes[idx], ...updates };
    this.saveClasses(classes);

    // Sync kelasNama ke data siswa jika nama kelas berubah
    if (updates.namaKelas) {
      const users = this.getUsers();
      let hasChange = false;
      users.forEach(u => {
        if (u.kelasId === id) {
          u.kelasNama = updates.namaKelas;
          hasChange = true;
        }
      });
      if (hasChange) this.saveUsers(users);
    }

    this.addAuditLog('LAINNYA', `Memperbarui data kelas: ${classes[idx].namaKelas}`);
    return classes[idx];
  }

  static deleteClass(id: string): boolean {
    const classes = this.getClasses();
    const target = classes.find(c => c.id === id);
    if (!target) return false;
    const filtered = classes.filter(c => c.id !== id);
    this.saveClasses(filtered);
    this.addAuditLog('LAINNYA', `Menghapus data kelas: ${target.namaKelas}`);
    return true;
  }

  // Teacher / Staff Operations
  static addTeacher(data: { username: string; nama: string; bio?: string; role?: 'guru' | 'kepala_madrasah' | 'admin' }): User {
    const users = this.getUsers();
    const newTeacher: User = {
      id: `usr-stf-${Date.now()}`,
      username: data.username.trim().toLowerCase(),
      nama: data.nama.trim(),
      role: data.role || 'guru',
      bio: data.bio?.trim() || 'Guru Pembimbing Literasi MA NU 01 Banyuputih.',
      poin: 0,
      createdAt: new Date().toISOString()
    };
    users.push(newTeacher);
    this.saveUsers(users);
    this.addAuditLog('TAMBAH_USER', `Mendaftarkan guru/staff baru: ${newTeacher.nama} (${newTeacher.role.toUpperCase()})`);
    return newTeacher;
  }

  // Reading List Actions (Siswa)
  static addReadingBook(data: Omit<ReadingBook, 'id' | 'createdAt'>): ReadingBook {
    const books = this.getReadingBooks();
    const newBook: ReadingBook = {
      ...data,
      id: `book-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    books.unshift(newBook);
    this.saveReadingBooks(books);

    // Berikan poin kecil (+5 poin) karena menambahkan buku bacaan
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === data.userId);
    if (userIndex !== -1) {
      users[userIndex].poin += 5;
      this.saveUsers(users);
      
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === data.userId) {
        currentUser.poin += 5;
        this.saveCurrentUser(currentUser);
      }
    }

    return newBook;
  }

  static updateReadingBookStatus(id: string, status: 'sedang' | 'sudah' | 'rencana'): ReadingBook | null {
    const books = this.getReadingBooks();
    const index = books.findIndex(b => b.id === id);
    if (index === -1) return null;

    const oldBook = books[index];
    books[index] = { ...oldBook, statusBaca: status };
    this.saveReadingBooks(books);

    // Berikan tambahan poin (+15 poin) jika selesai membaca buku (status 'sudah')
    if (oldBook.statusBaca !== 'sudah' && status === 'sudah') {
      const users = this.getUsers();
      const userIndex = users.findIndex(u => u.id === oldBook.userId);
      if (userIndex !== -1) {
        users[userIndex].poin += 15;
        this.saveUsers(users);
        
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === oldBook.userId) {
          currentUser.poin += 15;
          this.saveCurrentUser(currentUser);
        }
      }
    }

    return books[index];
  }

  static deleteReadingBook(id: string): boolean {
    const books = this.getReadingBooks();
    const originalLength = books.length;
    const filtered = books.filter(b => b.id !== id);
    if (filtered.length === originalLength) return false;
    this.saveReadingBooks(filtered);
    return true;
  }

  // Challenges (Admin / Guru)
  static addChallenge(data: Omit<Challenge, 'id' | 'peserta'>): Challenge {
    const challenges = this.getChallenges();
    const newChallenge: Challenge = {
      ...data,
      id: `ch-${Date.now()}`,
      peserta: []
    };
    challenges.push(newChallenge);
    this.saveChallenges(challenges);
    return newChallenge;
  }

  static joinChallenge(challengeId: string, userId: string): boolean {
    const challenges = this.getChallenges();
    const index = challenges.findIndex(c => c.id === challengeId);
    if (index === -1) return false;

    const challenge = challenges[index];
    if (challenge.peserta.includes(userId)) return false; // Sudah gabung

    challenge.peserta.push(userId);
    challenges[index] = challenge;
    this.saveChallenges(challenges);
    return true;
  }

  static completeChallenge(challengeId: string, userId: string): { success: boolean; poin: number; message: string } {
    const challenges = this.getChallenges();
    const index = challenges.findIndex(c => c.id === challengeId);
    if (index === -1) return { success: false, poin: 0, message: 'Tantangan tidak ditemukan.' };

    const challenge = challenges[index];
    if (!challenge.peserta.includes(userId)) {
      return { success: false, poin: 0, message: 'Kamu belum bergabung dalam tantangan ini.' };
    }

    if (!challenge.selesaikanPeserta) {
      challenge.selesaikanPeserta = [];
    }

    if (challenge.selesaikanPeserta.includes(userId)) {
      return { success: false, poin: 0, message: 'Kamu sudah menyelesaikan tantangan ini dan reward poin telah dicairkan.' };
    }

    // Tandai selesai
    challenge.selesaikanPeserta.push(userId);
    challenges[index] = challenge;
    this.saveChallenges(challenges);

    // Berikan reward poin penuh tantangan
    const bonusPoin = challenge.poinBonus || 50;
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].poin += bonusPoin;
      this.saveUsers(users);

      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        currentUser.poin += bonusPoin;
        this.saveCurrentUser(currentUser);
      }
    }

    return { 
      success: true, 
      poin: bonusPoin, 
      message: `Selamat! Kamu berhasil menuntaskan tantangan "${challenge.judul}" dan memperoleh reward penuh +${bonusPoin} poin!` 
    };
  }

  // Announcements (Admin)
  static addAnnouncement(judul: string, isi: string, createdBy: string): Announcement {
    const announcements = this.getAnnouncements();
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      judul,
      isi,
      createdBy,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    announcements.unshift(newAnn);
    this.saveAnnouncements(announcements);
    return newAnn;
  }

  static toggleAnnouncementActive(id: string): boolean {
    const announcements = this.getAnnouncements();
    const index = announcements.findIndex(a => a.id === id);
    if (index === -1) return false;

    announcements[index].isActive = !announcements[index].isActive;
    this.saveAnnouncements(announcements);
    return true;
  }

  static deleteAnnouncement(id: string): boolean {
    const announcements = this.getAnnouncements();
    const filtered = announcements.filter(a => a.id !== id);
    if (filtered.length === announcements.length) return false;
    this.saveAnnouncements(filtered);
    return true;
  }

  // Audit Logs
  static addAuditLog(
    action: AuditLog['action'], 
    detail: string, 
    options?: { userId?: string; userNama?: string; userRole?: string; targetId?: string; targetName?: string }
  ): AuditLog {
    const logs = this.getAuditLogs();
    const currentUser = this.getCurrentUser();
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: options?.userId || currentUser?.id || 'usr-admin',
      userNama: options?.userNama || currentUser?.nama || 'Admin Koordinator',
      userRole: options?.userRole || currentUser?.role || 'admin',
      action,
      detail,
      targetId: options?.targetId,
      targetName: options?.targetName,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    // Keep last 200 logs
    const trimmed = logs.slice(0, 200);
    this.saveAuditLogs(trimmed);
    return newLog;
  }

  static clearAuditLogs(): void {
    this.saveAuditLogs([]);
  }

  // User Management Updates (Admin)
  static updateUserAccount(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    const classes = this.getClasses();
    if (updates.kelasId) {
      const targetClass = classes.find(c => c.id === updates.kelasId);
      if (targetClass) {
        updates.kelasNama = targetClass.namaKelas;
      }
    }

    const previousUser = users[index];
    const updatedUser = { ...previousUser, ...updates };
    users[index] = updatedUser;
    this.saveUsers(users);

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === id) {
      this.saveCurrentUser(updatedUser);
    }

    this.addAuditLog('EDIT_USER', `Memperbarui data akun pengguna: ${updatedUser.nama} (${updatedUser.role.toUpperCase()})`, {
      targetId: id,
      targetName: updatedUser.nama
    });

    return updatedUser;
  }

  static resetUserPassword(id: string, newPinOrPass: string): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return { success: false, message: 'Pengguna tidak ditemukan' };

    const targetUser = users[index];
    if (targetUser.role === 'siswa') {
      targetUser.tanggalLahir = newPinOrPass.replace(/[-/]/g, '').trim(); // tanggal lahir digunakan sebagai PIN siswa
    } else {
      targetUser.password = newPinOrPass.trim();
    }
    users[index] = targetUser;
    this.saveUsers(users);

    this.addAuditLog('RESET_PASSWORD', `Mereset password/PIN login untuk ${targetUser.nama} (${targetUser.role === 'siswa' ? 'NIS: ' + (targetUser.nis || '-') : 'Username: ' + (targetUser.username || '-')})`, {
      targetId: id,
      targetName: targetUser.nama
    });

    return { 
      success: true, 
      message: `Password/PIN akun ${targetUser.nama} berhasil direset menjadi: ${newPinOrPass}`,
      user: targetUser
    };
  }

  // School Profile Settings
  static updateSchoolSettings(updates: Partial<SchoolSettings>): SchoolSettings {
    const current = this.getSchoolSettings();
    const updated: SchoolSettings = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveSchoolSettings(updated);

    this.addAuditLog('UPDATE_PENGATURAN', `Memperbarui konfigurasi profil dan branding madrasah (${updated.namaMadrasah}, TA ${updated.tahunAjaran} ${updated.semester})`);
    return updated;
  }

  // Certificate Management
  static createCertificate(data: Omit<CertificateRecord, 'id' | 'createdAt'>): CertificateRecord {
    const certs = this.getCertificates();
    const newCert: CertificateRecord = {
      ...data,
      id: `cert-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    certs.unshift(newCert);
    this.saveCertificates(certs);

    // Tambah bonus poin istimewa (+100 poin) untuk penerima sertifikat
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === data.userId);
    if (userIndex !== -1) {
      users[userIndex].poin += 100;
      this.saveUsers(users);

      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === data.userId) {
        currentUser.poin += 100;
        this.saveCurrentUser(currentUser);
      }
    }

    this.addAuditLog('TERBITKAN_SERTIFIKAT', `Menerbitkan Piagam Sertifikat Literasi No. ${newCert.nomorSertifikat} untuk ${newCert.namaPenerima} (${newCert.judulPenghargaan})`, {
      targetId: newCert.userId,
      targetName: newCert.namaPenerima
    });

    return newCert;
  }

  static deleteCertificate(id: string): boolean {
    const certs = this.getCertificates();
    const cert = certs.find(c => c.id === id);
    const filtered = certs.filter(c => c.id !== id);
    if (filtered.length === certs.length) return false;
    this.saveCertificates(filtered);

    if (cert) {
      this.addAuditLog('HAPUS_SERTIFIKAT', `Menghapus data e-sertifikat No. ${cert.nomorSertifikat} (${cert.namaPenerima})`, {
        targetId: cert.id,
        targetName: cert.namaPenerima
      });
    }

    return true;
  }

  // Library Books Management (Perpustakaan Madrasah)
  static addLibraryBook(data: Omit<LibraryBook, 'id' | 'createdAt' | 'dibacaCount'>): LibraryBook {
    const books = this.getLibraryBooks();
    const newBook: LibraryBook = {
      ...data,
      id: `lib-${Date.now()}`,
      dibacaCount: 0,
      createdAt: new Date().toISOString()
    };
    books.unshift(newBook);
    this.saveLibraryBooks(books);

    this.addAuditLog('TAMBAH_BUKU', `Menambahkan buku baru ke katalog perpustakaan: "${newBook.judul}" oleh ${newBook.penulis}`, {
      targetId: newBook.id,
      targetName: newBook.judul
    });

    return newBook;
  }

  static updateLibraryBook(id: string, updates: Partial<LibraryBook>): LibraryBook | null {
    const books = this.getLibraryBooks();
    const index = books.findIndex(b => b.id === id);
    if (index === -1) return null;

    books[index] = { ...books[index], ...updates };
    this.saveLibraryBooks(books);

    this.addAuditLog('EDIT_BUKU', `Memperbarui katalog buku: "${books[index].judul}"`, {
      targetId: id,
      targetName: books[index].judul
    });

    return books[index];
  }

  static deleteLibraryBook(id: string): boolean {
    const books = this.getLibraryBooks();
    const targetBook = books.find(b => b.id === id);
    const filtered = books.filter(b => b.id !== id);
    if (filtered.length === books.length) return false;
    this.saveLibraryBooks(filtered);

    if (targetBook) {
      this.addAuditLog('HAPUS_BUKU', `Menghapus buku "${targetBook.judul}" dari katalog perpustakaan`, {
        targetId: id,
        targetName: targetBook.judul
      });
    }

    return true;
  }
}
