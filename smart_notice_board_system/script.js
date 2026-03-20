const _supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
let userRole = null; 
let allNotices = [];
let activeCategory = 'All';

function handleLogin() {
    const email = document.getElementById('email').value.toLowerCase();
    const pass = document.getElementById('password').value;
    if (email.includes('admin') && pass === CONFIG.ADMIN_PASS) {
        userRole = 'admin';
        initPortal();
    } else if (email.includes('student') && pass === CONFIG.STUDENT_PASS) {
        userRole = 'student';
        initPortal();
    } else { alert("Invalid Access"); }
}

function initPortal() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('nav-home').classList.remove('hidden');
    document.getElementById('nav-logout').classList.remove('hidden');
    if (userRole === 'admin') document.getElementById('nav-admin').classList.remove('hidden');
    loadNotices();
    showPage('home');
    enableRealtime();
}

async function loadNotices() {
    const { data } = await _supabase.from('notices').select('*').order('created_at', { ascending: false });
    allNotices = data || [];
    applyFilters();
}

function render(data) {
    const board = document.getElementById('noticeBoard');
    board.innerHTML = data.map(n => {
        const fileUrl = n.file_path ? `${CONFIG.SUPABASE_URL}/storage/v1/object/public/notices-files/${n.file_path}` : null;
        return `
        <div class="notice-card page-transition">
            <span class="text-[10px] font-bold text-[#D4AF37] uppercase">${n.category}</span>
            <h3 class="font-bold text-white text-lg my-2">${n.title}</h3>
            <p class="text-slate-400 text-sm mb-4">${n.content}</p>
            <div class="flex justify-between items-center pt-4 border-t border-white/10">
                <span class="text-[10px] text-slate-500">${new Date(n.created_at).toLocaleDateString()}</span>
                <div class="flex gap-4">
                    ${fileUrl ? `<a href="${fileUrl}" target="_blank" class="btn-download">📂 Download</a>` : ''}
                    ${userRole === 'admin' ? `<button onclick="deleteNotice('${n.id}', '${n.file_path}')" class="btn-delete">Delete</button>` : ''}
                </div>
            </div>
        </div>`;
    }).join('');
}

async function addNotice() {
    const title = document.getElementById('noticeTitle').value.trim();
    const content = document.getElementById('noticeContent').value;
    const category = document.getElementById('noticeCategory').value;
    const file = document.getElementById('fileInput').files[0];
    const btn = document.getElementById('postBtn');

    if(!title || !content) {
        alert("Please fill in both the Title and Content.");
        return;
    }

    // DUPLICATE CHECK
    const { data: existing } = await _supabase.from('notices').select('id, file_path').eq('title', title);
    if (existing && existing.length > 0) {
        // ALERT FOR DUPLICATE
        const replace = confirm("A notice with this title already exists. Do you want to REPLACE the old one?");
        if (!replace) return;
        
        await deleteNotice(existing[0].id, existing[0].file_path, true); // Silent delete for replacement
    }

    btn.disabled = true;
    btn.innerText = "Publishing...";

    let filePath = null;
    if (file) {
        filePath = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        await _supabase.storage.from('notices-files').upload(filePath, file);
    }

    const { error } = await _supabase.from('notices').insert([{ title, content, category, file_path: filePath }]);
    
    if (!error) {
        alert("Notice successfully published to the board!"); // SUCCESS ALERT
        document.getElementById('noticeTitle').value = "";
        document.getElementById('noticeContent').value = "";
        showPage('home');
    } else {
        alert("Error publishing notice. Please try again.");
    }
    
    btn.disabled = false;
    btn.innerText = "Publish to Board";
}

async function deleteNotice(id, filePath, isReplacing = false) {
    // ALERT FOR DELETION (only if not replacing)
    if (!isReplacing) {
        const proceed = confirm("Are you sure you want to permanently delete this notice?");
        if (!proceed) return;
    }

    if (filePath && filePath !== 'null') {
        await _supabase.storage.from('notices-files').remove([filePath]);
    }

    const { error } = await _supabase.from('notices').delete().eq('id', id);
    
    if (!error && !isReplacing) {
        alert("Notice has been removed."); // DELETE SUCCESS ALERT
    }
    
    loadNotices();
}


function enableRealtime() {
    _supabase.channel('notices-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, () => loadNotices()).subscribe();
}

function showPage(id) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id + 'Page').classList.remove('hidden');
}

function setCategory(cat) {
    activeCategory = cat;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.innerText === (cat === 'Examination' ? 'Exams' : cat)));
    applyFilters();
}

function applyFilters() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allNotices.filter(n => (n.title.toLowerCase().includes(term) || n.content.toLowerCase().includes(term)) && (activeCategory === 'All' || n.category === activeCategory));
    render(filtered);
}