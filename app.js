```javascript
// app.js

// --- Firebase Configuration ---
// IMPORTANT: Replace with your actual Firebase project config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // Replace
    authDomain: "YOUR_AUTH_DOMAIN", // Replace
    projectId: "YOUR_PROJECT_ID", // Replace
    storageBucket: "YOUR_STORAGE_BUCKET", // Replace
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace
    appId: "YOUR_APP_ID", // Replace
    measurementId: "YOUR_MEASUREMENT_ID" // Optional
  };

// --- Initialize Firebase ---
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
// const storage = firebase.storage(); // Keep if you plan to use file storage

// --- Roles Definition ---
const ROLES = {
    ADMIN: 'admin',
    LEAD_AUDITOR: 'lead_auditor',
    AUDITOR: 'auditor'
};

// --- Permission Mapping ---
const PERMISSIONS = {
    manage_users: [ROLES.ADMIN],
    create_audit: [ROLES.ADMIN, ROLES.LEAD_AUDITOR, ROLES.AUDITOR],
    edit_audit: [ROLES.ADMIN, ROLES.LEAD_AUDITOR, ROLES.AUDITOR], // Fine-grained check in canEditAudit
    submit_audit: [ROLES.ADMIN, ROLES.LEAD_AUDITOR, ROLES.AUDITOR],
    view_all_audits: [ROLES.ADMIN, ROLES.LEAD_AUDITOR, ROLES.AUDITOR],
    view_dashboard: [ROLES.ADMIN, ROLES.LEAD_AUDITOR, ROLES.AUDITOR],
    view_reports: [ROLES.ADMIN, ROLES.LEAD_AUDITOR, ROLES.AUDITOR],
    generate_reports: [ROLES.ADMIN, ROLES.LEAD_AUDITOR, ROLES.AUDITOR],
    export_data: [ROLES.ADMIN, ROLES.LEAD_AUDITOR, ROLES.AUDITOR]
};

// --- Hardcoded Data ---
const LEAD_AUDITOR_NAMES = [
    "Fatoki Samson", "Biyama Kalang", "Bolanle Ikusagba", "Chinyelu Danga",
    "Folashade Osho", "Ifudu N", "Kem Ashibuogwu", "Khadijah Ade-Abolade",
    "Onwualu Rosemary", "Stephanie Adeoye", "Sunday Adown", "Vivien Ibeh",
    "Wendy Ndugbu"
];

const DIRECTORATES = [
    "Registration and Regulatory Affairs (R&R)", "Laboratory Services (Food)",
    "Laboratory Services (Drug)", "Chemical Evaluation and Research (CER)",
    "Food Safety and Applied Nutrition (FSAN)", "Pharmacovigilance (PV)",
    "Post-Marketing Surveillance (PMS)", "Investigation and Enforcement (I&E)",
    "Port Inspection Directorate (PID)", "Veterinary Medicines and Allied Products (VMAP)",
    "Planning, Research and Statistics (PRS)", "Administration and Human Resources (A&HR)",
    "Finance and Accounts (F&A)", "Legal Services"
];
// --- End Hardcoded Data ---


// --- DOM Elements ---
const loadingSpinner = document.getElementById('loading-spinner');
const loginScreen = document.getElementById('login-screen');
const appContainer = document.getElementById('app-container');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');
const googleLoginBtn = document.getElementById('google-login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const userEmail = document.getElementById('user-email'); // Displays logged-in user name/email
const navItems = document.querySelectorAll('nav li');
const contentSections = document.querySelectorAll('.content-section');
const quickNewAuditBtn = document.getElementById('quick-new-audit');
const quickExportBtn = document.getElementById('quick-export');
// User Management Elements
const userManagementSection = document.getElementById('user-management-section');
const userListContainer = document.getElementById('user-list-container');
// Modal elements
const modal = document.getElementById('audit-detail-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const editAuditBtn = document.getElementById('edit-audit-btn');
const exportAuditBtn = document.getElementById('export-audit-btn');
const closeModalButton = document.querySelector('.close-modal');
const closeModalBtnFooter = document.getElementById('close-modal-btn');
// Report elements
const reportResults = document.getElementById('report-results');
const reportChartContainer = document.querySelector('.report-chart-container');
const reportTableContainer = document.getElementById('report-table-container');
const reportChartCanvas = document.getElementById('report-chart');
// History elements
const auditHistoryList = document.getElementById('audit-history-list');
const areaFilterHistory = document.getElementById('audit-area-filter');
// Dashboard elements
const recentAuditsList = document.getElementById('recent-audits-list');
const complianceChartCanvas = document.getElementById('compliance-chart');
const ncChartCanvas = document.getElementById('nc-chart');
// New Audit form elements
const auditForm = document.getElementById('audit-form');
const auditDateInput = document.getElementById('audit-date');
const directorateUnitSelect = document.getElementById('directorate-unit-select'); // Changed to Select
const leadAuditorsSelect = document.getElementById('lead-auditors-select'); // Hardcoded Names
const auditorsSelect = document.getElementById('auditors-select');       // Fetched Users
const refNoInput = document.getElementById('ref-no');
const checklistContainer = document.getElementById('checklist-container');
const saveDraftBtn = document.getElementById('save-draft-btn');
const submitAuditBtn = document.getElementById('submit-audit-btn');


// --- Audit Checklist Data ---
const auditChecklist = [
    { id: 1, requirement: "Identification of interested parties and needs", clause: "4.1" },
    { id: 2, requirement: "Process flow (interaction)", clause: "4.4" },
    { id: 3, requirement: "Organogram", clause: "4.4.1" },
    { id: 4, requirement: "Master list, SOP index, Records list", clause: "4.4.1" },
    { id: 5, requirement: "Quality manual - awareness", clause: "4.1" },
    { id: 6, requirement: "Quality Policy - awareness", clause: "5.2.2" },
    { id: 7, requirement: "JD for Quality manager, Appointment letter /acceptance, Appointment of quality team", clause: "5.3" },
    { id: 8, requirement: "SOP Risk management, Training /awareness, Constitution of RMT, Risk identification, Risk analysis /risk register, Use of annexures", clause: "6.1.1" },
    { id: 9, requirement: "Quality objectives, Awareness, Action plan", clause: "6.2" },
    { id: 10, requirement: "SOP change management, Awareness, Any Changes?? Was SOP followed", clause: "6.3" },
    { id: 11, requirement: "Nominal roll, Signature atlas", clause: "" },
    { id: 12, requirement: "Adequacy of space /equipment for QM activities", clause: "7.1.3" },
    { id: 13, requirement: "SOP Measuring and Monitoring of resources, Awareness, Implementation of SOP", clause: "7.1.5" },
    { id: 14, requirement: "SOP organizational knowledge, Awareness, Any library?", clause: "7.1.6" },
    { id: 15, requirement: "Training plan, Training records, Training SOP and awareness, Use of annexures in SOP, Competency matrix, Staff JD", clause: "7.2" },
    { id: 16, requirement: "Communication matrix, Implementation of matrix", clause: "7.4" },
    { id: 17, requirement: "SOP of SOP's, awareness and implementation in process SOP's", clause: "7.5.1" },
    { id: 18, requirement: "SOP documented information -awareness, Implementation", clause: "7.5.3.1, 4.4.2" },
    { id: 19, requirement: "Operational SOP's, Awareness, Compliant to format/structure, Evidence of use, Appropriateness", clause: "8.1" },
    { id: 20, requirement: "Addressing customer complaint, Feedback system", clause: "8.2" },
    { id: 21, requirement: "SOP Non -conforming output -awareness", clause: "8.7" },
    { id: 22, requirement: "KPI matrix", clause: "9.1" },
    { id: 23, requirement: "Evaluation of measurable output, feedback survey?", clause: "" },
    { id: 24, requirement: "SOP internal audit -awareness, Audit plan, Audit report", clause: "" }, // Likely 9.2
    { id: 25, requirement: "Management review plan, Agenda and Minutes", clause: "9.3.2" },
    { id: 26, requirement: "SOP corrective action, Awareness, Implementation", clause: "10.2" },
    { id: 27, requirement: "PROCESS SOP'S, Adequacy and use", clause: "4.4.2, 8.1" }
];

// --- Global Variables ---
let currentUser = null; // Stores { uid, email, displayName, role }
let audits = [];        // Stores fetched audits locally
let currentAudit = null; // Stores the audit being viewed/edited in the modal/form
let complianceChartInstance = null; // To destroy/update charts
let ncChartInstance = null;
let reportChartInstance = null;
// Store fetched auditors lists globally to avoid refetching constantly
// let leadAuditorUsers = []; // Now hardcoded
let auditorUsers = []; // Only regular auditors fetched now

// --- Utility Helpers ---

function showSpinner(message = "Loading...") {
    if (loadingSpinner) {
        const textElement = loadingSpinner.querySelector('p');
        if(textElement) textElement.textContent = message;
        loadingSpinner.classList.remove('hidden');
    } else {
        console.warn("Loading spinner element not found.");
    }
}

function hideSpinner() {
    if (loadingSpinner) {
        // Add a small delay for smoother visual transition if needed, otherwise hide directly
        // setTimeout(() => loadingSpinner.classList.add('hidden'), 100); // Optional delay
        loadingSpinner.classList.add('hidden');
    }
}

function downloadCSV(csvContent, fileName) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob); link.setAttribute('href', url); link.setAttribute('download', fileName);
        link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
    } else navigator.msSaveBlob?.(blob, fileName); // IE fallback
}

function formatDate(dateInput) {
    if (!dateInput) return 'N/A'; let date;
    if (dateInput && typeof dateInput.toDate === 'function') { // Check if it's a Firestore Timestamp
        date = dateInput.toDate();
    } else {
        // Try parsing YYYY-MM-DD string (common from <input type="date"> or Firestore direct string save)
        const parts = String(dateInput).split('-');
        if (parts.length === 3) {
            // Note: Using UTC avoids timezone issues if dates are meant to be interpreted universally
             date = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
        } else {
            // Fallback: Try parsing with standard Date constructor (less reliable for varying formats)
            date = new Date(dateInput);
        }
    }
    if (isNaN(date.getTime())) return 'Invalid Date';
    // Use UTC options to ensure consistency regardless of browser timezone, if that's the intent
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
    // Or use browser's local timezone:
    // return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}


function formatMonth(monthString) { // Assumes YYYY-MM input
    if (!monthString || monthString.length !== 7) return monthString || 'N/A';
    try { const [y, m] = monthString.split('-'); const d = new Date(Date.UTC(parseInt(y), parseInt(m) - 1, 1)); return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', timeZone: 'UTC' }); }
    catch (e) { return monthString; }
}

function formatDateTime(timestamp) {
    if (!timestamp) return 'N/A'; let date;
    if (timestamp && typeof timestamp.toDate === 'function') { // Firestore Timestamp
        date = timestamp.toDate();
    } else if (timestamp instanceof Date) { // Already a Date object
        date = timestamp;
    } else { // Try parsing as a string/number
        date = new Date(timestamp);
    }
    if (isNaN(date.getTime())) return 'Invalid Date';
    // Use local time formatting
    return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function escapeHtml(unsafe) {
    if (unsafe === null || typeof unsafe === 'undefined') return '';
    return unsafe.toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function formatCsvCell(cell) {
     const str = String(cell ?? ''); // Handle null/undefined
     // Escape double quotes and wrap in double quotes if cell contains comma, newline, or double quote
     return (str.includes(',') || str.includes('"') || str.includes('\n'))
         ? `"${str.replace(/"/g, '""')}"`
         : str;
}


function isSectionVisible(sectionId) {
    const section = document.getElementById(`${sectionId}-section`);
    return section && !section.classList.contains('hidden');
}

function getComplianceStatus(rate) {
    if (rate >= 90) return { statusClass: 'excellent', statusText: 'Excellent' };
    if (rate >= 75) return { statusClass: 'good', statusText: 'Good' };
    if (rate >= 50) return { statusClass: 'fair', statusText: 'Fair' };
    return { statusClass: 'poor', statusText: 'Needs Improvement' };
}
function getComplianceColor(rate) {
    if (rate >= 90) return '#2a9d8f'; // Success
    if (rate >= 75) return '#0077b6'; // Blueish Good
    if (rate >= 50) return '#f4a261'; // Warning/Fair
    return '#e76f51'; // Danger/Poor
}

// --- Initialize the App ---
function init() {
    console.log("Initializing App...");
    setupEventListeners();
    checkAuthState(); // Spinner shown/hidden inside this
}

// --- Setup Event Listeners ---
function setupEventListeners() {
    // Auth events
    loginBtn?.addEventListener('click', loginWithEmail);
    googleLoginBtn?.addEventListener('click', loginWithGoogle);
    logoutBtn?.addEventListener('click', logout);

    // Navigation events
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const permission = item.dataset.permission;
            if (!permission || hasPermission(permission)) {
                 switchSection(item.dataset.section);
            } else {
                console.warn(`User lacks permission '${permission}' to navigate to section '${item.dataset.section}'.`);
                alert("You do not have permission to access this section.");
            }
        });
    });

    // Quick actions
    quickNewAuditBtn?.addEventListener('click', () => {
        if (hasPermission('create_audit')) switchSection('new-audit');
    });
    quickExportBtn?.addEventListener('click', exportDashboardData);

    // New audit form events
    saveDraftBtn?.addEventListener('click', saveAuditAsDraft);
    submitAuditBtn?.addEventListener('click', submitAudit);

    // Audit history events
    document.getElementById('filter-btn')?.addEventListener('click', filterAudits);

    // Reports events
    document.getElementById('generate-report-btn')?.addEventListener('click', generateReport);
    document.getElementById('export-csv-btn')?.addEventListener('click', exportReportToCSV);
    document.getElementById('report-period')?.addEventListener('change', toggleCustomDateRange);

    // Modal events
    closeModalButton?.addEventListener('click', closeModal);
    closeModalBtnFooter?.addEventListener('click', closeModal);
    exportAuditBtn?.addEventListener('click', exportCurrentAudit);
    editAuditBtn?.addEventListener('click', editAudit);
}

// --- Authentication & Role Management ---

function checkAuthState() {
    showSpinner("Authenticating..."); // Show spinner
    auth.onAuthStateChanged(async user => {
        if (user) {
            console.log("User logged in:", user.uid, user.email);
            const userRoleData = await getUserRole(user.uid);

            if (userRoleData && userRoleData.role && Object.values(ROLES).includes(userRoleData.role)) {
                currentUser = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || userRoleData.displayName || user.email.split('@')[0],
                    role: userRoleData.role
                };
                console.log("Current User with Role:", currentUser);

                if(userEmail) userEmail.textContent = currentUser.displayName;
                loginScreen?.classList.add('hidden');
                appContainer?.classList.remove('hidden');

                updateUIForRole();
                await loadAudits(); // Wait for audits to load before hiding spinner fully
                switchSection('dashboard'); // This will call initializeSection -> renderDashboard

            } else {
                 console.error(`Access Denied: User profile missing, or invalid role ('${userRoleData?.role}') assigned for UID: ${user.uid}.`);
                 alert("Your account is not configured correctly or lacks a valid role. Please contact an administrator.");
                 logout(); // Logout will trigger the 'else' below and hide spinner
                 return; // Stop further processing for this invalid state
            }
        } else {
            // User is logged out
            currentUser = null;
            audits = [];
            currentAudit = null;
            loginScreen?.classList.remove('hidden');
            appContainer?.classList.add('hidden');
            console.log("User logged out");
            if(userEmail) userEmail.textContent = '';
            // Clear lists if needed
            if(auditHistoryList) auditHistoryList.innerHTML = '<p>Please log in to view audit history.</p>';
            if(recentAuditsList) recentAuditsList.innerHTML = '<p>Please log in to view recent audits.</p>';
             // Reset charts if they exist
            if (complianceChartInstance) complianceChartInstance.destroy();
            if (ncChartInstance) ncChartInstance.destroy();
            if (reportChartInstance) reportChartInstance.destroy();
        }
        hideSpinner(); // Hide spinner AFTER processing login/logout state
    });
}

async function getUserRole(userId) {
    if (!userId) return null;
    try {
        const userDocRef = db.collection('users').doc(userId);
        const docSnap = await userDocRef.get();
        if (docSnap.exists) {
            return docSnap.data();
        } else {
            console.warn(`No user document found for UID: ${userId}`);
            // Attempt to create a basic user profile if using Google Sign-In and it's the first time
            // Caution: This automatically assigns a default role. Review security implications.
            // Consider requiring admin approval instead.
            /*
            const currentUserAuth = auth.currentUser;
            if (currentUserAuth && currentUserAuth.providerData.some(p => p.providerId === 'google.com')) {
                console.log(`Attempting to create default profile for Google user: ${userId}`);
                const newUserProfile = {
                    email: currentUserAuth.email,
                    displayName: currentUserAuth.displayName || currentUserAuth.email.split('@')[0],
                    role: ROLES.AUDITOR, // Assign a default role (e.g., AUDITOR)
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                await userDocRef.set(newUserProfile);
                console.log(`Default profile created for ${userId}`);
                return newUserProfile;
            }
            */
            return null; // Return null if profile doesn't exist and not auto-creating
        }
    } catch (error) {
        console.error("Error getting user role:", error);
        alert(`Error fetching user profile: ${error.message}`);
        return null;
    }
}


function loginWithEmail() {
    if (!loginEmail || !loginPassword || !loginError) return;
    const email = loginEmail.value;
    const password = loginPassword.value;
    loginError.textContent = '';
    if (!email || !password) { loginError.textContent = 'Please enter email and password.'; return; }
    showSpinner("Logging in...");
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => {
            loginError.textContent = `Login failed: ${error.message}`;
            console.error("Login Error:", error);
            hideSpinner(); // Hide on error
        });
        // Spinner hidden by onAuthStateChanged handler on success
}

function loginWithGoogle() {
     if (!loginError) return;
    const provider = new firebase.auth.GoogleAuthProvider();
    loginError.textContent = '';
    showSpinner("Signing in with Google...");
    auth.signInWithPopup(provider)
        .then(async (result) => {
             const user = result.user;
             // Check if profile exists AFTER sign-in attempt resolves
             // The onAuthStateChanged listener will handle the profile check and role assignment.
             console.log(`Google Sign-In successful for ${user.email}. Auth state change will verify profile.`);
             // Optional: Prefetch role here if needed immediately, but onAuthStateChanged is primary handler
             // const userRoleData = await getUserRole(user.uid);
             // if (!userRoleData) { ... }
        })
        .catch(error => {
            loginError.textContent = `Google Sign-In failed: ${error.message}`;
             console.error("Google Sign-In Error:", error);
             hideSpinner(); // Hide on error
        });
        // Spinner hidden by onAuthStateChanged handler on success or failure->logout path
}

function logout() {
    showSpinner("Logging out...");
    auth.signOut().catch(error => {
        console.error("Logout error:", error);
        alert(`Error logging out: ${error.message}`);
        hideSpinner(); // Hide even on logout error
    });
     // Spinner hidden by onAuthStateChanged handler
}

// --- Permission & UI Control ---

function hasPermission(permission) {
    if (!currentUser || !currentUser.role) return false;
    const allowedRoles = PERMISSIONS[permission];
    if (!allowedRoles) { console.warn(`Permission definition missing: '${permission}'.`); return false; }
    return allowedRoles.includes(currentUser.role);
}

function updateUIForRole() {
    if (!currentUser || !currentUser.role) {
        document.querySelectorAll('[data-permission]').forEach(el => el.classList.add('permission-hidden'));
        return;
    }
    document.querySelectorAll('[data-permission]').forEach(el => {
        const requiredPermission = el.dataset.permission;
        const hasPerm = hasPermission(requiredPermission);
        el.classList.toggle('permission-hidden', !hasPerm);
        // Also disable form elements or buttons if no permission
        if (el.tagName === 'BUTTON' || el.tagName === 'SELECT' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.disabled = !hasPerm;
        }
    });
    // Special handling for the modal edit button visibility based on audit status and creator
    updateModalEditButtonVisibility();
}

function updateModalEditButtonVisibility() {
     if (editAuditBtn) {
         const canUserEdit = canEditAudit(currentAudit);
         editAuditBtn.classList.toggle('permission-hidden', !canUserEdit);
         editAuditBtn.disabled = !canUserEdit; // Also disable
     }
     if (exportAuditBtn){
        const canExport = hasPermission('export_data');
        exportAuditBtn.classList.toggle('permission-hidden', !canExport);
        exportAuditBtn.disabled = !canExport;
     }
}

function canEditAudit(audit) {
    if (!audit || !currentUser) return false;

    // Admins can always edit (subject to status potentially, decided not to limit admin here)
    if (currentUser.role === ROLES.ADMIN) return true;

    // Audits can only be edited if they are in 'draft' status
    if (audit.status !== 'draft') return false;

    // Lead Auditors can edit any draft audit
    if (currentUser.role === ROLES.LEAD_AUDITOR) return true;

    // Regular Auditors can only edit drafts they created
    if (currentUser.role === ROLES.AUDITOR && audit.createdBy === currentUser.uid) return true;

    // Otherwise, cannot edit
    return false;
}

// --- Navigation ---

function switchSection(sectionId) {
    console.log(`Switching to section: ${sectionId}`);
    navItems.forEach(item => item.classList.toggle('active', item.dataset.section === sectionId));

    let sectionFoundAndPermitted = false;
    contentSections.forEach(section => {
        const isTargetSection = section.id === `${sectionId}-section`;
        const permission = section.dataset.permission;
        if (isTargetSection) {
             if (!permission || hasPermission(permission)) {
                section.classList.remove('hidden');
                sectionFoundAndPermitted = true;
                initializeSection(sectionId); // Initialize AFTER making visible
            } else {
                section.classList.add('hidden');
                 console.warn(`Permission denied for section: ${sectionId}`);
                 // Avoid alert loops, maybe just log or show a subtle message if needed
                 // alert("Permission denied to access this section.");
                 // If permission denied for the target, attempt to switch to dashboard safely
                 if (sectionId !== 'dashboard') {
                    console.log("Redirecting to dashboard due to permission denial.");
                    // Safely attempt switch without re-triggering permissions immediately
                    setTimeout(() => switchSection('dashboard'), 0);
                 } else {
                    // If even dashboard is denied (shouldn't happen with default permissions)
                    console.error("Dashboard access denied, check permissions setup.");
                    section.classList.add('hidden'); // Ensure it remains hidden
                 }
            }
        } else {
            section.classList.add('hidden');
        }
    });

    // If after checking all, no permitted section is active (e.g., initial load error, or tried to access restricted URL)
    // and the target wasn't the dashboard itself being denied, default to dashboard.
    if (!sectionFoundAndPermitted && sectionId !== 'dashboard' && !document.querySelector('.content-section:not(.hidden)')) {
        console.warn("No permitted section found or target denied, defaulting to dashboard.");
        setTimeout(() => switchSection('dashboard'), 0);
    } else if (sectionFoundAndPermitted) {
        updateUIForRole(); // Update controls within the now visible section
    }
}

function initializeSection(sectionId) {
    // Called AFTER a section is made visible by switchSection
    switch (sectionId) {
        case 'new-audit':
            initNewAuditForm(); // Now handles fetching regular users and setting up dropdowns
            break;
        case 'dashboard':
            renderDashboard(); // Assumes audits are loaded or loadAudits was called
            break;
        case 'audit-history':
            renderAuditHistory(); // Assumes audits are loaded
            break;
        case 'reports':
            initReportControls(); // Sets up report filters, assumes audits loaded for area filter
            break;
        case 'user-management':
             if (hasPermission('manage_users')) { // Double check permission before loading data
                loadUsersForManagement();
             }
            break;
        default:
            // No specific initialization needed for other sections or unknown sections
            break;
    }
}


// --- Fetch Users by Role ---
async function getUsersByRole(role) {
    const users = [];
    try {
        if (!db) throw new Error("Firestore database is not initialized.");
        const q = db.collection('users').where('role', '==', role).orderBy('email');
        const querySnapshot = await q.get();
        querySnapshot.forEach((doc) => {
            users.push({
                uid: doc.id,
                displayName: doc.data().displayName || doc.data().email || doc.id, // Use name, email or UID as fallback
                email: doc.data().email || ''
            });
        });
        console.log(`Fetched ${users.length} users with role: ${role}`);
    } catch (error) {
        console.error(`Error fetching users with role ${role}:`, error);
        alert(`Failed to load users for role: ${role}. Check permissions or Firestore setup.`);
    }
    return users;
}

// --- Audit Management ---

async function initNewAuditForm() {
    console.log("Initializing new audit form.");
    if (!auditForm || !directorateUnitSelect || !leadAuditorsSelect || !auditorsSelect || !checklistContainer) {
        console.error("Required form elements not found for new audit."); return;
    }

    auditForm.reset();
    // auditDateInput doesn't exist in the provided HTML, remove if not present
    // if(auditDateInput) auditDateInput.value = new Date().toISOString().split('T')[0];
    checklistContainer.innerHTML = '<p>Loading checklist...</p>';
    currentAudit = null; // Reset current audit being edited/created

    // --- Populate Directorate Select ---
    directorateUnitSelect.innerHTML = '<option value="" disabled selected>Select Directorate / Unit...</option>'; // Reset with default
    DIRECTORATES.forEach(dir => {
        const option = document.createElement('option');
        option.value = dir; // Use the name as the value
        option.textContent = dir;
        directorateUnitSelect.appendChild(option);
    });
    directorateUnitSelect.disabled = false; // Ensure it's enabled


    // --- Populate Lead Auditor Select (Hardcoded) ---
    leadAuditorsSelect.innerHTML = ''; // Clear previous options
    if (LEAD_AUDITOR_NAMES.length === 0) {
        leadAuditorsSelect.innerHTML = `<option value="" disabled>No Lead Auditors configured</option>`;
    } else {
        LEAD_AUDITOR_NAMES.forEach(name => {
            const option = document.createElement('option');
            option.value = name; // Use the name as the value
            option.textContent = name;
            leadAuditorsSelect.appendChild(option);
        });
    }
    leadAuditorsSelect.disabled = false; // Enable

    // --- Populate Auditor Select (Fetched) ---
    auditorsSelect.innerHTML = '<option value="" disabled>Loading Auditors...</option>';
    auditorsSelect.disabled = true; // Disable while loading

    try {
        // Fetch ONLY regular auditors now, check cache first
        if (auditorUsers.length === 0) {
             auditorUsers = await getUsersByRole(ROLES.AUDITOR);
        }
        populateAuditorSelect(auditorsSelect, auditorUsers, "Auditors"); // Use the existing function for regular auditors

    } catch (error) {
         console.error("Failed to populate auditor dropdowns:", error);
         auditorsSelect.innerHTML = '<option value="" disabled>Error loading users</option>';
    } finally {
        auditorsSelect.disabled = false; // Re-enable after loading/error
    }

    // --- Populate Checklist Items ---
    checklistContainer.innerHTML = ''; // Clear loading message
    auditChecklist.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'checklist-item';
        itemDiv.dataset.itemId = item.id;
        const correctiveActionName = `corrective-action-${item.id}`;
        const yesRadioId = `ca-yes-${item.id}`;
        const noRadioId = `ca-no-${item.id}`;
        const howManyGroupId = `how-many-needed-group-${item.id}`;
        const howManySelectId = `how-many-needed-${item.id}`;
        const commentsId = `comments-${item.id}`;

        // Generate HTML structure for each checklist item
        itemDiv.innerHTML = `
            <h4>${item.id}. ${escapeHtml(item.requirement)} ${item.clause ? `(Clause ${item.clause})` : ''}</h4>
            <div class="compliance-toggle">
                <button type="button" class="compliance-btn" data-compliance="yes">Compliant</button>
                <button type="button" class="compliance-btn" data-compliance="no">Non-Compliant</button>
            </div>
            <div class="form-group">
                <label for="evidence-${item.id}">Objective Evidence:</label>
                <textarea id="evidence-${item.id}" class="evidence-input" rows="3"></textarea>
            </div>
            <div class="corrective-action-group">
                <div class="form-group corrective-action-toggle">
                    <label>Corrective Action Needed?</label>
                    <input type="radio" id="${yesRadioId}" name="${correctiveActionName}" value="yes"> <label for="${yesRadioId}">Yes</label>
                    <input type="radio" id="${noRadioId}" name="${correctiveActionName}" value="no" checked> <label for="${noRadioId}">No</label>
                </div>
                <div class="form-group hidden-conditional" id="${howManyGroupId}">
                    <label for="${howManySelectId}">How many needed?</label>
                    <select id="${howManySelectId}"> ${generateNumberOptions(1, 100)} </select>
                </div>
                <div class="form-group">
                    <label for="${commentsId}">Comments:</label>
                    <textarea id="${commentsId}" class="comments-input" rows="2"></textarea>
                </div>
            </div>`;
        checklistContainer.appendChild(itemDiv);

        // Add Event Listeners for THIS checklist item's interactive elements
        const complianceBtns = itemDiv.querySelectorAll('.compliance-btn');
        complianceBtns.forEach(btn => btn.addEventListener('click', function() {
            const toggleGroup = this.closest('.compliance-toggle');
            toggleGroup.querySelectorAll('.compliance-btn').forEach(b => b.classList.remove('active', 'compliance-yes', 'compliance-no'));
            this.classList.add('active', this.dataset.compliance === 'yes' ? 'compliance-yes' : 'compliance-no');
        }));
        const correctiveActionRadios = itemDiv.querySelectorAll(`input[name="${correctiveActionName}"]`);
        correctiveActionRadios.forEach(radio => radio.addEventListener('change', (event) => {
            const showHowMany = event.target.value === 'yes';
            itemDiv.querySelector(`#${howManyGroupId}`)?.classList.toggle('hidden-conditional', !showHowMany);
        }));
    });

    updateUIForRole(); // Ensure buttons (Save Draft/Submit) have correct state/visibility
}

// Populates select dropdown for fetched users (regular auditors)
function populateAuditorSelect(selectElement, users, typeLabel) {
     if (!selectElement) return;
     selectElement.innerHTML = ''; // Clear existing options
     if (users.length === 0) {
         selectElement.innerHTML = `<option value="" disabled>No ${typeLabel} found</option>`;
         return;
     }
     // Add a default placeholder option (optional, depends on UI preference)
     // selectElement.innerHTML = `<option value="" disabled selected>Select ${typeLabel}...</option>`;
     users.forEach(user => {
         const option = document.createElement('option');
         option.value = user.uid; // Use UID as value
         option.textContent = `${user.displayName} (${user.email})`; // Display name and email
         // Store data attributes for later retrieval if needed
         option.dataset.displayName = user.displayName;
         option.dataset.email = user.email;
         selectElement.appendChild(option);
     });
}

// Generates <option> elements for a number range
function generateNumberOptions(start, end) {
    let options = '';
    for (let i = start; i <= end; i++) {
        options += `<option value="${i}">${i}</option>`;
    }
    return options;
}

function collectAuditFormData() {
    // No auditDateInput in HTML
    // const auditDate = auditDateInput?.value;
    const directorateUnit = directorateUnitSelect?.value; // Get value from select
    const refNo = refNoInput?.value.trim();

    // Add validation for required fields
    // if (!auditDate) { alert('Select Audit Date.'); auditDateInput?.focus(); return null; }
    if (!directorateUnit) { alert('Select Directorate / Unit.'); directorateUnitSelect?.focus(); return null; }
    if (leadAuditorsSelect?.selectedOptions.length === 0) { alert('Select Lead Auditor(s).'); leadAuditorsSelect?.focus(); return null; }
    if (auditorsSelect?.selectedOptions.length === 0) { alert('Select Auditor(s).'); auditorsSelect?.focus(); return null; }

    // --- Get Selected Lead Auditors (Array of Names) ---
    const selectedLeadAuditors = Array.from(leadAuditorsSelect.selectedOptions).map(opt => opt.value);

    // --- Get Selected Auditors (Array of Objects with uid, displayName, email) ---
    const getSelectedAuditorData = (selectElement) => {
        if (!selectElement) return [];
        return Array.from(selectElement.selectedOptions).map(opt => ({
            uid: opt.value,
            displayName: opt.dataset.displayName || opt.textContent.split(' (')[0], // Use data attribute or parse from text
            email: opt.dataset.email || '' // Use data attribute
        }));
    }
    const selectedAuditors = getSelectedAuditorData(auditorsSelect);

    // --- Collect Checklist Data ---
    const checklistData = [];
    const checklistItemElements = checklistContainer?.querySelectorAll('.checklist-item');
    let isComplete = true; // Flag to check if all required fields in checklist are filled

    if (!checklistItemElements || checklistItemElements.length !== auditChecklist.length) {
        console.error("Checklist item mismatch or not found.");
        alert("Error processing checklist. Please refresh and try again.");
        return null; // Critical error
    }

    checklistItemElements.forEach((itemElement, index) => {
        const originalItem = auditChecklist[index];
        const itemId = originalItem.id;
        itemElement.style.border = ''; // Reset error indicator border

        // Get compliance status
        const complianceBtn = itemElement.querySelector('.compliance-btn.active');
        const compliance = complianceBtn ? complianceBtn.dataset.compliance : '';
        if (!compliance) {
            isComplete = false; // Mark form as incomplete if compliance not selected
        }

        // Get other checklist field values
        const evidence = itemElement.querySelector('.evidence-input')?.value.trim() || '';
        const correctiveActionYes = itemElement.querySelector(`input[name="corrective-action-${itemId}"][value="yes"]`)?.checked || false;
        let correctiveActionsCount = null;
        if (correctiveActionYes) {
            const howManySelect = itemElement.querySelector(`#how-many-needed-${itemId}`);
            correctiveActionsCount = howManySelect ? parseInt(howManySelect.value, 10) : null;
            // If CA is needed, the count is required for the form to be considered 'complete' for submission
            if (!correctiveActionsCount || isNaN(correctiveActionsCount)) {
                 isComplete = false;
                 // Highlight the count dropdown if it's missing when needed
                 if (howManySelect) { howManySelect.style.border = '2px solid red'; }
            } else {
                 // Reset border if valid count is selected
                 if (howManySelect) { howManySelect.style.border = ''; }
            }
        }
        const comments = itemElement.querySelector(`#comments-${itemId}`)?.value.trim() || '';

        // Highlight the entire checklist item if essential parts (compliance or count when needed) are missing
        if (!compliance || (correctiveActionYes && !correctiveActionsCount)) {
            itemElement.style.border = '2px solid red'; // Highlight incomplete item visually
        }

        // Push data for this checklist item
        checklistData.push({
            id: itemId, requirement: originalItem.requirement, clause: originalItem.clause,
            compliance, objectiveEvidence: evidence, correctiveActionNeeded: correctiveActionYes,
            correctiveActionsCount, // Will be null if not needed or not selected
            comments
        });
    });

     // --- Assemble Base Audit Data ---
     const baseData = {
        // date: auditDate, // No date input in form
        directorateUnit, // From select dropdown
        refNo,
        leadAuditors: selectedLeadAuditors, // Array of names
        auditors: selectedAuditors,         // Array of {uid, displayName, email} objects
        checklist: checklistData,
        lastModified: firebase.firestore.FieldValue.serverTimestamp() // Set on save/update
    };

     // Add creation details if this is a new audit (not editing)
     if (!currentAudit) { // currentAudit is null when creating new
         if (!currentUser) { console.error("No currentUser defined when creating audit."); alert("Error: User session lost. Cannot create audit."); return null; }
        baseData.createdBy = currentUser.uid;
        baseData.createdByEmail = currentUser.email; // Store creator's email for display
        baseData.createdAt = firebase.firestore.FieldValue.serverTimestamp(); // Set on creation
     }

    // Return the collected data and the completion status flag
    return { data: baseData, isComplete };
}


function saveAuditAsDraft() {
    if (!hasPermission('create_audit')) { alert("Permission Denied."); return; }
    const formDataResult = collectAuditFormData();
    if (!formDataResult?.data) return; // Exit if data collection failed

    const auditData = formDataResult.data;
    auditData.status = 'draft'; // Set status to draft
    saveAuditToFirestore(auditData); // Save to DB
}

function submitAudit() {
    if (!hasPermission('submit_audit')) { alert("Permission Denied."); return; }
    const formDataResult = collectAuditFormData();
    if (!formDataResult?.data) return; // Exit if data collection failed

    // Check the completion flag from collectAuditFormData
    if (!formDataResult.isComplete) {
        alert("Please ensure Compliance Status is selected and Corrective Action Count is specified (if needed) for ALL checklist items before submitting.");
        // Scroll to the first incomplete item for user convenience
        const firstIncomplete = checklistContainer?.querySelector('.checklist-item[style*="border: 2px solid red"]');
        firstIncomplete?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return; // Stop submission if incomplete
    }

    // If complete, proceed with submission
    const auditData = formDataResult.data;
    auditData.status = 'submitted'; // Set status to submitted
    auditData.submittedAt = firebase.firestore.FieldValue.serverTimestamp(); // Record submission time
    saveAuditToFirestore(auditData); // Save to DB
}

function saveAuditToFirestore(auditData) {
    let promise;
    let action = 'created'; // Default action is creation
    showSpinner(currentAudit?.id ? "Updating Audit..." : "Creating Audit...");

    if (currentAudit?.id) { // Editing an existing audit
        action = 'updated';
        // Double-check edit permission here, although UI should prevent access
        if (!canEditAudit(currentAudit)) {
             alert("Permission Denied: Cannot edit this audit.");
             hideSpinner();
             return;
        }
        const auditRef = db.collection('audits').doc(currentAudit.id);
        // Exclude creation fields from the update payload to avoid overwriting them
        const { createdBy, createdAt, createdByEmail, ...updateData } = auditData;
        promise = auditRef.update(updateData);
        console.log(`Updating audit ${currentAudit.id}`);
    } else { // Creating a new audit
         // Double-check creation permission
         if (!hasPermission('create_audit')) {
             alert("Permission Denied: Cannot create audits.");
             hideSpinner();
             return;
         }
         // Ensure creator info was added in collectAuditFormData
         if (!auditData.createdBy) {
             alert("Error: Missing creator information. Cannot save audit.");
             hideSpinner();
             return;
         }
        promise = db.collection('audits').add(auditData);
        console.log(`Creating new audit`);
    }

    // Handle promise resolution (success or failure)
    promise.then(() => {
        alert(`Audit ${action} successfully!`);
        loadAudits().then(() => { // Reload audits AFTER save/update completes
             switchSection('audit-history'); // Navigate to history after successful save/update
             // Spinner hidden inside loadAudits' finally block now
        });
    }).catch(error => {
        alert(`Error saving audit: ${error.message}`);
        console.error("Firestore save error:", error);
        hideSpinner(); // Hide spinner on error
    });
     // Spinner is hidden either by loadAudits on success, or here on error.
}


async function loadAudits() {
    console.log("Loading audits...");
    showSpinner("Loading Audits...");
    if (!currentUser) {
         audits = [];
         if(isSectionVisible('dashboard')) renderDashboard(); // Render empty state
         if(isSectionVisible('audit-history')) renderAuditHistory(); // Render empty state
         hideSpinner(); // Hide spinner if no user
         return; // Important: exit function
    }
    try {
        // Fetch audits ordered by creation date, descending (newest first)
        const querySnapshot = await db.collection('audits').orderBy('createdAt', 'desc').get();
        // Map Firestore documents to audit objects, including the ID
        audits = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`Loaded ${audits.length} audits.`);

        // Re-render sections that depend on the audits list, only if they are currently visible
        if (isSectionVisible('dashboard')) renderDashboard();
        if (isSectionVisible('audit-history')) renderAuditHistory();
        // Update filters in History and Reports sections regardless of visibility
        // as they might be needed when the user navigates there
        updateAreaFilter(); // Updates filters in both history and reports

    } catch (error) {
        console.error('Error loading audits: ', error);
        alert(`Failed to load audits: ${error.message}`);
        audits = []; // Reset audits list on error
        // Update UI to show error messages
        if(recentAuditsList) recentAuditsList.innerHTML = '<p class="error-message">Error loading recent audits.</p>';
        if(auditHistoryList) auditHistoryList.innerHTML = '<p class="error-message">Error loading audit history.</p>';
         // Re-render dashboard/history with empty data on error
         if (isSectionVisible('dashboard')) renderDashboard();
         if (isSectionVisible('audit-history')) renderAuditHistory();

    } finally {
        hideSpinner(); // Ensure spinner is hidden after loading finishes or fails
    }
}


// --- Dashboard Rendering ---

function renderDashboard() {
    if (!isSectionVisible('dashboard') || !hasPermission('view_dashboard')) return;
    console.log("Rendering dashboard with current audits:", audits); // Log audits used

    // Destroy existing charts before rendering new ones to prevent conflicts
    if (complianceChartInstance) complianceChartInstance.destroy();
    if (ncChartInstance) ncChartInstance.destroy();

    renderComplianceChart(); // Render overall compliance doughnut chart
    renderRecentAudits();    // Render list of recent audits
    renderNonConformanceChart(); // Render non-conformance areas bar chart
    updateUIForRole();       // Ensure quick action buttons have correct visibility
}

function renderComplianceChart() {
     if (!complianceChartCanvas) return;
    const ctx = complianceChartCanvas.getContext('2d');
    let totalItems = 0, compliantItems = 0;

    // Calculate compliance rate across all loaded audits
    audits.forEach(audit => {
        if (audit.checklist && Array.isArray(audit.checklist)) { // Ensure checklist exists and is an array
             totalItems += audit.checklist.length;
             compliantItems += audit.checklist.filter(item => item.compliance === 'yes').length;
        }
    });

    // Calculate percentage, handle division by zero
    const complianceRate = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 0;
    const nonComplianceRate = 100 - complianceRate;

    console.log(`Compliance Chart Data: Compliant=${complianceRate}%, Non-Compliant=${nonComplianceRate}% (Total Items: ${totalItems})`);

    // Create the doughnut chart using Chart.js
    complianceChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Compliant', 'Non-Compliant'],
            datasets: [{
                data: [complianceRate, nonComplianceRate],
                backgroundColor: [ getComplianceColor(100), getComplianceColor(0) ], // Use consistent colors
                borderColor: '#ffffff', // White border for separation
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow chart to fill container height
            cutout: '70%', // Adjust doughnut thickness
            plugins: {
                legend: {
                    position: 'bottom', // Position legend below chart
                     labels: { padding: 15 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) { // Custom tooltip label
                            let label = context.label || '';
                            if (label) { label += ': '; }
                            if (context.parsed !== null) { label += context.parsed + '%'; }
                            return label;
                        }
                    }
                },
                 // Optional: Add text in the center (requires chartjs-plugin-datalabels or custom plugin)
                 /*
                 datalabels: { // Requires separate plugin import
                     formatter: (value, ctx) => {
                         if (ctx.chart.data.labels[ctx.dataIndex] === 'Compliant') {
                             return value + '%'; // Show only compliant % in center
                         } else { return ''; }
                     },
                     color: '#005f73', font: { weight: 'bold', size: '20' }
                 }
                 */
            }
        }
    });
}

function renderRecentAudits() {
     if (!recentAuditsList) return;
     recentAuditsList.innerHTML = ''; // Clear previous list

    // Get the 5 most recent audits (audits are already sorted descending by createdAt)
    const recent = audits.slice(0, 5);

    if (recent.length === 0) {
        recentAuditsList.innerHTML = '<p>No recent audits found.</p>';
        return;
    }

     // Create list items for each recent audit
     recent.forEach(audit => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'audit-item';
        itemDiv.dataset.auditId = audit.id; // Store audit ID for potential click actions

        // Display Directorate/Unit and Date/Creator
        const createdBy = audit.createdByEmail ? `by ${escapeHtml(audit.createdByEmail)}` : '';
        const displayDate = audit.date ? formatDate(audit.date) : formatDate(audit.createdAt); // Prefer audit date, fallback to creation date

        itemDiv.innerHTML = `
            <div class="details">
                <strong>${escapeHtml(audit.directorateUnit || 'N/A')}</strong>
                <div class="date">${displayDate} ${createdBy}</div>
            </div>
            <span class="status status-${audit.status || 'unknown'}">${escapeHtml(audit.status || 'Unknown')}</span>`;

        // Add click listener to open audit details modal
        itemDiv.addEventListener('click', () => openAuditDetails(audit));
        recentAuditsList.appendChild(itemDiv);
    });
}

function renderNonConformanceChart() {
    if (!ncChartCanvas) return;
    const ctx = ncChartCanvas.getContext('2d');
    const ncByArea = {}; let hasNcData = false;

    // Aggregate non-conformances by Directorate/Unit
    audits.forEach(audit => {
        if (audit.checklist && Array.isArray(audit.checklist) && audit.directorateUnit) {
             const ncCount = audit.checklist.filter(item => item.compliance === 'no').length;
             if (ncCount > 0) {
                  hasNcData = true;
                  const areaKey = audit.directorateUnit; // Group by directorate
                  ncByArea[areaKey] = (ncByArea[areaKey] || 0) + ncCount;
             }
         }
    });

     // If no non-conformances found, display a message and return
     if (!hasNcData) {
         // Optional: Clear canvas or display message directly on canvas
         if (ncChartInstance) ncChartInstance.destroy(); // Destroy previous chart if exists
         ctx.clearRect(0, 0, ncChartCanvas.width, ncChartCanvas.height); // Clear canvas
         ctx.font = "14px 'Roboto', sans-serif";
         ctx.fillStyle = "#6c757d"; // Muted text color
         ctx.textAlign = "center";
         ctx.fillText("No non-conformances found.", ncChartCanvas.width / 2, ncChartCanvas.height / 2);
         console.log("NC Chart: No non-conformance data to display.");
         return;
     }

     // Sort areas by non-conformance count (descending)
     const sortedAreas = Object.entries(ncByArea).sort(([, countA], [, countB]) => countB - countA);

     // Prepare labels and data for the chart
     const labels = sortedAreas.map(([area]) => area.length > 30 ? area.substring(0, 27) + '...' : area); // Truncate long labels
     const data = sortedAreas.map(([, count]) => count);

     console.log("NC Chart Data:", ncByArea);

     // Create the horizontal bar chart
     ncChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Non-Conformances',
                data: data,
                backgroundColor: getComplianceColor(0), // Use danger color for NCs
                 borderColor: getComplianceColor(0),
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // Make it a horizontal bar chart
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { // Horizontal axis (count)
                    beginAtZero: true,
                    title: { display: true, text: 'Count' }
                },
                y: { // Vertical axis (areas)
                     ticks: { autoSkip: false } // Prevent labels skipping if many areas
                }
            },
            plugins: {
                legend: { display: false }, // Hide legend as label is clear
                tooltip: {
                     callbacks: {
                        label: function(context) {
                            return ` Count: ${context.parsed.x}`; // Show count in tooltip
                        }
                    }
                }
            }
        }
    });
}


// --- Audit History & Filtering ---

function renderAuditHistory(auditsToDisplay = audits) {
     if (!auditHistoryList) return;
     auditHistoryList.innerHTML = ''; // Clear previous list

    // Filter out audits that don't belong (e.g., based on user role if needed - currently shows all)
    // const viewableAudits = filterAuditsForCurrentUser(auditsToDisplay); // Implement this if needed

    const viewableAudits = auditsToDisplay; // Currently showing all fetched audits

    if (viewableAudits.length === 0) {
        auditHistoryList.innerHTML = '<p>No audits found matching criteria.</p>';
        return;
    }

     // Create list items for each viewable audit
     viewableAudits.forEach(audit => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'audit-item';
        itemDiv.dataset.auditId = audit.id;

        // Prepare display strings
        const createdBy = audit.createdByEmail ? `by ${escapeHtml(audit.createdByEmail)}` : '';
        const submitted = audit.submittedAt ? `• Submitted: ${formatDateTime(audit.submittedAt)}` : '';
        const displayDate = audit.date ? formatDate(audit.date) : formatDate(audit.createdAt); // Prefer audit date
        const modified = `• Modified: ${formatDateTime(audit.lastModified)}`;

        itemDiv.innerHTML = `
            <div class="details">
                <strong>${escapeHtml(audit.directorateUnit || 'N/A')}</strong>
                <div class="date">${displayDate} ${createdBy}</div>
                <div class="date">${modified} ${submitted}</div>
            </div>
            <span class="status status-${audit.status || 'unknown'}">${escapeHtml(audit.status || 'Unknown')}</span>`;

        itemDiv.addEventListener('click', () => openAuditDetails(audit)); // Open modal on click
        auditHistoryList.appendChild(itemDiv);
    });

     // Only update the area filter dropdown if we are rendering the full, unfiltered list
     if (auditsToDisplay === audits) {
         updateAreaFilter();
     }
}

function filterAudits() {
    if (!document.getElementById('date-from') || !document.getElementById('date-to') || !areaFilterHistory) {
         console.error("Filter elements not found."); return;
    }
    const fromDate = document.getElementById('date-from').value;
    const toDate = document.getElementById('date-to').value;
    const areaFilter = areaFilterHistory.value; // Value from the dropdown

    console.log(`Filtering history: From=${fromDate || 'Any'}, To=${toDate || 'Any'}, Area=${areaFilter || 'All'}`);

    // Filter the globally stored 'audits' array based on criteria
    const filtered = audits.filter(audit => {
        const auditDate = audit.date || audit.createdAt?.toDate().toISOString().split('T')[0]; // Use audit date or creation date for filtering
        const area = audit.directorateUnit; // Use directorateUnit for filtering

        let match = true;
        // Date filtering: Check if audit date falls within the selected range
        if (fromDate && (!auditDate || auditDate < fromDate)) match = false;
        if (toDate && (!auditDate || auditDate > toDate)) match = false;
        // Area filtering: Check if area matches selection (if a specific area is selected)
        if (areaFilter && area !== areaFilter) match = false;

        return match;
    });

    console.log(`Filtering resulted in ${filtered.length} audits.`);
    renderAuditHistory(filtered); // Re-render the list with the filtered results
}


function updateAreaFilter() {
    // Updates the area filter dropdowns in BOTH Audit History and Reports sections
    const filtersToUpdate = [
        document.getElementById('audit-area-filter'), // History filter
        // Add report area filter ID if it exists and is different
        // document.getElementById('report-area-filter')
    ];

    filtersToUpdate.forEach(filterSelect => {
        if (!filterSelect) return; // Skip if element doesn't exist

        const currentFilterValue = filterSelect.value; // Preserve current selection if possible

        // Get unique directorate names from all loaded audits
        const areas = [...new Set(audits.map(a => a.directorateUnit).filter(Boolean))].sort(); // Use directorateUnit

        // Clear existing options (keeping the "All Areas" default)
        while (filterSelect.options.length > 1) {
            filterSelect.remove(1);
        }

        // Add options for each unique area
        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area;
            option.textContent = escapeHtml(area);
            filterSelect.appendChild(option);
        });

        // Try to restore the previously selected value
        // Check if the previously selected value still exists in the updated options
        if (Array.from(filterSelect.options).some(opt => opt.value === currentFilterValue)) {
            filterSelect.value = currentFilterValue;
        } else {
            filterSelect.value = ""; // Default back to "All Areas" if previous selection is no longer valid
        }
    });
}


// --- Modal Functionality ---

function openAuditDetails(audit) {
    if (!modal || !modalTitle || !modalBody || !audit) {
        console.error("Modal elements or audit data missing."); return;
    }
    console.log("Opening details for audit:", audit.id, audit);
    currentAudit = audit; // Store the audit being viewed globally

    // Set modal title
    modalTitle.textContent = `Audit Details: ${escapeHtml(audit.directorateUnit || 'N/A')}`;

    // --- Prepare Content for Modal Body ---
    const createdBy = audit.createdByEmail ? escapeHtml(audit.createdByEmail) : audit.createdBy || 'Unknown';
    const displayDate = audit.date ? formatDate(audit.date) : 'N/A'; // Use specific audit date if available

    // Format Lead Auditors (Array of names)
    const leadAuditorsText = audit.leadAuditors?.length > 0
        ? audit.leadAuditors.map(name => escapeHtml(name)).join(', ')
        : 'N/A';

    // Format Regular Auditors (Array of objects)
    const formatRegularAuditorList = (arr) => arr?.map(a => escapeHtml(a.displayName || a.email || a.uid)).join(', ') || 'N/A';
    const auditorsText = formatRegularAuditorList(audit.auditors);

    // Build the HTML for the meta-data section
    let bodyContent = `
        <div class="audit-meta">
            <p><strong>Directorate / Unit:</strong> ${escapeHtml(audit.directorateUnit || 'N/A')}</p>
            <p><strong>Ref No.:</strong> ${escapeHtml(audit.refNo || 'N/A')}</p>
            <p><strong>Audit Date:</strong> ${displayDate}</p>
            <p><strong>Lead Auditor(s):</strong> ${leadAuditorsText}</p>
            <p><strong>Auditor(s):</strong> ${auditorsText}</p>
            <p><strong>Status:</strong> <span class="status status-${audit.status || 'unknown'}">${escapeHtml(audit.status || 'Unknown')}</span></p>
            <p><strong>Created By:</strong> ${createdBy}</p>
            <p><strong>Created At:</strong> ${formatDateTime(audit.createdAt)}</p>
            <p><strong>Last Modified:</strong> ${formatDateTime(audit.lastModified)}</p>
            <p><strong>Submitted At:</strong> ${audit.submittedAt ? formatDateTime(audit.submittedAt) : 'N/A'}</p>
        </div>
        <h3>Findings (${audit.checklist?.length || 0})</h3>
        <div class="checklist-summary">`; // Start checklist summary container

    // Append checklist item details
    if (audit.checklist?.length > 0) {
        audit.checklist.forEach(item => {
            const compClass = item.compliance === 'yes' ? 'compliant' : item.compliance === 'no' ? 'non-compliant' : '';
            const compText = item.compliance === 'yes' ? 'Compliant' : item.compliance === 'no' ? 'Non-Compliant' : 'Not Selected';
            const caText = item.correctiveActionNeeded ? 'Yes' : 'No';
            const caCountText = item.correctiveActionNeeded && item.correctiveActionsCount ? ` (${item.correctiveActionsCount} needed)` : '';

            bodyContent += `
                <div class="checklist-item-summary">
                    <h4>${item.id}. ${escapeHtml(item.requirement)} ${item.clause ? `(Cl ${item.clause})` : ''}</h4>
                    <p><strong>Compliance:</strong> <span class="${compClass}">${compText}</span></p>
                    ${item.objectiveEvidence ? `<p><strong>Evidence:</strong><br><pre>${escapeHtml(item.objectiveEvidence)}</pre></p>` : '<p><strong>Evidence:</strong> N/A</p>'}
                    <p><strong>Correction Needed:</strong> ${caText}${caCountText}</p>
                    ${item.comments ? `<p><strong>Comments:</strong><br><pre>${escapeHtml(item.comments)}</pre></p>` : '<p><strong>Comments:</strong> N/A</p>'}
                </div>`;
        });
    } else {
        bodyContent += '<p>No checklist data available for this audit.</p>';
    }
    bodyContent += `</div>`; // End checklist-summary

    // Set the generated HTML to the modal body
    modalBody.innerHTML = bodyContent;

    // Update visibility of Edit/Export buttons based on permissions and audit status
    updateModalEditButtonVisibility();

    // Show the modal
    modal.classList.remove('hidden');
}

function closeModal() {
     if (!modal) return;
    modal.classList.add('hidden'); // Hide the modal
    currentAudit = null; // Clear the currently viewed audit
    console.log("Modal closed.");
}

async function editAudit() {
    if (!currentAudit) { console.error("No audit selected for editing."); return; }
    // Check permission using the dedicated function
    if (!canEditAudit(currentAudit)) {
        alert("Permission Denied. You cannot edit this audit (may be submitted or not created by you).");
        return;
    }

    console.log(`Preparing to edit audit ${currentAudit.id}`);
    showSpinner("Loading Audit for Editing...");

    try {
        // Initialize the 'New Audit' form first. This populates dropdowns etc.
        // Need to await this if it involves async operations like fetching users.
        await initNewAuditForm();

        // Find the full audit data again (currentAudit might be stale if background refresh happened)
        // Or, assume currentAudit is sufficiently up-to-date if loaded recently.
        const auditToEdit = audits.find(a => a.id === currentAudit.id);
        if (!auditToEdit) {
            alert("Error: Audit data not found. Please refresh and try again.");
            switchSection('audit-history'); // Go back to history
            return; // Exit edit process
        }
        currentAudit = { ...auditToEdit }; // Refresh currentAudit with latest data

        console.log(`Populating form with data for audit ${currentAudit.id}`);

        // --- Populate General Fields ---
        if(directorateUnitSelect) directorateUnitSelect.value = currentAudit.directorateUnit || '';
        if(refNoInput) refNoInput.value = currentAudit.refNo || '';
        // No date input in HTML
        // if(auditDateInput) auditDateInput.value = currentAudit.date || '';

        // --- Populate Lead Auditors (Multi-select Names) ---
        if (leadAuditorsSelect && currentAudit.leadAuditors && Array.isArray(currentAudit.leadAuditors)) {
            const selectedNames = currentAudit.leadAuditors;
            Array.from(leadAuditorsSelect.options).forEach(opt => {
                opt.selected = selectedNames.includes(opt.value); // Select based on name match
            });
        }

        // --- Populate Regular Auditors (Multi-select Objects using helper) ---
        setSelectedOptions(auditorsSelect, currentAudit.auditors || []);

        // --- Populate Checklist Fields ---
        const checklistElements = checklistContainer?.querySelectorAll('.checklist-item');
        if (currentAudit.checklist && checklistElements?.length === currentAudit.checklist.length) {
            checklistElements.forEach((itemElement, index) => {
                const itemData = currentAudit.checklist[index]; if (!itemData) return;
                const itemId = itemData.id;

                // Set Compliance Button State
                itemElement.querySelectorAll('.compliance-btn').forEach(btn => {
                    btn.classList.remove('active', 'compliance-yes', 'compliance-no');
                    if (btn.dataset.compliance === itemData.compliance) {
                        btn.classList.add('active', itemData.compliance === 'yes' ? 'compliance-yes' : 'compliance-no');
                    }
                });

                // Set Evidence Textarea
                const evidenceEl = itemElement.querySelector(`#evidence-${itemId}`);
                if (evidenceEl) evidenceEl.value = itemData.objectiveEvidence || '';

                // Set Corrective Action Radio & Count Select
                const yesRadio = itemElement.querySelector(`#ca-yes-${itemId}`);
                const noRadio = itemElement.querySelector(`#ca-no-${itemId}`);
                const howManyGrp = itemElement.querySelector(`#how-many-needed-group-${itemId}`);
                const howManySel = itemElement.querySelector(`#how-many-needed-${itemId}`);

                if (itemData.correctiveActionNeeded) {
                    if(yesRadio) yesRadio.checked = true;
                    if(howManyGrp) howManyGrp.classList.remove('hidden-conditional'); // Show count group
                    if(howManySel && itemData.correctiveActionsCount) { // Set count if available
                         howManySel.value = itemData.correctiveActionsCount;
                    }
                } else {
                    if(noRadio) noRadio.checked = true;
                    if(howManyGrp) howManyGrp.classList.add('hidden-conditional'); // Hide count group
                }

                // Set Comments Textarea
                const commentsEl = itemElement.querySelector(`#comments-${itemId}`);
                if (commentsEl) commentsEl.value = itemData.comments || '';
            });
        } else {
             console.warn("Checklist mismatch or missing when loading audit for editing:", currentAudit.id);
             alert("Warning: Could not fully load checklist details. Please review carefully.");
        }

        // Close the details modal and switch to the new audit form section
        closeModal();
        switchSection('new-audit');

    } catch (error) {
        console.error("Error during edit setup:", error);
        alert(`Failed to load audit for editing: ${error.message}`);
    } finally {
        hideSpinner(); // Ensure spinner hides
    }
}

// Helper to set selected options in a multi-select dropdown based on an array of UIDs
function setSelectedOptions(selectElement, selectedArray) {
    if (!selectElement || !selectedArray || !Array.isArray(selectedArray)) return;

    // Extract UIDs from the selectedArray (assuming it's an array of objects with a 'uid' property)
    const selectedUids = selectedArray.map(item => item.uid);

    // Iterate through the options in the select element
    Array.from(selectElement.options).forEach(opt => {
        // Set the 'selected' property based on whether the option's value (UID) is in the selectedUids array
        opt.selected = selectedUids.includes(opt.value);
    });
}


// --- Exporting ---

function exportCurrentAudit() {
    if (!hasPermission('export_data')) { alert("Permission Denied."); return; }
    if (!currentAudit) { alert('No audit loaded in modal.'); return; }
    showSpinner("Exporting Audit...");

    // Use setTimeout to allow spinner to render before potentially blocking CSV generation
    setTimeout(() => {
        try {
            // --- Prepare Data ---
            // Format Lead Auditors (Array of names)
            const formatLeadAuditorCSV = (arr) => arr?.map(name => escapeHtml(name)).join('; ') || '';
            // Format Regular Auditors (Array of objects)
            const formatRegularAuditorCSV = (arr) => arr?.map(a => `${escapeHtml(a.displayName || a.email)}`).join('; ') || ''; // Keep this format

            const displayDate = currentAudit.date ? formatDate(currentAudit.date) : 'N/A';

            const metaData = [
                ['Directorate / Unit:', currentAudit.directorateUnit || 'N/A'],
                ['Ref No.:', currentAudit.refNo || 'N/A'],
                ['Audit Date:', displayDate],
                ['Lead Auditor(s):', formatLeadAuditorCSV(currentAudit.leadAuditors)],
                ['Auditor(s):', formatRegularAuditorCSV(currentAudit.auditors)],
                ['Status:', currentAudit.status || 'Unknown'],
                ['Created By:', currentAudit.createdByEmail || currentAudit.createdBy || 'Unknown'],
                ['Created At:', formatDateTime(currentAudit.createdAt)],
                ['Last Modified:', formatDateTime(currentAudit.lastModified)],
                ['Submitted At:', currentAudit.submittedAt ? formatDateTime(currentAudit.submittedAt) : 'N/A']
             ];

            const headers = ['ID', 'Requirement', 'Clause', 'Compliance', 'Objective Evidence', 'Correction Needed', 'Correction Count', 'Comments'];
            const rows = (currentAudit.checklist || []).map(item => [
                item.id,
                item.requirement,
                item.clause || '',
                item.compliance === 'yes' ? 'Compliant' : item.compliance === 'no' ? 'Non-Compliant' : 'Not Selected',
                item.objectiveEvidence || '',
                item.correctiveActionNeeded ? 'Yes' : 'No',
                item.correctiveActionNeeded ? (item.correctiveActionsCount ?? '') : '', // Show count only if needed
                item.comments || ''
            ]);

            // --- Generate CSV String ---
            let csv = metaData.map(r => r.map(formatCsvCell).join(',')).join('\n') + '\n\n'; // Meta data first
            csv += headers.map(formatCsvCell).join(',') + '\n'; // Headers
            csv += rows.map(r => r.map(formatCsvCell).join(',')).join('\n'); // Checklist rows

            // --- Trigger Download ---
            const safeName = (currentAudit.directorateUnit || 'Audit').replace(/[^a-z0-9]/gi, '_').toLowerCase();
            // Use a generic date part if audit date isn't set
            const safeDate = displayDate !== 'N/A' ? displayDate.replace(/[^a-z0-9]/gi, '_') : new Date().toISOString().split('T')[0];
            downloadCSV(csv, `audit_${safeName}_${safeDate}.csv`);

        } catch (e) {
            console.error("Export error:", e);
            alert("Error generating audit export file.");
        } finally {
            hideSpinner(); // Hide spinner after completion or error
        }
     }, 50); // 50ms delay to allow UI update
}

function exportReportToCSV() {
    if (!hasPermission('export_data')) { alert("Permission Denied."); return; }
    const table = reportTableContainer?.querySelector('.report-table');
    if (!table) { alert('No report table found to export.'); return; }

    showSpinner("Exporting Report...");
    setTimeout(() => {
        try {
            const title = reportTableContainer?.querySelector('h3')?.textContent || "Report Data";
            let csv = `"${title}"\n\n`; // Add title, escaped
            const rows = table.querySelectorAll('tr');

            rows.forEach(row => {
                // Get both headers (th) and data cells (td)
                const cols = Array.from(row.querySelectorAll('th, td')).map(col => formatCsvCell(col.textContent));
                csv += cols.join(',') + '\n';
            });

            // Generate filename based on report type and period
            const type = document.getElementById('report-type')?.value || 'unknown_type';
            const period = document.getElementById('report-period')?.value || 'unknown_period';
            let datePart = period;
            if (period === 'custom') {
                const from = document.getElementById('report-from')?.value || 'start';
                const to = document.getElementById('report-to')?.value || 'end';
                 datePart = `${from}_to_${to}`;
            } else {
                 datePart = period.replace('last-', ''); // e.g., month, quarter, year
            }
            downloadCSV(csv, `report_${type}_${datePart}.csv`);

        } catch (e) {
            console.error("Export error:", e);
            alert("Error during report export.");
        } finally {
            hideSpinner();
        }
     }, 50);
}


function exportDashboardData() {
     if (!hasPermission('export_data')) { alert("Permission Denied."); return; }
     if (audits.length === 0) { alert('No audit data available to export.'); return; }
     showSpinner("Exporting All Data...");

     setTimeout(() => {
        try {
             const headers = [
                 'Audit ID', 'Audit Date', 'Directorate/Unit', 'Ref No', 'Lead Auditors', 'Auditors', 'Status',
                 'Created By Email', 'Created At', 'Last Modified', 'Submitted At',
                 'Checklist ID', 'Requirement', 'Clause', 'Compliance', 'Objective Evidence',
                 'Correction Needed', 'Correction Count', 'Comments'
             ];
             const rows = [];

             // Re-use formatting functions for consistency
             const formatLeadAuditorCSV = (arr) => arr?.map(name => escapeHtml(name)).join('; ') || '';
             const formatRegularAuditorCSV = (arr) => arr?.map(a => `${escapeHtml(a.displayName || a.email)}`).join('; ') || '';

             audits.forEach(a => {
                 const lead = formatLeadAuditorCSV(a.leadAuditors);
                 const auds = formatRegularAuditorCSV(a.auditors);
                 const created = formatDateTime(a.createdAt);
                 const modified = formatDateTime(a.lastModified);
                 const submitted = a.submittedAt ? formatDateTime(a.submittedAt) : '';
                 const directorate = a.directorateUnit || '';
                 const auditDate = a.date ? formatDate(a.date) : ''; // Use formatted audit date

                 if (a.checklist?.length > 0) {
                     a.checklist.forEach(i => {
                         rows.push([
                             a.id, auditDate, directorate, a.refNo || '', lead, auds, a.status,
                             a.createdByEmail || '', created, modified, submitted,
                             i.id, i.requirement, i.clause || '',
                             i.compliance === 'yes' ? 'Compliant' : i.compliance === 'no' ? 'Non-Compliant' : 'Not Selected',
                             i.objectiveEvidence || '',
                             i.correctiveActionNeeded ? 'Yes' : 'No',
                             i.correctiveActionNeeded ? (i.correctiveActionsCount ?? '') : '',
                             i.comments || ''
                         ]);
                     });
                 } else {
                     // Add a row for the audit even if it has no checklist items
                     rows.push([
                         a.id, auditDate, directorate, a.refNo || '', lead, auds, a.status,
                         a.createdByEmail || '', created, modified, submitted,
                         '', '', '', '', '', '', '', '' // Empty checklist fields
                     ]);
                 }
             });

             let csv = headers.map(formatCsvCell).join(',') + '\n';
             csv += rows.map(r => r.map(formatCsvCell).join(',')).join('\n');
             downloadCSV(csv, `all_audit_data_${new Date().toISOString().split('T')[0]}.csv`);

        } catch (e) {
            console.error("Export error:", e);
            alert("Error during data export.");
        } finally {
            hideSpinner();
        }
     }, 50); // 50ms delay
}


// --- Reporting ---

function initReportControls() {
     const today = new Date();
     const lastMonth = new Date(today);
     lastMonth.setMonth(lastMonth.getMonth() - 1);

     const reportFromInput = document.getElementById('report-from');
     const reportToInput = document.getElementById('report-to');
     const customDateRangeDiv = document.getElementById('custom-date-range');
     const reportPeriodSelect = document.getElementById('report-period');

     // Set default date range (e.g., last month)
     if(reportFromInput) reportFromInput.value = lastMonth.toISOString().split('T')[0];
     if(reportToInput) reportToInput.value = today.toISOString().split('T')[0];

     // Hide custom range initially unless 'custom' is default
     if(reportPeriodSelect && customDateRangeDiv) {
        customDateRangeDiv.classList.toggle('hidden', reportPeriodSelect.value !== 'custom');
     } else if (customDateRangeDiv) {
         customDateRangeDiv.classList.add('hidden'); // Hide if select doesn't exist
     }

     // Reset report results area
     if(reportChartInstance) {
        reportChartInstance.destroy(); // Destroy previous chart
        reportChartInstance = null; // Nullify instance
     }
     if(reportTableContainer) reportTableContainer.innerHTML = '<p>Select report criteria and click "Generate Report".</p>';
     if(reportChartContainer) reportChartContainer.style.display = 'none'; // Hide chart container

     updateAreaFilter(); // Ensure the area filter in reports is up-to-date
     updateUIForRole(); // Ensure generate/export buttons have correct state
}


function toggleCustomDateRange() {
    const reportPeriodSelect = document.getElementById('report-period');
    const customDateRangeDiv = document.getElementById('custom-date-range');
    if (reportPeriodSelect && customDateRangeDiv) {
        customDateRangeDiv.classList.toggle('hidden', reportPeriodSelect.value !== 'custom');
    }
}


function generateReport() {
    if (!hasPermission('generate_reports')) { alert("Permission Denied."); return; }

     const reportTypeSelect = document.getElementById('report-type');
     const periodSelect = document.getElementById('report-period');
     if (!reportTypeSelect || !periodSelect) { console.error("Report control elements missing."); return; }

     const reportType = reportTypeSelect.value;
     const period = periodSelect.value;

     // Destroy previous report chart if it exists
     if (reportChartInstance) {
        reportChartInstance.destroy();
        reportChartInstance = null;
     }
     if(reportTableContainer) reportTableContainer.innerHTML = '<p>Generating report...</p>'; // Show loading message
     if(reportChartContainer) reportChartContainer.style.display = 'none'; // Hide chart area initially

     let fromDate, toDate;
     const today = new Date();
     const todayStr = today.toISOString().split('T')[0];

     // Determine date range based on selected period
     if (period === 'custom') {
         const reportFromInput = document.getElementById('report-from');
         const reportToInput = document.getElementById('report-to');
         fromDate = reportFromInput?.value;
         toDate = reportToInput?.value;
         if (!fromDate || !toDate) {
             alert("Please select a valid custom date range.");
             if(reportTableContainer) reportTableContainer.innerHTML = '<p class="error-message">Custom date range incomplete.</p>';
             return;
         }
         if (fromDate > toDate) {
             alert("'From' date cannot be after 'To' date.");
             if(reportTableContainer) reportTableContainer.innerHTML = '<p class="error-message">Invalid date range.</p>';
             return;
         }
     } else {
         toDate = todayStr; // End date is always today for predefined periods
         const fromDateObj = new Date(today);
         if (period === 'last-month') {
             fromDateObj.setMonth(fromDateObj.getMonth() - 1);
         } else if (period === 'last-quarter') {
             fromDateObj.setMonth(fromDateObj.getMonth() - 3);
         } else if (period === 'last-year') {
             fromDateObj.setFullYear(fromDateObj.getFullYear() - 1);
         }
         fromDate = fromDateObj.toISOString().split('T')[0];
     }

     console.log(`Generating report: Type=${reportType}, Period=${period}, From=${fromDate}, To=${toDate}`);
     showSpinner("Generating Report..."); // Show spinner

     // Use a timeout to allow spinner to render before potentially blocking filtering/report generation
     setTimeout(() => {
         try {
             // Filter audits based on status ('submitted') and date range
             const reportAudits = audits.filter(a => {
                 const auditDate = a.date || a.createdAt?.toDate().toISOString().split('T')[0];
                 return a.status === 'submitted' && auditDate && auditDate >= fromDate && auditDate <= toDate;
             });

             if (reportAudits.length === 0) {
                 if(reportTableContainer) reportTableContainer.innerHTML = '<p>No submitted audits found for the selected period.</p>';
                 if(reportChartContainer) reportChartContainer.style.display = 'none'; // Ensure chart is hidden
                 console.log("Report Generation: No matching audits found.");
                 // hideSpinner(); // No - finally block handles this
                 return; // Stop processing
             }
             console.log(`Using ${reportAudits.length} audits for the report.`);

             // Generate the specific report type
             if(reportChartContainer) reportChartContainer.style.display = 'block'; // Show chart area
             if (reportType === 'compliance') {
                 generateComplianceReport(reportAudits, fromDate, toDate);
             } else if (reportType === 'non-conformance') {
                 generateNonConformanceReport(reportAudits, fromDate, toDate);
             } else if (reportType === 'trend') {
                 generateTrendReport(reportAudits, fromDate, toDate);
             } else {
                 throw new Error(`Unknown report type: ${reportType}`);
             }
         } catch (e) {
             console.error("Report generation error:", e);
             if(reportTableContainer) reportTableContainer.innerHTML = `<p class="error-message">Error generating report: ${e.message}</p>`;
             if(reportChartContainer) reportChartContainer.style.display = 'none';
              // hideSpinner(); // No - finally block handles this
         } finally {
             hideSpinner(); // Hide spinner in finally block
         }
     }, 50); // 50ms delay
}

function generateComplianceReport(reportAudits, from, to) {
    console.log("Generating Compliance Summary Report");
    if (!reportChartCanvas || !reportTableContainer || !reportChartContainer) return;
    const ctx = reportChartCanvas.getContext('2d');

    const compByArea = {}; let totalAuditsWithChecklist = 0;

    // Aggregate compliance data per directorate/unit
    reportAudits.forEach(a => {
        const area = a.directorateUnit;
        // Ensure checklist exists, is an array, has items, and area is defined
        if (a.checklist?.length > 0 && area) {
             totalAuditsWithChecklist++;
             const totalItems = a.checklist.length;
             const compliantItems = a.checklist.filter(i => i.compliance === 'yes').length;
             const rate = Math.round((compliantItems / totalItems) * 100); // Calculate rate for this audit

             // Store sum of rates and count of audits for averaging later
             if (compByArea[area]) {
                 compByArea[area].totalRate += rate;
                 compByArea[area].count++;
             } else {
                 compByArea[area] = { totalRate: rate, count: 1 };
             }
        }
    });

    const areas = Object.keys(compByArea).sort(); // Get sorted list of areas

    // Handle case where no data is available
    if (areas.length === 0) {
        reportTableContainer.innerHTML = '<p>No compliance data available for the selected period.</p>';
        reportChartContainer.style.display = 'none';
        console.log("Compliance Report: No data found.");
        return;
    }

    // Calculate average compliance rate for each area
    const avgRates = areas.map(a => Math.round(compByArea[a].totalRate / compByArea[a].count));

    // --- Generate Chart ---
    if (reportChartInstance) reportChartInstance.destroy(); // Destroy previous chart
    reportChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: areas,
            datasets: [{
                label: 'Average Compliance (%)',
                data: avgRates,
                backgroundColor: avgRates.map(getComplianceColor) // Color bars based on rate
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { // Rate axis
                    beginAtZero: true, max: 100,
                    title: { display: true, text: 'Average Compliance Rate (%)' }
                },
                x: { // Area axis
                     title: { display: true, text: 'Directorate / Unit' }
                }
            },
            plugins: { legend: { display: false } } // Hide legend if label is clear
        }
    });

    // --- Generate Table ---
    let table = `
        <h3>Compliance Summary (${formatDate(from)} to ${formatDate(to)})</h3>
        <p>Based on ${totalAuditsWithChecklist} submitted audits with checklist data.</p>
        <table class="report-table">
            <thead>
                <tr>
                    <th>Directorate / Unit</th>
                    <th>Average Compliance Rate</th>
                    <th>Performance Status</th>
                </tr>
            </thead>
            <tbody>`;

    areas.forEach((area, index) => {
        const rate = avgRates[index];
        const { statusClass, statusText } = getComplianceStatus(rate); // Get status text/class
        table += `
            <tr>
                <td>${escapeHtml(area)}</td>
                <td>${rate}%</td>
                <td class="${statusClass}">${statusText}</td>
            </tr>`;
    });

    table += `</tbody></table>`;
    reportTableContainer.innerHTML = table; // Display the table
}


function generateNonConformanceReport(reportAudits, from, to) {
    console.log("Generating Non-Conformance Analysis Report");
     if (!reportChartCanvas || !reportTableContainer || !reportChartContainer) return;
    const ctx = reportChartCanvas.getContext('2d');

    const ncByRequirement = {}; // Aggregate NCs by requirement ID/text
    let totalNonConformances = 0;
    let totalItemsChecked = 0;

    // Aggregate non-conformances
    reportAudits.forEach(a => {
        if (a.checklist?.length > 0) {
            a.checklist.forEach(item => {
                totalItemsChecked++;
                if (item.compliance === 'no') { // Check for non-compliance
                    totalNonConformances++;
                    // Use a unique key combining ID and requirement text
                    const key = `${item.id}|${item.requirement}`;
                    ncByRequirement[key] = (ncByRequirement[key] || 0) + 1; // Increment count for this requirement
                }
            });
        }
    });

    // Handle case where no non-conformances found
    if (totalNonConformances === 0) {
        reportTableContainer.innerHTML = '<p>No non-conformances found in the selected period.</p>';
        reportChartContainer.style.display = 'none';
        console.log("NC Report: No non-conformances found.");
        return;
    }

    // Sort requirements by NC count (descending)
    const sortedNC = Object.entries(ncByRequirement).sort(([, countA], [, countB]) => countB - countA);

    // --- Generate Chart (Top N Non-Conformances) ---
    const topN = 10; // Show top 10 NCs in the chart
    const topNCData = sortedNC.slice(0, topN);
    const chartLabels = topNCData.map(([key]) => {
        const reqText = key.split('|')[1]; // Get requirement text from key
        return `ID ${key.split('|')[0]}: ${reqText.length > 40 ? reqText.substring(0, 37) + '...' : reqText}`; // Format label with ID and truncated text
    });
    const chartData = topNCData.map(([, count]) => count);

    if (reportChartInstance) reportChartInstance.destroy();
    reportChartInstance = new Chart(ctx, {
        type: 'bar', // Horizontal bar chart often better for long labels
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Non-Conformance Count',
                data: chartData,
                backgroundColor: getComplianceColor(0) // Danger color for NCs
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal bars
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { // Count axis
                    beginAtZero: true,
                    title: { display: true, text: 'Count' }
                },
                y: { // Requirement axis
                     ticks: { autoSkip: false } // Show all labels
                }
            },
            plugins: { legend: { display: false } }
        }
    });

    // --- Generate Table (All Non-Conformances) ---
    let table = `
        <h3>Non-Conformance Analysis (${formatDate(from)} to ${formatDate(to)})</h3>
        <p>Total Non-Conformances: ${totalNonConformances} (from ${totalItemsChecked} items checked)</p>
        <table class="report-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Requirement</th>
                    <th>Clause</th>
                    <th>Count</th>
                    <th>% of Total NC</th>
                </tr>
            </thead>
            <tbody>`;

    sortedNC.forEach(([key, count]) => {
        const [id, req] = key.split('|');
        // Find the original clause from the checklist definition
        const clause = auditChecklist.find(item => item.id.toString() === id)?.clause || 'N/A';
        const percentage = totalNonConformances > 0 ? Math.round((count / totalNonConformances) * 100) : 0;
        table += `
            <tr>
                <td>${id}</td>
                <td>${escapeHtml(req)}</td>
                <td>${clause}</td>
                <td>${count}</td>
                <td>${percentage}%</td>
            </tr>`;
    });

    table += `</tbody></table>`;
    reportTableContainer.innerHTML = table;
}


function generateTrendReport(reportAudits, from, to) {
    console.log("Generating Compliance Trend Report");
     if (!reportChartCanvas || !reportTableContainer || !reportChartContainer) return;
    const ctx = reportChartCanvas.getContext('2d');

    const monthlyData = {}; // Aggregate data by month (YYYY-MM)

    // Aggregate compliance data per month
    reportAudits.forEach(a => {
        // Ensure date and checklist exist
        const auditDateStr = a.date || a.createdAt?.toDate().toISOString().split('T')[0];
        if (auditDateStr && a.checklist?.length > 0) {
            const monthKey = auditDateStr.substring(0, 7); // Get YYYY-MM key

            // Initialize month data if it doesn't exist
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { items: 0, compliant: 0, audits: 0 };
            }
            // Add data from this audit
            monthlyData[monthKey].audits++;
            monthlyData[monthKey].items += a.checklist.length;
            monthlyData[monthKey].compliant += a.checklist.filter(i => i.compliance === 'yes').length;
        }
    });

    const months = Object.keys(monthlyData).sort(); // Get sorted list of months

    // Handle case where no data is available for the trend
    if (months.length === 0) {
        reportTableContainer.innerHTML = '<p>Insufficient data to generate compliance trend for the selected period.</p>';
        reportChartContainer.style.display = 'none';
        console.log("Trend Report: No monthly data found.");
        return;
    }

    // Calculate monthly compliance rates
    const monthlyRates = months.map(m => {
        const data = monthlyData[m];
        return data.items > 0 ? Math.round((data.compliant / data.items) * 100) : 0;
    });

    // --- Generate Chart (Line Chart) ---
    if (reportChartInstance) reportChartInstance.destroy();
    reportChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months.map(formatMonth), // Format YYYY-MM labels to Month Year
            datasets: [{
                label: 'Monthly Average Compliance (%)',
                data: monthlyRates,
                borderColor: '#3498db', // Line color
                backgroundColor: 'rgba(52, 152, 219, 0.1)', // Optional fill color
                tension: 0.1, // Slight curve to the line
                fill: true // Enable fill below line
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: { // Rate axis
                    beginAtZero: true, max: 100,
                    title: { display: true, text: 'Average Compliance Rate (%)' }
                },
                x: { // Month axis
                     title: { display: true, text: 'Month' }
                }
            },
            plugins: { legend: { position: 'top' } }
        }
    });

    // --- Generate Table ---
    let table = `
        <h3>Compliance Trend Analysis (${formatDate(from)} to ${formatDate(to)})</h3>
        <table class="report-table">
            <thead>
                <tr>
                    <th>Month</th>
                    <th>Audits Conducted</th>
                    <th>Total Items Checked</th>
                    <th>Compliant Items</th>
                    <th>Average Compliance Rate</th>
                </tr>
            </thead>
            <tbody>`;

    months.forEach((monthKey, index) => {
        const data = monthlyData[monthKey];
        const rate = monthlyRates[index];
        table += `
            <tr>
                <td>${formatMonth(monthKey)}</td>
                <td>${data.audits}</td>
                <td>${data.items}</td>
                <td>${data.compliant}</td>
                <td>${rate}%</td>
            </tr>`;
    });

    table += `</tbody></table>`;
    reportTableContainer.innerHTML = table;
}


// --- User Management ---

async function loadUsersForManagement() {
    if (!hasPermission('manage_users') || !userListContainer) return;
    userListContainer.innerHTML = '<p>Loading users...</p>'; // Loading message
    showSpinner("Loading Users..."); // Show spinner

    try {
        // Fetch all users ordered by email
        const querySnapshot = await db.collection('users').orderBy('email').get();
        const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Render the list
        renderUserList(userList);

    } catch (e) {
        console.error("Error loading users for management:", e);
        userListContainer.innerHTML = '<p class="error-message">Failed to load users. Please try again.</p>'; // Error message
    } finally {
        hideSpinner(); // Hide spinner regardless of success or failure
    }
}

function renderUserList(users) {
     if (!userListContainer) return;
     userListContainer.innerHTML = ''; // Clear previous content or loading message

     if (users.length === 0) {
         userListContainer.innerHTML = '<p>No users found in the system.</p>';
         return;
     }

     // Create an item for each user
     users.forEach(user => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'user-list-item';
        itemDiv.dataset.userId = user.id;

        // User Info Section
        const infoDiv = document.createElement('div');
        infoDiv.className = 'user-info-details';
        const userRole = user.role || 'Not Set';
        const displayName = user.displayName || user.email || 'No Name'; // Display name or email
        infoDiv.innerHTML = `
            <p class="user-email">${escapeHtml(user.email || 'No Email')}</p>
            <p>Name: ${escapeHtml(displayName)}</p>
            <p class="user-role">Role: <strong>${escapeHtml(userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()))}</strong></p>
            <p class="user-uid">UID: ${user.id}</p>`;

        // Role Selector Section
        const selectorDiv = document.createElement('div');
        selectorDiv.className = 'user-role-selector';

        // Prevent changing own role or if permission denied (extra check)
        if (currentUser?.uid === user.id || !hasPermission('manage_users')) {
            selectorDiv.innerHTML = `<p><em>${currentUser?.uid === user.id ? '(Your Account)' : '(View Only)'}</em></p>`;
        } else {
            // Create role dropdown
            const select = document.createElement('select');
            select.className = 'role-select';
            select.dataset.userId = user.id;
            select.dataset.originalRole = user.role || ''; // Store original role

            // Add "Select Role" default option (optional)
            // const defaultOpt = document.createElement('option');
            // defaultOpt.value = ""; defaultOpt.textContent = "Change Role..."; defaultOpt.disabled = true;
            // if (!user.role) defaultOpt.selected = true;
            // select.appendChild(defaultOpt);

            // Add options for each defined role
            Object.values(ROLES).forEach(roleValue => {
                const option = document.createElement('option');
                option.value = roleValue;
                // Format role name for display (e.g., 'lead_auditor' -> 'Lead Auditor')
                let roleText = roleValue.replace('_', ' ');
                roleText = roleText.charAt(0).toUpperCase() + roleText.slice(1);
                option.textContent = roleText;
                option.selected = user.role === roleValue; // Select current role
                select.appendChild(option);
            });

            // Add event listener to handle role change
            select.addEventListener('change', handleRoleChange);
            selectorDiv.appendChild(select);
        }

        itemDiv.appendChild(infoDiv);
        itemDiv.appendChild(selectorDiv);
        userListContainer.appendChild(itemDiv);
    });
}

async function handleRoleChange(event) {
    const selectElement = event.target;
    const userId = selectElement.dataset.userId;
    const newRole = selectElement.value;
    const originalRole = selectElement.dataset.originalRole;

    // Basic validation
    if (!userId || !newRole || newRole === originalRole) { // No change or invalid data
        selectElement.value = originalRole; // Revert selection if no change
        return;
    }

    // Permission check (should be redundant due to UI controls, but good practice)
    if (!hasPermission('manage_users')) {
        alert("Permission Denied to change user roles.");
        selectElement.value = originalRole; // Revert selection
        return;
    }

    // Confirmation dialog
    const userItem = selectElement.closest('.user-list-item');
    const userEmailText = userItem?.querySelector('.user-email')?.textContent || `UID ${userId}`;
    const formattedOldRole = (originalRole || 'Not Set').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    const formattedNewRole = newRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

    if (!confirm(`Are you sure you want to change the role for ${userEmailText}\nFrom: ${formattedOldRole}\nTo: ${formattedNewRole}?`)) {
        selectElement.value = originalRole; // Revert selection if cancelled
        return;
    }

    // Proceed with update
    console.log(`Updating role for user ${userId} from ${originalRole} to ${newRole}`);
    selectElement.disabled = true; // Disable dropdown during update
    showSpinner("Updating User Role..."); // Show spinner

    try {
        // Update user role in Firestore
        await db.collection('users').doc(userId).update({ role: newRole });

        alert(`Role for ${userEmailText} updated successfully to ${formattedNewRole}.`);

        // Update UI state: store new role as original for next change, update display text
        selectElement.dataset.originalRole = newRole;
        const roleTextElement = userItem?.querySelector('.user-role strong');
        if (roleTextElement) {
            roleTextElement.textContent = formattedNewRole;
        }

    } catch (e) {
        console.error(`Error updating role for user ${userId}:`, e);
        alert(`Failed to update role: ${e.message}`);
        selectElement.value = originalRole; // Revert selection on error
    } finally {
        selectElement.disabled = false; // Re-enable dropdown
        hideSpinner(); // Hide spinner
    }
}


// --- Run Initialization on Load ---
document.addEventListener('DOMContentLoaded', init);
```