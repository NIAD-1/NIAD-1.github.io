// app.js

// --- Firebase Configuration ---

const firebaseConfig = {
    apiKey: "AIzaSyCLp8nKO2rb7yMyaL0mM6sJOzoFRmm0BdI",
    authDomain: "internalaudit-2cd8c.firebaseapp.com",
    projectId: "internalaudit-2cd8c",
    storageBucket: "internalaudit-2cd8c.firebasestorage.app",
    messagingSenderId: "510488169711",
    appId: "1:510488169711:web:271ed61bd7c4e6c14c5f1a",
    measurementId: "G-43ESSX8GLJ"
  };

  // --- Initialize Firebase ---//

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();


// --- Roles Definition ---
const ROLES = {
    ADMIN: 'admin',
    LEAD_AUDITOR: 'lead_auditor',
    AUDITOR: 'auditor'
};

// --- Permission Mapping ---
// Maps conceptual permissions to the roles that have them
const PERMISSIONS = {
    manage_users: [ROLES.ADMIN],
    create_audit: [ROLES.ADMIN, ROLES.LEAD_AUDITOR, ROLES.AUDITOR],
    edit_audit: [ROLES.ADMIN, ROLES.LEAD_AUDITOR, ROLES.AUDITOR], // Fine-grained check in canEditAudit
    submit_audit: [ROLES.ADMIN, ROLES.LEAD_AUDITOR, ROLES.AUDITOR],
    view_all_audits: [ROLES.ADMIN, ROLES.LEAD_AUDITOR, ROLES.AUDITOR],
    view_dashboard: [ROLES.ADMIN, ROLES.LEAD_AUDITOR, ROLES.AUDITOR],
    view_reports: [ROLES.ADMIN, ROLES.LEAD_AUDITOR, ROLES.AUDITOR],
    generate_reports: [ROLES.ADMIN, ROLES.LEAD_AUDITOR, ROLES.AUDITOR],
    export_data: [ROLES.ADMIN, ROLES.LEAD_AUDITOR, ROLES.AUDITOR],
    add_comments: [ROLES.ADMIN, ROLES.LEAD_AUDITOR],
    approve_audits: [ROLES.ADMIN, ROLES.LEAD_AUDITOR],
    view_comments: [ROLES.ADMIN, ROLES.LEAD_AUDITOR],
    submit_review: [ROLES.LEAD_AUDITOR],
    final_approval: [ROLES.ADMIN],
    change_password: [ROLES.ADMIN, ROLES.LEAD_AUDITOR, ROLES.AUDITOR],
    view_lead_comments: [ROLES.ADMIN, ROLES.LEAD_AUDITOR]
};

// --- DOM Elements ---
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
const areaFilterHistory = document.getElementById('audit-area-filter'); // Assumes this ID is used for history/reports area filter
// Dashboard elements
const recentAuditsList = document.getElementById('recent-audits-list');
const complianceChartCanvas = document.getElementById('compliance-chart');
const ncChartCanvas = document.getElementById('nc-chart');
// New Audit form elements
const auditForm = document.getElementById('audit-form');
const auditDateInput = document.getElementById('audit-date');
const directorateUnitInput = document.getElementById('directorate-unit'); // Updated ID
const leadAuditorsSelect = document.getElementById('lead-auditors-select'); // New ID
const auditorsSelect = document.getElementById('auditors-select');       // New ID
const refNoInput = document.getElementById('ref-no');                   // New ID
const checklistContainer = document.getElementById('checklist-container');
const saveDraftBtn = document.getElementById('save-draft-btn');
const submitAuditBtn = document.getElementById('submit-audit-btn');
const locationInput = document.getElementById('location');
// AUDIT STATUS //


// --- Audit Checklist Data ---
const auditChecklist = [
    { id: 1, requirement: "Identification of interested parties and needs", clause: "4.1" },
    { id: 2, requirement: "Quality manual - awareness", clause: "4.1" },
    { id: 3, requirement: "Process flow (interaction)", clause: "4.4" },
    { id: 4, requirement: "Organogram", clause: "4.4.1" },
    { id: 5, requirement: "Master list, SOP index, Records list", clause: "4.4.1" },
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
    { id: 24, requirement: "SOP internal audit -awareness, Audit plan, Audit report", clause: "" },
    { id: 25, requirement: "Management review plan, Agenda and Minutes", clause: "9.3.2" },
    { id: 26, requirement: "SOP corrective action, Awareness, Implementation", clause: "10.2" },
    { id: 27, requirement: "PROCESS SOP'S, Adequacy and use", clause: "4.4.2, 8.1" },
    {id: 28, requirement: "Other Observations", clause:"General"}
];

// --- Global Variables ---
let currentUser = null; 
let audits = [];        
let currentAudit = null;
let complianceChartInstance = null; 
let ncChartInstance = null;
let reportChartInstance = null;

let leadAuditorUsers = [];
let auditorUsers = [];


auth.onAuthStateChanged(async user => {
    console.log("Auth state changed - User:", user);
    
    if (user) {
      const userRoleData = await getUserRole(user.uid);
      console.log("User role data:", userRoleData);
      
      if (userRoleData?.role) {
        console.log("Effective permissions:", 
          Object.entries(PERMISSIONS).filter(([_, roles]) => 
            roles.includes(userRoleData.role)
          ).map(([perm]) => perm)
        );
      }
    }
  });
// --- Initialize the App ---
function init() {
    console.log("Initializing App...");
    setupEventListeners();
    checkAuthState();
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

    document.getElementById('submit-audit-btn')?.addEventListener('click', submitAudit);

    // Audit history events
    document.getElementById('filter-btn')?.addEventListener('click', filterAudits);

    // Reports events
    document.getElementById('generate-report-btn')?.addEventListener('click', generateReport);
    document.getElementById('export-csv-btn')?.addEventListener('click', exportReportToCSV);
    document.getElementById('report-period')?.addEventListener('change', toggleCustomDateRange);
    document.getElementById('change-password-link')?.addEventListener('click', showPasswordChangeModal);
    document.getElementById('login-page-password-form')?.addEventListener('submit', handleLoginPagePasswordChange);
    document.getElementById('forgot-password-link')?.addEventListener('click', handleForgotPassword);

    // Modal events
    closeModalButton?.addEventListener('click', closeModal);
    closeModalBtnFooter?.addEventListener('click', closeModal);
    exportAuditBtn?.addEventListener('click', exportCurrentAudit);
    editAuditBtn?.addEventListener('click', editAudit);
}

// --- Authentication & Role Management ---

function checkAuthState() {
    auth.onAuthStateChanged(async user => {
        if (user) {
            console.log("User logged in:", user.uid, user.email);
            const userRoleData = await getUserRole(user.uid);
            if (currentUser && currentUser.uid !== user.uid) {
                clearAuditForm();
            }

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
                loadAudits();
                switchSection('dashboard');

            } else {
                 console.error(`Access Denied: User profile missing, or invalid role ('${userRoleData?.role}') assigned for UID: ${user.uid}.`);
                 alert("Your account is not configured correctly or lacks a valid role. Please contact an administrator.");
                 clearAuditForm();
                 logout();
            }
        } else {
            currentUser = null;
            audits = [];
            currentAudit = null;
            loginScreen?.classList.remove('hidden');
            appContainer?.classList.add('hidden');
            console.log("User logged out");
            if(userEmail) userEmail.textContent = '';
            if(auditHistoryList) auditHistoryList.innerHTML = '';
            if(recentAuditsList) recentAuditsList.innerHTML = '';
        }
    });
}

async function getUserRole(userId) {
    if (!userId) return null;
    try {
        const userDocRef = db.collection('users').doc(userId);
        const docSnap = await userDocRef.get();
        if (docSnap.exists) {
            // console.log(`User role data fetched for ${userId}:`, docSnap.data());
            return docSnap.data();
        } else {
            console.warn(`No user document found for UID: ${userId}`);
            return null;
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
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => {
            loginError.textContent = `Login failed: ${error.message}`;
            console.error("Login Error:", error);
        });
}

function loginWithGoogle() {
     if (!loginError) return;
    const provider = new firebase.auth.GoogleAuthProvider();
    loginError.textContent = '';
    auth.signInWithPopup(provider)
        .then(async (result) => {
             const user = result.user;
             const userRoleData = await getUserRole(user.uid);
             if (!userRoleData) {
                  console.warn(`Google Sign-In successful for ${user.email}, but no profile found. Logging out.`);
                  alert(`Login successful, but your account (${user.email}) needs setup by an administrator.`);
                  logout();
             }
        })
        .catch(error => {
            loginError.textContent = `Google Sign-In failed: ${error.message}`;
             console.error("Google Sign-In Error:", error);
        });
}

function logout() {
    auth.signOut().catch(error => {
        console.error("Logout error:", error);
        alert(`Error logging out: ${error.message}`);
    });
}

// --- Permission & UI Control ---

function hasPermission(permission) {
    if (!currentUser || !currentUser.role) return false;
    const allowedRoles = PERMISSIONS[permission] || [];
    if (!allowedRoles) { console.warn(`Permission definition missing: '${permission}'.`); return false; }
    return allowedRoles.includes(currentUser?.role);
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
        if (el.tagName === 'BUTTON' || el.tagName === 'SELECT' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.disabled = !hasPerm; // Disable elements if no permission too
        }
    });
    updateModalEditButtonVisibility();
}

function editAudit() {
    if (!currentAudit || !canEditAudit(currentAudit)) {
        alert("You don't have permission to edit this audit.");
        return;
    }
    
    // Switch to the new-audit section
    switchSection('new-audit');
    
    // Populate the form with the current audit data
    if (auditDateInput) auditDateInput.value = currentAudit.date || '';
    if (directorateUnitInput) directorateUnitInput.value = currentAudit.directorateUnit || '';
    if (refNoInput) refNoInput.value = currentAudit.refNo || '';
    if (locationInput) locationInput.value = currentAudit.location || '';
    
    // Populate lead auditors and auditors (you'll need to implement this)
    populateAuditorSelections(currentAudit.leadAuditors, currentAudit.auditors);
    
    // Populate checklist items
    if (currentAudit.checklist && checklistContainer) {
        currentAudit.checklist.forEach(item => {
            const itemElement = checklistContainer.querySelector(`[data-item-id="${item.id}"]`);
            if (itemElement) {
                // Set applicability
                const applicableRadio = itemElement.querySelector(`input[name="applicable-${item.id}"][value="${item.applicable}"]`);
                if (applicableRadio) applicableRadio.checked = true;
                
                // Show/hide content based on applicability
                const content = itemElement.querySelector('.checklist-content');
                if (content) {
                    content.style.display = item.applicable === 'yes' ? 'block' : 'none';
                    
                    // Populate fields for applicable items
                    if (item.applicable === 'yes') {
                        if (item.id === 28) {
                            const observations = content.querySelector(`#observations-${item.id}`);
                            if (observations) observations.value = item.observations || '';
                        } else {
                            const evidence = content.querySelector(`#evidence-${item.id}`);
                            if (evidence) evidence.value = item.objectiveEvidence || '';
                            
                            const comments = content.querySelector(`#comments-${item.id}`);
                            if (comments) comments.value = item.comments || '';
                            
                            // Set compliance
                            if (item.compliance) {
                                const complianceBtn = content.querySelector(`.compliance-btn[data-compliance="${item.compliance}"]`);
                                if (complianceBtn) {
                                    complianceBtn.classList.add('active', `compliance-${item.compliance}`);
                                }
                            }
                            
                            // Set corrective action
                            const correctiveActionRadio = content.querySelector(`input[name="corrective-action-${item.id}"][value="${item.correctiveActionNeeded ? 'yes' : 'no'}"]`);
                            if (correctiveActionRadio) correctiveActionRadio.checked = true;
                            
                            // Set classification
                            const classificationSelect = content.querySelector(`#classification-${item.id}`);
                            if (classificationSelect) classificationSelect.value = item.classification || '';
                        }
                    }
                }
            }
        });
    }
}

function populateAuditorSelections(leadAuditors, auditors) {
    // Implement this based on how your multi-select works
    // This is just a placeholder implementation
    if (leadAuditorsSelect && leadAuditors) {
        leadAuditors.forEach(auditor => {
            const option = leadAuditorsSelect.querySelector(`option[value="${auditor.uid}"]`);
            if (option) option.selected = true;
        });
    }
    
    if (auditorsSelect && auditors) {
        auditors.forEach(auditor => {
            const option = auditorsSelect.querySelector(`option[value="${auditor.uid}"]`);
            if (option) option.selected = true;
        });
    }
    
    // Update the display of selected names if using custom multi-select
    updateSelectedAuditorsDisplay();
}

function updateModalEditButtonVisibility() {
     if (editAuditBtn) {
         const canUserEdit = canEditAudit(currentAudit);
         editAuditBtn.classList.toggle('permission-hidden', !canUserEdit);
         editAuditBtn.disabled = !canUserEdit;
     }
     if (exportAuditBtn){
        const canExport = hasPermission('export_data');
        exportAuditBtn.classList.toggle('permission-hidden', !canExport);
        exportAuditBtn.disabled = !canExport;
     }
}

function canEditAudit(audit) {
    if (!audit || !currentUser) return false;
    if (currentUser.role === ROLES.ADMIN) return true;
    if (currentUser.role === ROLES.LEAD_AUDITOR && audit.status === 'draft') return true;
    if (currentUser.role === ROLES.AUDITOR && audit.createdBy === currentUser.uid && audit.status === 'draft') return true;
    if(locationInput) locationInput.value = currentAudit.location || '';
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
                initializeSection(sectionId);
            } else {
                section.classList.add('hidden');
                 console.warn(`Permission denied for section: ${sectionId}`);
                 alert("Permission denied to access this section.");
                 if (sectionId !== 'dashboard') switchSection('dashboard');
            }
        } else {
            section.classList.add('hidden');
        }
    });

    if (sectionFoundAndPermitted) {
        updateUIForRole();
    } else if (!document.querySelector(`.content-section:not(.hidden)`)) {
        console.warn("No permitted section found, defaulting to dashboard.");
        switchSection('dashboard');
    }
}

function initializeSection(sectionId) {
    switch (sectionId) {
        case 'new-audit':
            initNewAuditForm(); // Now handles fetching users
            break;
        case 'dashboard':
            renderDashboard();
            break;
        case 'audit-history':
            renderAuditHistory();
            break;
        case 'reports':
            initReportControls();
            break;
        case 'user-management':
            loadUsersForManagement();
            break;
        default:
            break;
    }
}

// --- Fetch Users by Role ---
async function getUsersByRole(role) {
    const users = [];
    try {
        // Ensure db is initialized before calling collection()
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

function initNewAuditForm() {
    if (!checklistContainer) {
        console.error("Checklist container not found");
        return;
    }
    
    checklistContainer.innerHTML = '';
    
    auditChecklist.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'checklist-item';
        itemDiv.dataset.itemId = item.id;


        itemDiv.innerHTML = `
            <div class="applicability-toggle">
                <div class="question-header">
                    <span class="question-number">${item.id}.</span>
                    <span class="question-text">${item.requirement}</span>
                    ${item.clause ? `<span class="question-clause">(Clause ${item.clause})</span>` : ''}
                </div>
                <div class="toggle-options">
                    <input type="radio" id="applicable-${item.id}" name="applicable-${item.id}" value="yes">
                    <label for="applicable-${item.id}">Applicable/Reviewed</label>
                    <input type="radio" id="not-applicable-${item.id}" name="applicable-${item.id}" value="no" checked>
                    <label for="not-applicable-${item.id}">Not Applicable/Not Reviewed</label>
                </div>
            </div>
            <div class="checklist-content" style="display:none">
                ${item.id === 28 ? `
                    <div class="form-group">
                        <label for="observations-${item.id}">Other Observations:</label>
                        <textarea id="observations-${item.id}" 
                                rows="5" 
                                class="observation-field" 
                                placeholder="Enter any additional observations not covered above..."></textarea>
                    </div>
                ` : `
                    <div class="form-group">
                        <label for="evidence-${item.id}">Objective Evidence:</label>
                        <textarea id="evidence-${item.id}" rows="3" class="evidence-input"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="comments-${item.id}">Comments:</label>
                        <textarea id="comments-${item.id}" rows="2"></textarea>
                    </div>
                    <div class="compliance-toggle">
                        <label>Compliance:</label>
                        <button type="button" class="compliance-btn" data-compliance="yes">Compliant</button>
                        <button type="button" class="compliance-btn" data-compliance="no">Non-Compliant</button>
                    </div>
                    <div class="corrective-action-group">
                        <label>Corrective Action Needed?</label>
                        <input type="radio" id="ca-yes-${item.id}" name="corrective-action-${item.id}" value="yes">
                        <label for="ca-yes-${item.id}">Yes</label>
                        <input type="radio" id="ca-no-${item.id}" name="corrective-action-${item.id}" value="no" checked>
                        <label for="ca-no-${item.id}">No</label>
                    </div>
                    <div class="classification-group">
                        <label for="classification-${item.id}">Classification:</label>
                        <select id="classification-${item.id}">
                            <option value="">Select Classification</option>
                            <option value="Major">Major</option>
                            <option value="Minor">Minor</option>
                            <option value="OFI">OFI (Opportunity for Improvement)</option>
                        </select>
                    </div>
                `}
            </div>`;

        // Event listener for applicability toggle
        itemDiv.querySelectorAll(`input[name="applicable-${item.id}"]`).forEach(radio => {
            radio.addEventListener('change', (e) => {
                const content = itemDiv.querySelector('.checklist-content');
                if (content) {
                    content.style.display = e.target.value === 'yes' ? 'block' : 'none';
                    
                    // Reset fields when marked not applicable
                    if (e.target.value === 'no') {
                        content.querySelectorAll('textarea').forEach(t => t.value = '');
                        content.querySelectorAll('.compliance-btn').forEach(b => {
                            b.classList.remove('active', 'compliance-yes', 'compliance-no');
                        });
                        content.querySelector(`input[name="corrective-action-${item.id}"][value="no"]`).checked = true;
                    }
                }
            });
        });

        // Initialize compliance buttons
        const complianceButtons = itemDiv.querySelectorAll('.compliance-btn');
        complianceButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Fixed: Removed incorrect 'itemDiv.inner' reference
                complianceButtons.forEach(b => {
                    b.classList.remove('active', 'compliance-yes', 'compliance-no');
                });
                this.classList.add('active');
                this.classList.add(`compliance-${this.dataset.compliance}`);
            });
        });

        checklistContainer.appendChild(itemDiv);
    });
}

// Helper function to generate number options

function populateAuditorSelect(selectElement, users, typeLabel) {
     if (!selectElement) return;
     selectElement.innerHTML = '';
     if (users.length === 0) {
         selectElement.innerHTML = `<option value="" disabled>No ${typeLabel} found</option>`;
         return;
     }
     users.forEach(user => {
         const option = document.createElement('option');
         option.value = user.uid;
         option.textContent = `${user.displayName} (${user.email})`;
         option.dataset.displayName = user.displayName;
         option.dataset.email = user.email;
         selectElement.appendChild(option);
     });
}

function generateNumberOptions(start, end) {
    let options = '';
    for (let i = start; i <= end; i++) options += `<option value="${i}">${i}</option>`;
    return options;
}

function collectAuditFormData() {
    const auditDate = auditDateInput?.value;
    const directorateUnit = directorateUnitInput?.value.trim();
    const refNo = refNoInput?.value.trim();
    const location = locationInput?.value;

    // Basic required field validation
    if (!auditDate) { alert('Select Audit Date.'); auditDateInput?.focus(); return null; }
    if (!directorateUnit) { alert('Enter Directorate / Unit.'); directorateUnitInput?.focus(); return null; }
    if (!refNo) { alert('Enter Reference Number.'); refNoInput?.focus(); return null; }
    if (!location) {alert('Select Location.'); locationInput?.focus(); return null; }

    // Check if at least one lead auditor is selected
    const leadAuditorsSelected = Array.from(document.querySelectorAll('#lead-auditors-options input[type="checkbox"]:checked')).length > 0;
    if (!leadAuditorsSelected) { 
        alert('Select at least one Lead Auditor.'); 
        document.querySelector('#lead-auditors').scrollIntoView({ behavior: 'smooth' });
        return null; 
    }

    // Improved auditor selection validation
    const auditorsSelected = Array.from(document.querySelectorAll('#auditors-options input[type="checkbox"]:checked')).length > 0;
    if (!auditorsSelected) { 
        alert('Select at least one Auditor.'); 
        document.querySelector('#auditors').scrollIntoView({ behavior: 'smooth' });
        return null; 
    }

    // Get selected auditors data
    const getSelectedAuditorData = (optionsId) => {
        const optionsContainer = document.getElementById(optionsId);
        if (!optionsContainer) return [];
        return Array.from(optionsContainer.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => ({
                uid: checkbox.value,
                displayName: checkbox.parentElement.textContent.trim(),
                email: '' // You might want to store email if available
            }));
    };

    const selectedLeadAuditors = getSelectedAuditorData('lead-auditors-options');
    const selectedAuditors = getSelectedAuditorData('auditors-options');


    const checklistData = [];
    const checklistItemElements = checklistContainer?.querySelectorAll('.checklist-item');
    
    if (checklistItemElements) {
        checklistItemElements.forEach((itemElement, index) => {
            const originalItem = auditChecklist[index];
            const itemId = originalItem.id;
            
            // Reset any error highlighting
            itemElement.style.border = '';
            
            // Get applicability selection
            const applicableRadio = itemElement.querySelector(`input[name="applicable-${itemId}"]:checked`);
            const isApplicable = applicableRadio?.value === 'yes';
            
            // Inside the checklistData collection in collectAuditFormData:
            if (isApplicable) {
                const complianceBtn = itemElement.querySelector('.compliance-btn.active');
                const compliance = complianceBtn ? complianceBtn.dataset.compliance : '';
                
                const evidence = itemElement.querySelector('.evidence-input')?.value.trim() || '';
                const correctiveActionYes = itemElement.querySelector(`input[name="corrective-action-${itemId}"][value="yes"]`)?.checked || false;
                let correctiveActionsCount = null;
                const classification = itemElement.querySelector(`#classification-${itemId}`)?.value || '';
                const comments = itemElement.querySelector(`#comments-${itemId}`)?.value.trim() || '';
                
                checklistData.push({
                    id: itemId,
                    requirement: originalItem.requirement,
                    clause: originalItem.clause,
                    applicable: isApplicable ? 'yes' : 'no',
                    ...(itemId === 28 ? {
                        observations: itemElement.querySelector(`#observations-${itemId}`)?.value.trim() || ''
                    } : {
                        compliance,
                        objectiveEvidence: evidence,
                        correctiveActionNeeded: correctiveActionYes,
                        correctiveActionsCount,
                        classification: itemElement.querySelector(`#classification-${itemId}`)?.value || '',
                        comments: comments
                    })
                });
            }
            // Only collect data for applicable items
             else {
                // Mark as not applicable
                checklistData.push({
                    id: itemId,
                    requirement: originalItem.requirement,
                    clause: originalItem.clause,
                    applicable: 'no',
                    compliance: '',
                    objectiveEvidence: '',
                    correctiveActionNeeded: false,
                    correctiveActionsCount: null,
                    comments: ''
                });
            }
        });
    }

    const baseData = {
        date: auditDate, 
        directorateUnit, 
        refNo, 
        leadAuditors: selectedLeadAuditors, 
        auditors: selectedAuditors,
        checklist: checklistData, 
        lastModified: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'draft' // Default status, will be updated when submitted
    };

    if (!currentAudit) {
        if (!currentUser) { 
            console.error("No currentUser."); 
            alert("Error: User session lost."); 
            return null; 
        }
        baseData.createdBy = currentUser.uid;
        baseData.createdByEmail = currentUser.email;
        baseData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    }

    return { data: baseData, location:location};
}

async function saveAuditAsDraft() {
    const auditData = collectAuditFormData();
    auditData.status = 'draft';
    await saveAuditToFirestore(auditData);
    loadAudits();
    clearAuditForm();
}

async function submitAudit() {
    const formData = collectAuditFormData();
    if (!formData) return; // Basic validation failed
    
    // Confirm submission
    if (!confirm("Are you ready to submit this audit? Once submitted, you won't be able to edit it unless you're an admin.")) {
        return;
    }
    
    auditData = formData.data;
    auditData.status = 'submitted';
    auditData.submittedAt = firebase.firestore.FieldValue.serverTimestamp();
    
    try {
        if (currentAudit?.id) {
            await db.collection('audits').doc(currentAudit.id).update(auditData);
        } else {
            await db.collection('audits').add(auditData);
        }
        
        await generateAuditDocument(auditData);
        clearAuditForm();
        
        // Redirect to Teams channel
        redirectToTeamsChannel();
        
        loadAudits(); // Refresh the audit history
        switchSection('audit-history'); // Redirect to history view
    } catch (error) {
        console.error("Error submitting audit:", error);
        alert("Failed to submit audit: " + error.message);
    }
}

async function saveAuditToFirestore(auditData) {
    try {
        if (currentAudit?.id) {
            // Update existing audit
            await db.collection('audits').doc(currentAudit.id).update(auditData);
        } else {
            // Create new audit
            auditData.createdBy = currentUser.uid;
            auditData.createdByEmail = currentUser.email;
            await db.collection('audits').add(auditData);
        }
    } catch (error) {
        console.error("Error saving audit:", error);
        alert("Failed to save audit: " + error.message);
    }
}

function loadAudits() {
    console.log("Loading audits...");
    if (!currentUser) {
         audits = []; renderAuditHistory(); renderDashboard(); return;
    }
    db.collection('audits').orderBy('createdAt', 'desc').get()
        .then(querySnapshot => {
            audits = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log(`Loaded ${audits.length} audits.`);
            if (isSectionVisible('dashboard')) renderDashboard();
            if (isSectionVisible('audit-history')) renderAuditHistory();
            if (isSectionVisible('reports')) updateAreaFilter(); // Ensure area filter in reports is updated
            updateAreaFilter(); // Update history filter too
        })
        .catch(error => {
            console.error('Error loading audits: ', error);
            alert(`Failed to load audits: ${error.message}`);
            audits = [];
            if(recentAuditsList) recentAuditsList.innerHTML = '<p class="error-message">Error loading.</p>';
            if(auditHistoryList) auditHistoryList.innerHTML = '<p class="error-message">Error loading.</p>';
        });
}

// --- Dashboard Rendering ---
function renderDashboard() {
    if (!isSectionVisible('dashboard')) return;

    // Clear existing charts
    [complianceChartInstance, trendChartInstance, ncChartInstance, departmentChartInstance].forEach(
        chart => chart && chart.destroy()
    );

    // Populate directorate filter
    const directorates = [...new Set(audits.map(a => a.directorateUnit))];
    const filterSelect = document.getElementById('directorate-filter');
    filterSelect.innerHTML = `<option value="">All Directorates</option>${
        directorates.map(d => `<option value="${d}">${d}</option>`).join('')
    }`;

    // Set up filter handler
    filterSelect.addEventListener('change', updateDashboardMetrics);
    updateDashboardMetrics();
}

// Add new chart instances
let trendChartInstance, departmentChartInstance;

function updateDashboardMetrics() {
    const selectedDirectorate = document.getElementById('directorate-filter').value;
    const filteredAudits = selectedDirectorate ? 
        audits.filter(a => a.directorateUnit === selectedDirectorate) : 
        audits;

    // Calculate metrics
    const { complianceRate, nonComplianceRate, totalAudits, avgCorrective, trendData, ncData } = 
        calculateMetrics(filteredAudits);
    
    // Update metrics display
    document.getElementById('compliance-rate').textContent = `${complianceRate}%`;
    document.getElementById('non-compliance-rate').textContent = `${nonComplianceRate}%`;
    document.getElementById('total-audits').textContent = totalAudits;
    document.getElementById('avg-corrective').textContent = avgCorrective;

    // Update charts
    renderComplianceChart(complianceRate, nonComplianceRate);
    renderTrendChart(trendData);
    renderNCChart(ncData);
    renderDepartmentComparison();
}

function calculateMetrics(audits) {
    // Existing calculations...
    
    // Trend data (last 6 months)
    const months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }).reverse();

    const trendData = months.map(month => {
        const monthAudits = audits.filter(a => a.date.startsWith(month));
        // ... calculate monthly compliance
        return { month, compliance: 0 }; // Placeholder for your actual calculation
    });

    // Top non-conformance
    const ncCounts = {};
    audits.forEach(a => {
        a.checklist.forEach(item => {
            if (item.compliance === 'no') {
                ncCounts[item.requirement] = (ncCounts[item.requirement] || 0) + 1;
            }
        });
    });
    const ncData = Object.entries(ncCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { trendData, ncData }; 
}


function renderComplianceChart(data) {
    const ctx = document.getElementById('compliance-chart').getContext('2d');
    complianceChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Compliant', 'Non-Compliant'],
            datasets: [{
                data: [data.compliant, data.total - data.compliant],
                backgroundColor: ['#2a9d8f', '#e76f51']
            }]
        }
    });
}

function renderTrendChart(data) {
    const ctx = document.getElementById('trend-chart').getContext('2d');
    trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.month),
            datasets: [{
                label: 'Compliance Rate',
                data: data.map(d => d.rate),
                borderColor: '#0a9396',
                tension: 0.3
            }]
        },
        options: {
            scales: {
                y: { max: 100 }
            }
        }
    });
}

function renderNCChart(data) {
    const ctx = document.getElementById('nc-chart').getContext('2d');
    ncChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d[0]),
            datasets: [{
                label: 'Non-Conformances',
                data: data.map(d => d[1]),
                backgroundColor: '#e76f51'
            }]
        },
        options: {
            indexAxis: 'y'
        }
    });
}

function renderDepartmentComparison() {
    const departments = [...new Set(audits.map(a => a.directorateUnit))];
    const metrics = departments.map(dept => {
        const deptAudits = audits.filter(a => a.directorateUnit === dept);
        // Calculate department metrics
        return { 
            compliance: 0, // Replace with actual calculation
            nonCompliance: 0, // Replace with actual calculation
            audits: deptAudits.length,
            correctiveActions: 0 // Replace with actual calculation
        };
    });

    const ctx = document.getElementById('department-chart').getContext('2d');
    departmentChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Compliance', 'Non-Compliance', 'Audits', 'Corrective Actions'],
            datasets: departments.map((dept, i) => ({
                label: dept,
                data: [
                    metrics[i].compliance,
                    metrics[i].nonCompliance,
                    metrics[i].audits,
                    metrics[i].correctiveActions
                ],
                borderColor: getChartColor(i),
                pointBackgroundColor: getChartColor(i),
                tension: 0.3
            }))
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    max: Math.max(...metrics.flatMap(m => [m.compliance, m.nonCompliance]))
                }
            }
        }
    });
}
// Helper function for chart colors
function getChartColor(index) {
    const colors = ['var(--primary-color)', 'var(--secondary-color)', 'var(--accent-color)', 'var(--success-color)'];
    return colors[index % colors.length];
}

function renderDeptChart(data) {
    const ctx = document.getElementById('department-chart').getContext('2d');
    deptChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Compliance Rate', 'Total Audits', 'Avg. Corrective Actions'],
            datasets: data.map((dept, i) => ({
                label: dept.dept,
                data: [dept.compliance, dept.audits, dept.avgCorrective],
                backgroundColor: `hsla(${i * 90}, 70%, 50%, 0.2)`,
                borderColor: `hsl(${i * 90}, 70%, 50%)`
            }))
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    pointLabels: { font: { size: 12 } }
                }
            }
        }
    });
}

function updateDashboardMetrics() {
    const selectedDirectorate = document.getElementById('directorate-filter').value;
    const filteredAudits = selectedDirectorate ? 
        audits.filter(a => a.directorateUnit === selectedDirectorate) : 
        audits;

    // Calculate metrics
    let totalItems = 0;
    let compliantItems = 0;
    let nonCompliantItems = 0;
    let correctiveActions = 0;

    filteredAudits.forEach(audit => {
        audit.checklist.forEach(item => {
            if (item.applicable === 'yes') {
                totalItems++;
                if (item.compliance === 'yes') compliantItems++;
                else {
                    nonCompliantItems++;
                    if (item.correctiveActionNeeded) correctiveActions++;
                }
            }
        });
    });

    // Update metrics display
    const complianceRate = totalItems > 0 ? 
        Math.round((compliantItems / totalItems) * 100) : 0;
    const nonComplianceRate = totalItems > 0 ? 
        Math.round((nonCompliantItems / totalItems) * 100) : 0;
    const avgCorrective = filteredAudits.length > 0 ? 
        Math.round(correctiveActions / filteredAudits.length) : 0;

    document.getElementById('compliance-rate').textContent = `${complianceRate}%`;
    document.getElementById('non-compliance-rate').textContent = `${nonComplianceRate}%`;
    document.getElementById('total-audits').textContent = filteredAudits.length;
    document.getElementById('avg-corrective').textContent = avgCorrective;

    // Update chart
    renderComplianceChart(compliantItems, nonCompliantItems);
    renderRecentAudits(filteredAudits);
}


function renderComplianceChart(compliant, nonCompliant) {
    const ctx = document.getElementById('compliance-chart').getContext('2d');
    
    // Destroy previous chart instance if it exists
    if (complianceChartInstance) {
        complianceChartInstance.destroy();
    }
    
    complianceChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Compliant', 'Non-Compliant'],
            datasets: [{
                data: [compliant, nonCompliant],
                backgroundColor: [
                    '#2a9d8f', 
                    '#e76f51'  
                ],
                borderColor: [
                    '#ffffff', 
                    '#ffffff'  
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: { 
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

function renderRecentAudits(audits) {
    const recentList = document.getElementById('recent-audits-list');
    recentList.innerHTML = audits.slice(0, 5).map(audit => `
        <div class="audit-item" data-audit-id="${audit.id}">
            <div class="details">
                <strong>${audit.directorateUnit}</strong>
                <div class="meta">
                    <span class="date">${formatDate(audit.date)}</span>
                    <span class="status status-${audit.status}">${audit.status}</span>
                </div>
            </div>
        </div>
    `).join('') || '<p class="text-muted">No recent audits found</p>';
}

function renderNonConformanceChart() {
    if (!ncChartCanvas) return;
    const ctx = ncChartCanvas.getContext('2d');
     if (ncChartInstance) ncChartInstance.destroy();
     ncChartInsttance = new Chart(); 
    const ncByArea = {}; let hasNcData = false;
    audits.forEach(audit => {
        if (audit.checklist && (audit.directorateUnit || audit.auditedArea)) {
             const ncCount = audit.checklist.filter(item => item.compliance === 'no').length;
             if (ncCount > 0) {
                  hasNcData = true;
                  const areaKey = audit.directorateUnit || audit.auditedArea; // Use new field first
                  ncByArea[areaKey] = (ncByArea[areaKey] || 0) + ncCount;
             }
         }
    });
     if (!hasNcData) { /* Optionally display msg on canvas */ return; }
     const sortedAreas = Object.entries(ncByArea).sort(([, a], [, b]) => b - a);
     const labels = sortedAreas.map(([area]) => area.length > 30 ? area.substring(0, 27) + '...' : area);
     const data = sortedAreas.map(([, count]) => count);
     ncChartInstance = new Chart(ctx, {
        type: 'bar', data: { labels, datasets: [{ label: 'Non-Conformances', data, backgroundColor: '#e76f51' }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true, title: { display: true, text: 'Count' } } }, plugins: { legend: { display: false } } }
    });
}

// --- Audit History & Filtering ---
function renderAuditHistory(auditsToDisplay = audits) {
    if (!auditHistoryList) return;
    auditHistoryList.innerHTML = '';

    if (auditsToDisplay.length === 0) {
        auditHistoryList.innerHTML = '<p>No audits found matching criteria.</p>';
        return;
    }

    auditsToDisplay.forEach(audit => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'audit-item';
        itemDiv.dataset.auditId = audit.id;

        // Format lead auditors and auditors
        const leadAuditorsText = audit.leadAuditors?.map(a => a.displayName || a.email).join(', ') || 'None';
        const auditorsText = audit.auditors?.map(a => a.displayName || a.email).join(', ') || 'None';
        
        // Format dates
        const createdDate = formatDateTime(audit.createdAt);
        const modifiedDate = formatDateTime(audit.lastModified);
        const submittedDate = audit.submittedAt ? formatDateTime(audit.submittedAt) : 'Not submitted';

        itemDiv.innerHTML = `
            <div class="details">
                <strong>${escapeHtml(audit.directorateUnit)} (Ref: ${escapeHtml(audit.refNo || 'N/A')})</strong>
                <div class="meta">
                    <div><strong>Date:</strong> ${formatDate(audit.date)}</div>
                    <div><strong>Lead Auditors:</strong> ${escapeHtml(leadAuditorsText)}</div>
                    <div><strong>Auditors:</strong> ${escapeHtml(auditorsText)}</div>
                </div>
                <div class="dates">
                    <span><strong>Created:</strong> ${createdDate}</span>
                    <span><strong>Modified:</strong> ${modifiedDate}</span>
                    <span><strong>Submitted:</strong> ${submittedDate}</span>
                </div>
            </div>
            <span class="status status-${audit.status}">${escapeHtml(audit.status)}</span>`;

        itemDiv.addEventListener('click', () => openAuditDetails(audit));
        auditHistoryList.appendChild(itemDiv);
    });
}

function filterAudits() {
    const fromDate = document.getElementById('date-from').value;
    const toDate = document.getElementById('date-to').value;
    const areaFilter = areaFilterHistory.value;
    // console.log(`Filtering history: From=${fromDate}, To=${toDate}, Area=${areaFilter}`);
    const filtered = audits.filter(audit => {
        const area = audit.directorateUnit || audit.auditedArea; // Check both fields
        let match = true;
        if (fromDate && audit.date < fromDate) match = false;
        if (toDate && audit.date > toDate) match = false;
        if (areaFilter && area !== areaFilter) match = false;
        return match;
    });
    renderAuditHistory(filtered); // Render using the filtered subset
}

function updateAreaFilter() {
    if (!areaFilterHistory) return;
    const currentFilterValue = areaFilterHistory.value;
    // Use new directorateUnit field first, fallback to auditedArea
    const areas = [...new Set(audits.map(a => a.directorateUnit || a.auditedArea).filter(Boolean))].sort();
    while (areaFilterHistory.options.length > 1) areaFilterHistory.remove(1);
    areas.forEach(area => {
        const option = document.createElement('option');
        option.value = area; option.textContent = escapeHtml(area);
        areaFilterHistory.appendChild(option);
    });
    // Only restore if the value still exists in the options
    if (areaFilterHistory.querySelector(`option[value="${currentFilterValue}"]`)) {
        areaFilterHistory.value = currentFilterValue;
    } else {
        areaFilterHistory.value = ""; // Default to "All Areas" if previous selection is gone
    }
}


// --- Modal Functionality ---

function openAuditDetails(audit) {
    currentAudit = audit;
    modalTitle.textContent = `Audit: ${escapeHtml(audit.directorateUnit)} (${formatDate(audit.date)})`;
    
    // Build modal content without comments section
    let bodyContent = `
        <div class="audit-meta">
            <p><strong>Ref No:</strong> ${escapeHtml(audit.refNo || 'N/A')}</p>
            <p><strong>Audit Date:</strong> ${formatDate(audit.date)}</p>
            <p><strong>Status:</strong> <span class="status status-${audit.status}">${escapeHtml(audit.status)}</span></p>
        </div>
        
        <h3>Checklist Findings</h3>
        <div class="checklist-summary">`;
    
    // Add checklist items
    if (audit.checklist?.length > 0) {
        audit.checklist.forEach(item => {
            if (item.applicable === 'yes') {
                const compClass = item.compliance === 'yes' ? 'compliant' : 'non-compliant';
                const compText = item.compliance === 'yes' ? 'Compliant' : 'Non-Compliant';
                
                bodyContent += `
                    <div class="checklist-item-summary">
                        <h4>${item.id}. ${escapeHtml(item.requirement)} ${item.clause ? `(Cl ${item.clause})` : ''}</h4>
                        <p><strong>Compliance:</strong> <span class="${compClass}">${compText}</span></p>
                        ${item.objectiveEvidence ? `<p><strong>Evidence:</strong><br><pre>${escapeHtml(item.objectiveEvidence)}</pre></p>` : ''}
                        <p><strong>Correction Needed:</strong> ${item.correctiveActionNeeded ? 'Yes' : 'No'}</p>
                        ${item.comments ? `<p><strong>Comments:</strong><br><pre>${escapeHtml(item.comments)}</pre></p>` : ''}
                    </div>`;
            }
        });
    } else {
        bodyContent += '<p>No checklist data available.</p>';
    }

    modalBody.innerHTML = bodyContent;
    
    // Update modal actions
    modalActions.innerHTML = `
        <button id="export-audit-btn" class="btn btn-primary">Export as Document</button>
        <button id="close-modal-btn" class="btn btn-secondary">Close</button>
        ${currentUser?.role === 'admin' ? `<button id="delete-audit-btn" class="btn btn-danger">Delete Audit</button>` : ''}
    `;
    
    document.getElementById('export-audit-btn').addEventListener('click', exportCurrentAuditAsDocument);
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);
    
    if (currentUser?.role === 'admin') {
        document.getElementById('delete-audit-btn').addEventListener('click', deleteCurrentAudit);
    }
    
    modal.classList.remove('hidden');
}

function exportCurrentAuditAsDocument() {
    if (!currentAudit) return;
    generateAuditDocument(currentAudit);
}

function closeModal() {
     if (!modal) return;
    modal.classList.add('hidden');
    currentAudit = null;
    // console.log("Modal closed.");
}

function addSearchToAuditHistory() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search audits...';
    searchInput.className = 'search-input';
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = audits.filter(audit => 
            audit.directorateUnit.toLowerCase().includes(searchTerm) ||
            (audit.refNo && audit.refNo.toLowerCase().includes(searchTerm)) ||
            audit.status.toLowerCase().includes(searchTerm)
        );
        renderAuditHistory(filtered);
    });
    
    const filterControls = document.querySelector('.filter-controls');
    if (filterControls) {
        filterControls.prepend(searchInput);
    }
}

function addSortingToAuditHistory() {
    const sortSelect = document.createElement('select');
    sortSelect.className = 'sort-select';
    
    const options = [
        { value: 'date-desc', text: 'Date (Newest First)' },
        { value: 'date-asc', text: 'Date (Oldest First)' },
        { value: 'directorate', text: 'Directorate/Unit' },
        { value: 'status', text: 'Status' }
    ];
    
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        sortSelect.appendChild(option);
    });
    
    sortSelect.addEventListener('change', (e) => {
        const value = e.target.value;
        let sorted = [...audits];
        
        switch(value) {
            case 'date-desc':
                sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'date-asc':
                sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'directorate':
                sorted.sort((a, b) => a.directorateUnit.localeCompare(b.directorateUnit));
                break;
            case 'status':
                sorted.sort((a, b) => a.status.localeCompare(b.status));
                break;
        }
        
        renderAuditHistory(sorted);
    });
    
    const filterControls = document.querySelector('.filter-controls');
    if (filterControls) {
        filterControls.appendChild(sortSelect);
    }
}

function addSortingToAuditHistory() {
    const sortSelect = document.createElement('select');
    sortSelect.className = 'sort-select';
    
    const options = [
        { value: 'date-desc', text: 'Date (Newest First)' },
        { value: 'date-asc', text: 'Date (Oldest First)' },
        { value: 'directorate', text: 'Directorate/Unit' },
        { value: 'status', text: 'Status' }
    ];
    
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        sortSelect.appendChild(option);
    });
    
    sortSelect.addEventListener('change', (e) => {
        const value = e.target.value;
        let sorted = [...audits];
        
        switch(value) {
            case 'date-desc':
                sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'date-asc':
                sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'directorate':
                sorted.sort((a, b) => a.directorateUnit.localeCompare(b.directorateUnit));
                break;
            case 'status':
                sorted.sort((a, b) => a.status.localeCompare(b.status));
                break;
        }
        
        renderAuditHistory(sorted);
    });
    
    const filterControls = document.querySelector('.filter-controls');
    if (filterControls) {
        filterControls.appendChild(sortSelect);
    }
}

function addStatusFilter() {
    const statusFilter = document.createElement('select');
    statusFilter.className = 'status-filter';
    
    const options = [
        { value: '', text: 'All Statuses' },
        { value: 'draft', text: 'Draft' },
        { value: 'submitted', text: 'Submitted' }
    ];
    
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        statusFilter.appendChild(option);
    });
    
    statusFilter.addEventListener('change', (e) => {
        const status = e.target.value;
        const filtered = status ? audits.filter(audit => audit.status === status) : audits;
        renderAuditHistory(filtered);
    });
    
    const filterControls = document.querySelector('.filter-controls');
    if (filterControls) {
        filterControls.appendChild(statusFilter);
    }
}

async function deleteCurrentAudit() {
    if (!currentAudit || currentUser?.role !== 'admin') return;
    
    if (!confirm(`Are you sure you want to permanently delete this audit (${currentAudit.refNo})?`)) {
        return;
    }
    
    try {
        await db.collection('audits').doc(currentAudit.id).delete();
        loadAudits();
        closeModal();
        showMessage('Audit deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting audit:', error);
        showMessage('Failed to delete audit', 'error');
    }
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}


function setSelectedOptions(selectElement, selectedArray) {
    if (!selectElement || !selectedArray) return;
    const selectedUids = selectedArray.map(a => a.uid);
    Array.from(selectElement.options).forEach(opt => opt.selected = selectedUids.includes(opt.value));
}

function exportCurrentAudit() {
    if (!hasPermission('export_data')) { alert("Permission Denied."); return; }
    if (!currentAudit) { alert('No audit loaded.'); return; }

    const formatAuditorCSV = (arr) => arr?.map(a => `${a.displayName || a.email}`).join('; ') || '';
     const metaData = [
        ['Directorate / Unit:', currentAudit.directorateUnit || currentAudit.auditedArea], ['Ref No.:', currentAudit.refNo],
        ['Audit Date:', formatDate(currentAudit.date)], ['Lead Auditor(s):', formatAuditorCSV(currentAudit.leadAuditors)],
        ['Auditor(s):', formatAuditorCSV(currentAudit.auditors)], ['Status:', currentAudit.status],
        ['Created By:', currentAudit.createdByEmail || currentAudit.createdBy], ['Created At:', formatDateTime(currentAudit.createdAt)],
        ['Last Modified:', formatDateTime(currentAudit.lastModified)], ['Submitted At:', currentAudit.submittedAt ? formatDateTime(currentAudit.submittedAt) : 'N/A']
     ];
    const headers = ['ID', 'Requirement', 'Clause', 'Compliance', 'Evidence', 'Correction Needed', 'Count', 'Comments'];
    const rows = (currentAudit.checklist || []).map(item => [
        item.id, item.requirement, item.clause || '', item.compliance === 'yes' ? 'Compliant' : item.compliance === 'no' ? 'Non-Compliant' : 'Not Selected',
        item.objectiveEvidence || '', item.correctiveActionNeeded ? 'Yes' : 'No', item.correctiveActionNeeded ? (item.correctiveActionsCount ?? '') : '', item.comments || ''
    ]);

    let csv = metaData.map(r => r.map(formatCsvCell).join(',')).join('\n') + '\n\n';
    csv += headers.map(formatCsvCell).join(',') + '\n';
    csv += rows.map(r => r.map(formatCsvCell).join(',')).join('\n');
    const safeName = (currentAudit.directorateUnit || currentAudit.auditedArea || 'Audit').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const safeDate = (currentAudit.date || 'Date').replace(/-/g, '');
    downloadCSV(csv, `audit_${safeName}_${safeDate}.csv`);
}

// --- Reporting ---

function initReportControls() {
     const today = new Date(); const lastMonth = new Date(today); lastMonth.setMonth(lastMonth.getMonth() - 1);
     const reportFromInput = document.getElementById('report-from');
     const reportToInput = document.getElementById('report-to');
     const customDateRangeDiv = document.getElementById('custom-date-range');
     const reportPeriodSelect = document.getElementById('report-period');

     if(reportFromInput) reportFromInput.value = lastMonth.toISOString().split('T')[0];
     if(reportToInput) reportToInput.value = today.toISOString().split('T')[0];
     if(customDateRangeDiv) customDateRangeDiv.classList.add('hidden');
     if(reportPeriodSelect) reportPeriodSelect.value = 'last-month';

     if(reportChartInstance) reportChartInstance.destroy();
     if(reportTableContainer) reportTableContainer.innerHTML = '<p>Select criteria & generate.</p>';
     if(reportChartContainer) reportChartContainer.style.display = 'none';
     updateAreaFilter(); // Update filter dropdown in reports
}

function toggleCustomDateRange() {
    const reportPeriodSelect = document.getElementById('report-period');
    const customDateRangeDiv = document.getElementById('custom-date-range');
    if (reportPeriodSelect && customDateRangeDiv) {
        customDateRangeDiv.classList.toggle('hidden', reportPeriodSelect.value !== 'custom');
    }
}



async function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const period = document.getElementById('report-period').value;
    
    let fromDate, toDate;
    const today = new Date();
    
    if (period === 'custom') {
        fromDate = document.getElementById('report-from').value;
        toDate = document.getElementById('report-to').value;
        
        if (!fromDate || !toDate) {
            showMessage('Please select a custom date range', 'error');
            return;
        }
    } else {
        const toDateObj = new Date(today);
        toDate = toDateObj.toISOString().split('T')[0];
        
        const fromDateObj = new Date(today);
        if (period === 'last-month') fromDateObj.setMonth(fromDateObj.getMonth() - 1);
        else if (period === 'last-quarter') fromDateObj.setMonth(fromDateObj.getMonth() - 3);
        else if (period === 'last-year') fromDateObj.setFullYear(fromDateObj.getFullYear() - 1);
        
        fromDate = fromDateObj.toISOString().split('T')[0];
    }
    
    const reportAudits = audits.filter(a => a.date >= fromDate && a.date <= toDate && a.status === 'submitted');
    
    if (reportAudits.length === 0) {
        showMessage('No submitted audits found for selected period', 'warning');
        return;
    }
    
    try {
        switch(reportType) {
            case 'compliance':
                generateComplianceReport(reportAudits, fromDate, toDate);
                break;
            case 'non-conformance':
                generateNonConformanceReport(reportAudits, fromDate, toDate);
                break;
            case 'trend':
                generateTrendReport(reportAudits, fromDate, toDate);
                break;
            case 'department':
                generateDepartmentReport(reportAudits, fromDate, toDate);
                break;
        }
    } catch (error) {
        console.error('Error generating report:', error);
        showMessage('Failed to generate report', 'error');
    }
}

function renderReportsDashboard() {
    const reportsSection = document.getElementById('reports-section');
    if (!reportsSection) return;
    
    reportsSection.innerHTML = `
        <div class="reports-header">
            <h2>Reports & Analysis</h2>
            <div class="report-controls">
                <select id="report-period" class="form-control">
                    <option value="last-month">Last Month</option>
                    <option value="last-quarter">Last Quarter</option>
                    <option value="last-year">Last Year</option>
                    <option value="custom">Custom Range</option>
                </select>
                
                <div id="custom-date-range" class="hidden">
                    <input type="date" id="report-from" class="form-control">
                    <input type="date" id="report-to" class="form-control">
                </div>
                
                <select id="report-type" class="form-control">
                    <option value="compliance">Compliance Overview</option>
                    <option value="non-conformance">Non-Conformance Analysis</option>
                    <option value="trend">Trend Analysis</option>
                    <option value="department">Department Comparison</option>
                </select>
                
                <button id="generate-report-btn" class="btn btn-primary">Generate Report</button>
                <button id="export-pdf-btn" class="btn btn-secondary">Export as PDF</button>
            </div>
        </div>
        
        <div class="reports-grid">
            <div class="report-card">
                <h3>Compliance Overview</h3>
                <div class="chart-container">
                    <canvas id="compliance-chart"></canvas>
                </div>
                <div class="report-summary" id="compliance-summary"></div>
            </div>
            
            <div class="report-card">
                <h3>Non-Conformance Analysis</h3>
                <div class="chart-container">
                    <canvas id="nc-chart"></canvas>
                </div>
                <div class="report-summary" id="nc-summary"></div>
            </div>
            
            <div class="report-card">
                <h3>Trend Analysis</h3>
                <div class="chart-container">
                    <canvas id="trend-chart"></canvas>
                </div>
                <div class="report-summary" id="trend-summary"></div>
            </div>
            
            <div class="report-card">
                <h3>Department Comparison</h3>
                <div class="chart-container">
                    <canvas id="department-chart"></canvas>
                </div>
                <div class="report-summary" id="department-summary"></div>
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('report-period').addEventListener('change', toggleCustomDateRange);
    document.getElementById('generate-report-btn').addEventListener('click', generateReport);
    document.getElementById('export-pdf-btn').addEventListener('click', exportReportAsPDF);
    
    // Initialize default reports
    generateComplianceReport(audits);
}

function generateComplianceReport(reportAudits, from, to) {
    const ctx = document.getElementById('compliance-chart').getContext('2d');
    
    // Calculate compliance metrics
    let totalItems = 0;
    let compliantItems = 0;
    let nonCompliantItems = 0;
    
    reportAudits.forEach(audit => {
        audit.checklist.forEach(item => {
            if (item.applicable === 'yes') {
                totalItems++;
                if (item.compliance === 'yes') compliantItems++;
                else nonCompliantItems++;
            }
        });
    });
    
    const complianceRate = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 0;
    
    // Update chart
    if (complianceChartInstance) complianceChartInstance.destroy();
    
    complianceChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Compliant', 'Non-Compliant'],
            datasets: [{
                data: [compliantItems, nonCompliantItems],
                backgroundColor: ['#2a9d8f', '#e76f51'],
                borderColor: ['#ffffff', '#ffffff'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} items (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
    
    // Update summary
    const summaryEl = document.getElementById('compliance-summary');
    if (summaryEl) {
        summaryEl.innerHTML = `
            <div class="metric">
                <div class="metric-value">${complianceRate}%</div>
                <div class="metric-label">Overall Compliance Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value">${reportAudits.length}</div>
                <div class="metric-label">Audits Analyzed</div>
            </div>
            <div class="metric">
                <div class="metric-value">${totalItems}</div>
                <div class="metric-label">Items Checked</div>
            </div>
            <div class="time-period">${formatDate(from)} to ${formatDate(to)}</div>
        `;
    }
}

function exportReportAsPDF() {

    
    const reportType = document.getElementById('report-type').value;
    const title = `NAFDAC Audit Report - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`;
    

    const reportDiv = document.createElement('div');
    reportDiv.className = 'pdf-report';
    reportDiv.innerHTML = `
        <h1>${title}</h1>
        <div class="report-period">${getReportPeriodText()}</div>
        <div class="report-content">
            ${getReportContentForPDF(reportType)}
        </div>
        <div class="footer">
            Generated on ${formatDate(new Date())} by ${currentUser?.email || 'System'}
        </div>
    `;
    
    document.body.appendChild(reportDiv);
    

    const opt = {
        margin: 10,
        filename: `NAFDAC_Report_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    

    html2pdf().from(reportDiv).set(opt).save();

    setTimeout(() => {
        reportDiv.remove();
    }, 1000);
}

function getReportPeriodText() {
    const period = document.getElementById('report-period').value;
    
    if (period === 'custom') {
        const from = document.getElementById('report-from').value;
        const to = document.getElementById('report-to').value;
        return `Period: ${formatDate(from)} to ${formatDate(to)}`;
    }
    
    return `Period: Last ${period.replace('last-', '')}`;
}

function getReportContentForPDF(reportType) {
   
    switch(reportType) {
        case 'compliance':
            return document.getElementById('compliance-summary').outerHTML;
        case 'non-conformance':
            return document.getElementById('nc-summary').outerHTML;
        // Add other cases
        default:
            return '';
    }
}

function generateNonConformanceReport(reportAudits, from, to) {
    console.log("Generating NC Report");
     if (!reportChartCanvas || !reportTableContainer) return;
    const ctx = reportChartCanvas.getContext('2d');
    const ncByReq = {}; let totalNC = 0, totalItems = 0;
    reportAudits.forEach(a => { if (a.checklist) { a.checklist.forEach(i => { totalItems++; if (i.compliance === 'no') { totalNC++; const key = `${i.id}|${i.requirement}`; ncByReq[key] = (ncByReq[key] || 0) + 1; } }); } });
    const sortedNC = Object.entries(ncByReq).sort(([, a], [, b]) => b - a);
    if (sortedNC.length === 0) { reportTableContainer.innerHTML = '<p>No NCs found.</p>'; if(reportChartContainer) reportChartContainer.style.display = 'none'; return; }
    const topN = 10; const topNC = sortedNC.slice(0, topN);
    const labels = topNC.map(([k]) => { const r = k.split('|')[1]; return r.length > 40 ? r.substring(0, 37) + '...' : r; });
    const data = topNC.map(([, c]) => c);
    if (reportChartInstance) reportChartInstance.destroy();
    reportChartInstance = new Chart(ctx, { type: 'bar', data: { labels, datasets: [{ label: 'NC Count', data, backgroundColor: '#e76f51' }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true, title: { display: true, text: 'Count' } } }, plugins: { legend: { display: false } } } });
    let table = `<h3>NC Analysis (${formatDate(from)} to ${formatDate(to)})</h3><p>Total NCs: ${totalNC} (${totalItems} items checked)</p><table class="report-table"><thead><tr><th>ID</th><th>Requirement</th><th>Clause</th><th>Count</th><th>% of Total NC</th></tr></thead><tbody>`;
    sortedNC.forEach(([k, c]) => { const [id, req] = k.split('|'); const cl = auditChecklist.find(i => i.id.toString() === id)?.clause || 'N/A'; const perc = totalNC > 0 ? Math.round((c / totalNC) * 100) : 0; table += `<tr><td>${id}</td><td>${escapeHtml(req)}</td><td>${cl}</td><td>${c}</td><td>${perc}%</td></tr>`; });
    table += `</tbody></table>`; reportTableContainer.innerHTML = table;
}

function generateTrendReport(reportAudits, from, to) {
    console.log("Generating Trend Report");
     if (!reportChartCanvas || !reportTableContainer) return;
    const ctx = reportChartCanvas.getContext('2d');
    const monthly = {};
    reportAudits.forEach(a => { if (a.date && a.checklist) { const m = a.date.substring(0, 7); if (!monthly[m]) monthly[m] = { items: 0, compliant: 0, audits: 0 }; monthly[m].audits++; monthly[m].items += a.checklist.length; monthly[m].compliant += a.checklist.filter(i => i.compliance === 'yes').length; } });
    const months = Object.keys(monthly).sort();
    if (months.length === 0) { reportTableContainer.innerHTML = '<p>No trend data.</p>'; if(reportChartContainer) reportChartContainer.style.display = 'none'; return; }
    const rates = months.map(m => { const d = monthly[m]; return d.items > 0 ? Math.round((d.compliant / d.items) * 100) : 0; });
    if (reportChartInstance) reportChartInstance.destroy();
    reportChartInstance = new Chart(ctx, { type: 'line', data: { labels: months.map(formatMonth), datasets: [{ label: 'Monthly Compliance (%)', data: rates, borderColor: '#3498db', tension: 0.1 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100, title: { display: true, text: 'Rate (%)' } } } } });
    let table = `<h3>Trend (${formatDate(from)} to ${formatDate(to)})</h3><table class="report-table"><thead><tr><th>Month</th><th>Audits</th><th>Items</th><th>Compliant</th><th>Rate</th></tr></thead><tbody>`;
    months.forEach(m => { const d = monthly[m]; const r = d.items > 0 ? Math.round((d.compliant / d.items) * 100) : 0; table += `<tr><td>${formatMonth(m)}</td><td>${d.audits}</td><td>${d.items}</td><td>${d.compliant}</td><td>${r}%</td></tr>`; });
    table += `</tbody></table>`; reportTableContainer.innerHTML = table;
}

function exportReportToCSV() {
    if (!hasPermission('export_data')) { alert("Permission Denied."); return; }
    const table = reportTableContainer?.querySelector('.report-table');
    if (!table) { alert('No report table found.'); return; }
    const title = reportTableContainer?.querySelector('h3')?.textContent || "Report";
    let csv = `"${title}"\n\n`; const rows = table.querySelectorAll('tr');
    rows.forEach(row => { const cols = Array.from(row.querySelectorAll('th, td')).map(col => formatCsvCell(col.textContent)); csv += cols.join(',') + '\n'; });
    const type = document.getElementById('report-type').value; const period = document.getElementById('report-period').value;
    let datePart = period === 'custom' ? `${document.getElementById('report-from').value}_to_${document.getElementById('report-to').value}` : period.replace('last-', '');
    downloadCSV(csv, `report_${type}_${datePart}.csv`);
}

function exportDashboardData() {
     if (!hasPermission('export_data')) { alert("Permission Denied."); return; }
     if (audits.length === 0) { alert('No audit data available.'); return; }
     const headers = [ 'Audit ID', 'Audit Date', 'Directorate/Unit', 'Ref No', 'Lead Auditors', 'Auditors', 'Status', 'Created By', 'Created At', 'Modified', 'Submitted At', 'Checklist ID', 'Requirement', 'Clause', 'Compliance', 'Evidence', 'Correction Needed', 'Count', 'Comments' ];
     const rows = [];
     const formatAuditorCSV = (arr) => arr?.map(a => `${a.displayName || a.email}`).join('; ') || '';
     audits.forEach(a => {
         const lead = formatAuditorCSV(a.leadAuditors); const auds = formatAuditorCSV(a.auditors);
         const created = formatDateTime(a.createdAt); const modified = formatDateTime(a.lastModified); const submitted = a.submittedAt ? formatDateTime(a.submittedAt) : '';
         if (a.checklist?.length > 0) {
             a.checklist.forEach(i => { rows.push([ a.id, a.date, a.directorateUnit || a.auditedArea, a.refNo || '', lead, auds, a.status, a.createdByEmail || '', created, modified, submitted, i.id, i.requirement, i.clause || '', i.compliance === 'yes' ? 'C' : i.compliance === 'no' ? 'NC' : 'NA', i.objectiveEvidence || '', i.correctiveActionNeeded ? 'Y' : 'N', i.correctiveActionNeeded ? (i.correctiveActionsCount ?? '') : '', i.comments || '' ]); });
         } else { rows.push([ a.id, a.date, a.directorateUnit || a.auditedArea, a.refNo || '', lead, auds, a.status, a.createdByEmail || '', created, modified, submitted, '', '', '', '', '', '', '', '' ]); }
     });
     let csv = headers.map(formatCsvCell).join(',') + '\n';
     csv += rows.map(r => r.map(formatCsvCell).join(',')).join('\n');
     downloadCSV(csv, `all_audit_data_${new Date().toISOString().split('T')[0]}.csv`);
}

// --- User Management ---

async function loadUsersForManagement() {
    if (!hasPermission('manage_users') || !userListContainer) return;
    userListContainer.innerHTML = '<p>Loading users...</p>';
    try {
        const snap = await db.collection('users').orderBy('email').get();
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderUserList(list);
    } catch (e) { console.error("Error loading users:", e); userListContainer.innerHTML = '<p class="error-message">Failed to load users.</p>'; } // Use error class
}

function renderUserList(users) {
     if (!userListContainer) return; userListContainer.innerHTML = '';
     if (users.length === 0) { userListContainer.innerHTML = '<p>No users found.</p>'; return; }
     users.forEach(user => {
        const item = document.createElement('div'); item.className = 'user-list-item'; item.dataset.userId = user.id;
        const info = document.createElement('div'); info.className = 'user-info-details';
        info.innerHTML = `<p class="user-email">${escapeHtml(user.email || 'No Email')}</p><p class="user-role">Role: <strong>${escapeHtml(user.role || 'Not Set')}</strong></p><p class="user-uid">UID: ${user.id}</p>`;
        const selectorDiv = document.createElement('div'); selectorDiv.className = 'user-role-selector';
        if (currentUser?.uid === user.id) { selectorDiv.innerHTML = `<p><em>(Your Account)</em></p>`; }
        else {
            const sel = document.createElement('select'); sel.className = 'role-select'; sel.dataset.userId = user.id; sel.dataset.originalRole = user.role || '';
            Object.values(ROLES).forEach(r => { const opt = document.createElement('option'); opt.value = r; let txt = r.replace('_', ' '); txt = txt.charAt(0).toUpperCase() + txt.slice(1); opt.textContent = txt; opt.selected = user.role === r; sel.appendChild(opt); });
            sel.addEventListener('change', handleRoleChange); selectorDiv.appendChild(sel);
        }
        item.appendChild(info); item.appendChild(selectorDiv); userListContainer.appendChild(item);
    });
}

async function handleRoleChange(event) {
    if (!hasPermission('manage_users')) { alert("Permission Denied."); event.target.value = event.target.dataset.originalRole; return; }
    const sel = event.target; const userId = sel.dataset.userId; const newRole = sel.value; const oldRole = sel.dataset.originalRole;
    if (!userId || !newRole || !oldRole) { console.error("Missing data for role change."); return;}
    const email = sel.closest('.user-list-item')?.querySelector('.user-email')?.textContent || `UID ${userId}`;
    if (!confirm(`Change role for ${email} from '${oldRole}' to '${newRole}'?`)) { sel.value = oldRole; return; }
    console.log(`Updating role for ${userId} to ${newRole}`); sel.disabled = true;
    try {
        await db.collection('users').doc(userId).update({ role: newRole });
        alert(`Role updated successfully for ${email}.`); sel.dataset.originalRole = newRole;
        const roleText = sel.closest('.user-list-item')?.querySelector('.user-role strong'); if (roleText) roleText.textContent = newRole;
    } catch (e) { console.error(`Error updating role:`, e); alert(`Failed: ${e.message}`); sel.value = oldRole; }
    finally { sel.disabled = false; }
}

// --- Utility Helpers ---

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
    if (dateInput.toDate) date = dateInput.toDate();
    else { const parts = String(dateInput).split('-'); if (parts.length === 3) date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])); else date = new Date(dateInput); }
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function formatMonth(monthString) {
    if (!monthString || monthString.length !== 7) return monthString || 'N/A';
    try { const [y, m] = monthString.split('-'); const d = new Date(Date.UTC(parseInt(y), parseInt(m) - 1, 1)); return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', timeZone: 'UTC' }); }
    catch (e) { return monthString; }
}

function formatDateTime(timestamp) {
    if (!timestamp) return 'N/A'; let date;
    if (timestamp.toDate) date = timestamp.toDate(); else if (timestamp instanceof Date) date = timestamp; else date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

// Correct escapeHtml function
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
     const str = String(cell ?? '');
     return (str.includes(',') || str.includes('"') || str.includes('\n')) ? `"${str.replace(/"/g, '""')}"` : str;
}

function isSectionVisible(sectionId) {
    const section = document.getElementById(`${sectionId}-section`);
    return section && !section.classList.contains('hidden');
}

function getComplianceStatus(rate) {
    if (rate >= 90) return { statusClass: 'excellent', statusText: 'Excellent' }; if (rate >= 75) return { statusClass: 'good', statusText: 'Good' };
    if (rate >= 50) return { statusClass: 'fair', statusText: 'Fair' }; return { statusClass: 'poor', statusText: 'Needs Improvement' };
}
function getComplianceColor(rate) {
    if (rate >= 90) return '#2a9d8f'; if (rate >= 75) return '#0077b6'; if (rate >= 50) return '#f4a261'; return '#e76f51';
}

function toggleDropdown(type) {
    const options = document.getElementById(`${type}-options`);
    options.style.display = options.style.display === 'block' ? 'none' : 'block';
    
    // Close other dropdowns
    document.querySelectorAll('.dropdown-options').forEach(dropdown => {
        if(dropdown.id !== `${type}-options`) {
            dropdown.style.display = 'none';
        }
    });
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.custom-multiselect')) {
        document.querySelectorAll('.dropdown-options').forEach(dropdown => {
            dropdown.style.display = 'none';
        });
    }
});

// Update selected names display
document.querySelectorAll('.dropdown-options input').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const container = this.closest('.custom-multiselect');
        const selected = Array.from(container.querySelectorAll('input:checked'))
                            .map(cb => cb.value)
                            .join(', ');
        
        const displayElement = container.querySelector('.selected-names');
        displayElement.textContent = selected || displayElement.dataset.placeholder;
        displayElement.style.color = selected ? 'var(--dark-color)' : 'var(--text-muted)';
    });
});

function triggerEmailWorkflow(auditData) {
    const subject = `NAFDAC Audit Submission: ${auditData.directorateUnit} - ${formatDate(auditData.date)}`;
    
    let body = `Audit Details:\n\n`;
    body += `Directorate/Unit: ${auditData.directorateUnit}\n`;
    body += `Date: ${formatDate(auditData.date)}\n`;
    body += `Ref No: ${auditData.refNo || 'N/A'}\n\n`;
    
    if (auditData.comments?.length > 0) {
        body += `Internal Comments:\n`;
        auditData.comments.forEach(comment => {
            body += `- ${comment.authorName} (${formatDateTime(comment.timestamp)}): ${comment.text}\n`;
        });
        body += `\n`;
    }
    
    body += `Please review the complete audit in the system for detailed findings.\n`;
    
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
}

// Add comment functionality to the modal
function addCommentSectionToModal() {
    if (!modalBody || !currentAudit) return;
    
    // Only show comment section for admins and lead auditors
    if (hasPermission('manage_users') || hasPermission('create_audit')) {
        const commentSection = document.createElement('div');
        commentSection.className = 'comment-section';
        commentSection.innerHTML = `
            <h4>Lead Auditor Comments</h4>
            <div class="comment-list" id="comment-list">
                ${renderComments(currentAudit.comments || [])}
            </div>
            <textarea id="new-comment" rows="3" placeholder="Add your comment..."></textarea>
            <button id="add-comment-btn" class="btn btn-primary">Add Comment</button>
            
            ${currentAudit.status === 'submitted' ? `
            <div class="approval-section">
                <button id="approve-audit-btn" class="btn btn-success">Approve Audit</button>
            </div>
            ` : ''}
        `;
        
        modalBody.appendChild(commentSection);
        
        // Add event listeners
        document.getElementById('add-comment-btn')?.addEventListener('click', addComment);
        document.getElementById('approve-audit-btn')?.addEventListener('click', approveAudit);
    }
}

function renderComments(comments) {
    if (!comments || comments.length === 0) {
        return '<p class="no-comments">No internal comments yet</p>';
    }

    return comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <span class="comment-author">${escapeHtml(comment.authorName)}</span>
                <span class="comment-date">${formatDateTime(comment.timestamp)}</span>
            </div>
            <div class="comment-text">${escapeHtml(comment.text)}</div>
        </div>
    `).join('');
}

async function addComment() {
    if (!currentAudit || !hasPermission('manage_users') && !hasPermission('lead_auditor')) return;

    const commentText = document.getElementById('new-comment')?.value;
    if (!commentText) return;

    const comment = {
        text: commentText,
        author: currentUser.email,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('audits').doc(currentAudit.id).update({
        comments: firebase.firestore.FieldValue.arrayUnion(comment)
    });

    openAuditDetails({ ...currentAudit }); // Refresh view
}

async function approveAudit() {
    if (!confirm("Approve this audit and notify auditors?")) return;

    // Update audit status
    await db.collection('audits').doc(currentAudit.id).update({
        status: 'approved',
        approvedBy: currentUser.email,
        approvedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Trigger approval email
    const subject = `Audit Approved: ${currentAudit.directorateUnit} - ${formatDate(currentAudit.date)}`;
    const body = `The audit has been approved by ${currentUser.email}.\n\n
        Please review the comments and complete any follow-up actions.\n
        Audit Reference: ${currentAudit.refNo}`;

    const mailtoLink = `mailto:${currentAudit.createdByEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');

    closeModal();
    loadAudits();
}

function triggerApprovalEmail(audit) {
    const subject = `NAFDAC Audit Approved: ${audit.directorateUnit} - ${formatDate(audit.date)}`;
    
    let body = `Audit Approved:\n\n`;
    body += `Directorate/Unit: ${audit.directorateUnit}\n`;
    body += `Date: ${formatDate(audit.date)}\n`;
    body += `Ref No: ${audit.refNo || 'N/A'}\n\n`;
    
    body += `This audit has been approved by ${currentUser.displayName || currentUser.email}.\n\n`;
    body += `Please review the comments and take appropriate action.\n\n`;
    
    // Add any comments
    if (audit.comments?.length > 0) {
        body += `Comments:\n`;
        audit.comments.forEach(comment => {
            body += `- ${comment.authorName || comment.authorEmail} (${formatDateTime(comment.timestamp)}): ${comment.text}\n`;
        });
    }
    
    // Generate mailto link
    const mailtoLink = `mailto:${audit.createdByEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open email client
    window.open(mailtoLink, '_blank');
}

async function postComment() {
    if (!currentAudit || !hasPermission('add_comments')) return;

    const commentText = document.getElementById('new-comment')?.value.trim();
    if (!commentText) return;

    try {
        const comment = {
            text: commentText,
            authorId: currentUser.uid,
            authorName: currentUser.displayName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('audits').doc(currentAudit.id).update({
            comments: firebase.firestore.FieldValue.arrayUnion(comment)
        });

        // Refresh the audit details view
        openAuditDetails({ ...currentAudit, comments: [...(currentAudit.comments || []), comment] });
        document.getElementById('new-comment').value = '';
    } catch (error) {
        console.error('Error posting comment:', error);
        alert('Failed to post comment: ' + error.message);
    }
}

function triggerWorkflowEmail(audit, type) {
    const baseUrl = "https://NIAD-1@github.io";
    const auditLink = `${baseUrl}/?auditId=${audit.id}`;
    
    const emailMap = {
        draft: {
            subject: `Draft Audit Needs Review - ${audit.refNo}`,
            body: `Please review the draft audit: ${auditLink}`
        },
        review: {
            subject: `Audit Ready for Final Approval - ${audit.refNo}`,
            body: `Audit ready for final approval: ${auditLink}`
        },
        final: {
            subject: `Audit Finalized - ${audit.refNo}`,
            body: `Audit has been finalized: ${auditLink}`
        }
    };

    const { subject, body } = emailMap[type];
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
}

// Update permission checks
function updateFormActions() {
    const isAdmin = currentUser?.role === ROLES.ADMIN;
    const isLead = currentUser?.role === ROLES.LEAD_AUDITOR;
    
    document.getElementById('submit-review-btn').classList.toggle('hidden', !isLead);
    document.getElementById('final-submit-btn').classList.toggle('hidden', !isAdmin);
    document.querySelectorAll('.lead-comment-field').forEach(el => {
        el.style.display = (isAdmin || isLead) ? 'block' : 'none';
    })
}


// In submit handlers
async function submitDraft() {
    const auditData = collectAuditFormData();
    auditData.status = 'draft';
    await saveAuditToFirestore(auditData);
    triggerWorkflowEmail(auditData, 'draft');
}

async function submitReview() {
    const auditData = collectAuditFormData();
    auditData.status = 'review';
    await saveAuditToFirestore(auditData);
    triggerWorkflowEmail(auditData, 'review');
}

// In audit detail rendering
function renderLeadComments(comments) {
    if (!hasPermission('lead_auditor') && !hasPermission('admin')) return '';
    
    return comments.map(c => `
        <div class="lead-comment">
            <strong>Lead Comment:</strong>
            <p>${escapeHtml(c.text)}</p>
            <small>By ${c.author} at ${formatDateTime(c.timestamp)}</small>
        </div>
    `).join('');
}

// In form initialization
document.querySelectorAll('.lead-comment-field').forEach(field => {
    field.style.display = hasPermission('lead_auditor') || hasPermission('admin') 
        ? 'block' 
        : 'none';
});


async function generateAuditDocument(auditData) {
    // Get user inputs
    const introductionText = document.querySelector('.evidence-input')?.value || '';
    const otherObservations = auditData.checklist?.find(item => item.id === 28)?.observations || '';
    const auditeeName = document.getElementById('auditee-name')?.value || 'Not specified';
    const auditeePosition = document.getElementById('auditee-position')?.value || 'Not specified';
    const logoUrl = 'data:image/png;base64,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';
    const location = auditData.location || 'Not specified';
    // Generate HTML
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>NAFDAC IASR - ${auditData.refNo}</title>
        <style>
            .header {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #005f73;
            }
            .header-logo {
            height: 80px;
            margin-right: 20px;
            }
            .header-content {
                overflow: hidden;
                text-align: center;
            }
            @page {
                size: A4;
                margin: 2.54cm; /* Standard A4 margins */
            }
            body { 
                font-family: 'Times New Roman', Times, serif; 
                margin: 0;
                line-height: 1.5;
            }
            .header { 
                text-align: center; 
                margin-bottom: 20px;
                border-bottom: 2px solid #005f73;
                padding-bottom: 10px;
            }
            .metadata {
                display: flex;
                justify-content: space-between;
                margin: 20px 0;
                font-size: 11pt;
            }
            .location { 
                font-weight: bold; 
                margin-top: 15px;
                font-size: 12pt;
            }
            table { 
                width: 100%; 
                border-collapse: collapse;
                table-layout: fixed; /* Added for consistent column widths */
                word-wrap: break-word; /* Ensure text wraps in cells */
                margin: 15px 0;
            }
            th, td { 
                border: 1px solid #000;
                padding: 8px;
                vertical-align: top; /* Align content to top */
                word-break: break-word; /* Break long words */
            }
            /* Column width adjustments */
            th:nth-child(1), td:nth-child(1) { width: 5%; }
            th:nth-child(2), td:nth-child(2) { width: 25%; }
            th:nth-child(3), td:nth-child(3) { width: 25%; }
            th:nth-child(4), td:nth-child(4) { width: 15%; }
            th:nth-child(5), td:nth-child(5) { width: 10%; }
            th:nth-child(6), td:nth-child(6) { width: 10%; }
            th:nth-child(7), td:nth-child(7) { width: 10%; }

            .compliant { color: #2a9d8f; font-weight: bold; }
            .non-compliant { color: #e76f51; font-weight: bold; }
            .signature-section {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-top: 40px;
            }
            .signature-line {
                border-top: 1px solid #000;
                width: 250px;
                margin-top: 30px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <img src="${logoUrl}" class="header-logo" alt="NAFDAC Logo">
            <div class="header-content">
                <h2>National Agency for Food and Drug Administration and Control</h2>
                <h3>INTERNAL AUDIT SUMMARY REPORT (IASR)</h3>
                <div class="location">
                    LOCATION: ${escapeHtml(location)}<br>
                    UNIT/DIRECTORATE: ${escapeHtml(auditData.directorateUnit)}
                </div>
            </div>
            <div style="clear: both;"></div>
        </div>

        <!-- Metadata -->
        <div class="metadata">
            <div style="float: left;">
                <strong>AUDIT REF. No:</strong> ${escapeHtml(auditData.refNo)}
            </div>
            <div style="float: right;">
                <strong>DATE:</strong> ${formatDate(auditData.date)}
            </div>
            <div style="clear: both;"></div>
        </div>

        <!-- Auditee & Auditors -->
        <p><strong>1. AUDITEE:</strong><br>
        Name: ${escapeHtml(auditeeName)}<br>
        Position: ${escapeHtml(auditeePosition)}</p>

        <p><strong>2. AUDITORS:</strong><br>
        Lead Auditors: ${formatAuditors(auditData.leadAuditors)}<br>
        Auditors: ${formatAuditors(auditData.auditors)}</p>

        <!-- Scope Table -->
        <table>
            <tr><th>ISO</th><th>Clause No.</th><th>PROCESSES</th></tr>
            ${generateScopeRows()}
        </table>

        <!-- Introduction -->
        <h4>4. INTRODUCTION</h4>
        ${introductionText ? `<p>${escapeHtml(introductionText)}</p>` : '<p>No introduction provided.</p>'}

        <!-- Audit Findings -->
        <h4>5. ISO 9001:2015 Alignment</h4>
        <p>Audit summary observations are as follows:</p>
        <table>
            <tr>
                <th width="5%">S/N</th>
                <th width="25%">REQUIREMENT</th>
                <th width="25%">OBJECTIVE EVIDENCE</th>
                <th width="15%">COMMENTS</th>
                <th width="10%">COMPLIANCE</th>
                <th width="10%">CORRECTIVE ACTION</th>
                <th width="10%">CLASSIFICATION</th>
            </tr>
            ${generateFindingsRows(auditData)}
        </table>

        <!-- Other Observations -->
        ${otherObservations ? `
        <h4>6. OTHER OBSERVATIONS</h4>
        <p>${escapeHtml(otherObservations)}</p>
        ` : ''}

        <!-- Signature Section -->
        <div class="signature-section">
            <div>
                <div>Prepared by:</div>
                <div class="signature-line"></div>
                <div>${formatAuditors(auditData.leadAuditors.concat(auditData.auditors))}</div>
                <div>Date: ${formatDate(new Date())}</div>
            </div>
            <div>
                <div>Reviewed by:</div>
                <div class="signature-line"></div>
                <div>_________________________________</div>
                <div>Date: _________________________</div>
            </div>
        </div>
    </body>
    </html>
    `;

    // Helper functions
    function generateScopeRows() {
        return `
            <tr><td>ISO 9001:2015</td><td>4.1</td><td>Interested parties’ identification with needs/expectations</td></tr>
            <tr><td>ISO 9001:2015</td><td>4.4</td><td>Process flow chart and interaction, SOP index</td></tr>
            <tr><td>ISO 9001:2015</td><td>5.2</td><td>Quality policy- training/awareness, records</td></tr>
            <tr><td>ISO 9001:2015</td><td>5.3</td><td>Appointment of Quality manager, JD for QM, Organizational chart</td></tr>
            <tr><td>ISO 9001:2015</td><td>6.1</td><td>Risk management SOP, Training/awareness, risk management report/plan, RMT constitution</td></tr>
            <tr><td>ISO 9001:2015</td><td>6.2</td><td>Quality Objectives- development and awareness, action plan for achieving the objectives</td></tr>
            <tr><td>ISO 9001:2015</td><td>6.3</td><td>SOP management of change – training records</td></tr>
            <tr><td>ISO 9001:2015</td><td>7.1.5</td><td>SOP monitoring and measurement of resources- training implementation of SOP, records</td></tr>
            <tr><td>ISO 9001:2015</td><td>7.1.6</td><td>SOP Organizational Knowledge- training, records, implementation</td></tr>
            <tr><td>ISO 9001:2015</td><td>7.2</td><td>Personnel JD’s, CV, Training Plan, Training records</td></tr>
            <tr><td>ISO 9001:2015</td><td>7.4</td><td>Communication matrix</td></tr>
            <tr><td>ISO 9001:2015</td><td>7.5</td><td>Process SOP’s, approvals, training and records of implementation of SOP</td></tr>
            <tr><td>ISO 9001:2015</td><td>8.2</td><td>Customer complaint, customer survey/feedback</td></tr>
            <tr><td>ISO 9001:2015</td><td>9.1</td><td>KPI</td></tr>
            <tr><td>ISO 9001:2015</td><td>9.1.2</td><td>Analysis of customer survey</td></tr>
            <tr><td>ISO 9001:2015</td><td>9.2</td><td>SOP Internal audit -plan, awareness, training records</td></tr>
            <tr><td>ISO 9001:2015</td><td>9.3</td><td>SOP management review – training, records, plan</td></tr>
        `;
    }

    function generateFindingsRows(auditData) {
        return (auditData.checklist || [])
            .filter(item => item.applicable === 'yes' && item.id !== 28)
            .map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${escapeHtml(item.requirement)}</td>
                    <td>${escapeHtml(item.objectiveEvidence || 'N/A')}</td>
                    <td>${escapeHtml(item.comments || 'N/A')}</td>
                    <td class="${item.compliance === 'yes' ? 'compliant' : 'non-compliant'}">
                        ${item.compliance === 'yes' ? 'Compliant' : 'Non-Compliant'}
                    </td>
                    <td>${item.correctiveActionNeeded ? 'Yes' : 'No'}</td>
                    <td>${escapeHtml(item.classification || 'N/A')}</td>
                </tr>
            `).join('');
    }

    function formatAuditors(auditors) {
        if (!auditors || auditors.length === 0) return 'Not specified';
        return auditors.map(a => a.displayName || a.email).join(', ');
    }

    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatDate(dateString) {
        if (!dateString) return 'Not specified';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (e) {
            return dateString;
        }
    }

    // Convert to Word doc and download
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    const fileName = `NAFDAC_IASR_${auditData.refNo || 'NoRef'}_${auditData.date || 'NoDate'}.doc`;
    a.download = fileName.replace(/[^a-zA-Z0-9_\-.]/g, '_');
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}


// Function to redirect to Teams channel
function redirectToTeamsChannel() {
    const teamsUrl = "https://teams.microsoft.com/l/channel/19%3acxtT91KHzwF9zsBj8vhezXXK8v-CiZJHE2v8HIjGVTE1%40thread.tacv2/AUDIT%20DRAFT?groupId=439a8fed-df14-44b9-9e4f-0a891f88c94c&tenantId=c9a3c7f2-9c4d-4d16-9756-d04bb4a060f5";
    window.open(teamsUrl, '_blank');
}

function clearAuditForm() {
    // Reset form fields
    if (auditForm) auditForm.reset();
    
    
    // Clear checklist items
    const checklistItems = checklistContainer?.querySelectorAll('.checklist-item');
    checklistItems?.forEach(item => {
        const content = item.querySelector('.checklist-content');
        if (content) {
            content.style.display = 'none';
            content.querySelectorAll('textarea').forEach(t => t.value = '');
            content.querySelectorAll('.compliance-btn').forEach(b => {
                b.classList.remove('active', 'compliance-yes', 'compliance-no');
            });
            const noRadio = content.querySelector(`input[type="radio"][value="no"]`);
            if (noRadio) noRadio.checked = true;
        }
        const notApplicableRadio = item.querySelector(`input[type="radio"][value="no"]`);
        if (notApplicableRadio) notApplicableRadio.checked = true;
    });
    
    // Clear multiselect displays
    document.querySelectorAll('.selected-names').forEach(el => {
        el.textContent = el.dataset.placeholder || 'Select';
        el.style.color = 'var(--text-muted)';
    });
    
    // Uncheck all multiselect options
    document.querySelectorAll('.dropdown-options input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    currentAudit = null;
}

function showPasswordChangeModal(e) {
    e.preventDefault();
    document.getElementById('password-change-modal').classList.remove('hidden');
}

async function handleLoginPagePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('login-current-password').value;
    const newPassword = document.getElementById('login-new-password').value;
    const confirmPassword = document.getElementById('login-confirm-password').value;
    const messageEl = document.getElementById('login-password-message');
    
    // Validate
    if (newPassword !== confirmPassword) {
        showPasswordMessage('New passwords do not match', 'error');
        return;
    }
    
    try {
        const user = auth.currentUser;
        if (!user) {
            // For users not logged in, we'll need their email
            const email = document.getElementById('login-email').value;
            if (!email) {
                showPasswordMessage('Please enter your email first', 'error');
                return;
            }
            
            // This will trigger password reset if not logged in
            await auth.sendPasswordResetEmail(email);
            showPasswordMessage('Password reset link sent to your email', 'success');
            return;
        }
        
        // For logged in users (if they opened login page while still logged in)
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword
        );
        
        await user.reauthenticateWithCredential(credential);
        await user.updatePassword(newPassword);
        
        showPasswordMessage('Password changed successfully!', 'success');
        document.getElementById('login-page-password-form').reset();
        setTimeout(() => {
            document.getElementById('password-change-modal').classList.add('hidden');
        }, 2000);
        
    } catch (error) {
        console.error('Password change error:', error);
        let message = 'Failed to change password';
        if (error.code === 'auth/wrong-password') message = 'Current password is incorrect';
        if (error.code === 'auth/weak-password') message = 'Password is too weak';
        if (error.code === 'auth/user-not-found') message = 'Email not registered';
        showPasswordMessage(message, 'error');
    }
}

function showPasswordMessage(message, type) {
    const messageEl = document.getElementById('login-password-message');
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    setTimeout(() => {
        if (messageEl.textContent === message) {
            messageEl.textContent = '';
            messageEl.className = 'message';
        }
    }, 5000);
}

async function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    if (!email) {
        showPasswordMessage('Please enter your email first', 'error');
        return;
    }
    
    try {
        await auth.sendPasswordResetEmail(email);
        showPasswordMessage('Password reset link sent to your email', 'success');
    } catch (error) {
        console.error('Password reset error:', error);
        showPasswordMessage('Failed to send reset email. Please check your email address.', 'error');
    }
}

// --- Run Initialization on Load ---
document.addEventListener('DOMContentLoaded', init);