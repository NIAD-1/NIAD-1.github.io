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
    export_data: [ROLES.ADMIN, ROLES.LEAD_AUDITOR, ROLES.AUDITOR]
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

// AUDIT STATUS //


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
let leadAuditorUsers = [];
let auditorUsers = [];
let auditComplianceChartInstance = null;

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

    // Settings event listener
    document.getElementById('change-password-form')?.addEventListener('submit', handleChangePassword);
}

// Handle Password change

async function handleChangePassword(event) {
    event.preventDefault(); // Prevent default form submission

    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const messageArea = document.getElementById('change-password-message');
    const changeButton = document.getElementById('change-password-btn');

    if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput || !messageArea || !changeButton) {
        console.error("Password change form elements not found.");
        return;
    }

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Reset message area
    messageArea.textContent = '';
    messageArea.className = 'message-area'; // Reset classes

    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        messageArea.textContent = 'Please fill in all fields.';
        messageArea.classList.add('error');
        return;
    }
    if (newPassword.length < 6) {
        messageArea.textContent = 'New password must be at least 6 characters long.';
        messageArea.classList.add('error');
        newPasswordInput.focus();
        return;
    }
    if (newPassword !== confirmPassword) {
        messageArea.textContent = 'New passwords do not match.';
        messageArea.classList.add('error');
        confirmPasswordInput.focus();
        return;
    }
    if (newPassword === currentPassword) {
        messageArea.textContent = 'New password cannot be the same as the current password.';
        messageArea.classList.add('error');
         newPasswordInput.focus();
        return;
    }

    // Disable button during processing
    changeButton.disabled = true;
    messageArea.textContent = 'Processing...';

    try {
        if (!currentUser || !currentUser.email) {
            throw new Error("User not properly logged in.");
        }

        // Re-authenticate the user - THIS IS CRUCIAL
        const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, currentPassword);
        await currentUser.reauthenticateWithCredential(credential);

        // If re-authentication is successful, update the password
        await currentUser.updatePassword(newPassword);

        messageArea.textContent = 'Password updated successfully!';
        messageArea.classList.add('success');
        // Clear the form fields
        currentPasswordInput.value = '';
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';

    } catch (error) {
        console.error("Password change error:", error);
        // Provide more specific error messages
        if (error.code === 'auth/wrong-password') {
            messageArea.textContent = 'Incorrect current password.';
            currentPasswordInput.focus();
        } else if (error.code === 'auth/too-many-requests') {
             messageArea.textContent = 'Too many attempts. Please try again later.';
        } else {
            messageArea.textContent = `Error: ${error.message}`;
        }
        messageArea.classList.add('error');
    } finally {
        // Re-enable the button
        changeButton.disabled = false;
    }
}

// --- Authentication & Role Management ---

function checkAuthState() {
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
                loadAudits();
                switchSection('dashboard');

            } else {
                 console.error(`Access Denied: User profile missing, or invalid role ('${userRoleData?.role}') assigned for UID: ${user.uid}.`);
                 alert("Your account is not configured correctly or lacks a valid role. Please contact an administrator.");
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
        if (el.tagName === 'BUTTON' || el.tagName === 'SELECT' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.disabled = !hasPerm; // Disable elements if no permission too
        }
    });
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
    if (currentUser.role === ROLES.ADMIN) return true;
    if (currentUser.role === ROLES.LEAD_AUDITOR && audit.status === 'draft') return true;
    if (currentUser.role === ROLES.AUDITOR && audit.createdBy === currentUser.uid && audit.status === 'draft') return true;
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
        case 'settings':
             // Reset form message when switching to settings
             const messageArea = document.getElementById('change-password-message');
             if(messageArea) {
                 messageArea.textContent = '';
                 messageArea.className = 'message-area';
             }
             const form = document.getElementById('change-password-form');
             form?.reset(); // Reset form fields
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

async function initNewAuditForm() {
    console.log("Initializing new audit form.");
    
    // Reset form elements
    auditForm?.reset();
    
    // Set default date
    if(auditDateInput) {
        auditDateInput.value = new Date().toISOString().split('T')[0];
    }

    // Initialize checklist container
    if(checklistContainer) {
        checklistContainer.innerHTML = '<p>Loading checklist...</p>';
    }

    currentAudit = null;

    // Clear existing checklist items
    if(checklistContainer) {
        checklistContainer.innerHTML = '';
    }

    // Create checklist items
    auditChecklist.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'checklist-item';
        itemDiv.dataset.itemId = item.id;
    
        const applicabilityName = `applicability-${item.id}`;
        const applicableId = `applicable-${item.id}`;
        const notApplicableId = `not-applicable-${item.id}`;
        const detailsContainerId = `details-container-${item.id}`;
        const evidenceId = `evidence-${item.id}`;
        const commentsId = `comments-${item.id}`;
        const complianceContainerId = `compliance-container-${item.id}`; // For compliance + correction + classification
        const correctiveActionName = `corrective-action-${item.id}`;
        const caYesId = `ca-yes-${item.id}`;
        const caNoId = `ca-no-${item.id}`;
        const classificationContainerId = `classification-container-${item.id}`;
        const classificationId = `classification-${item.id}`;
    
        itemDiv.innerHTML = `
            <h4>${item.id}. ${escapeHtml(item.requirement)} ${item.clause ? `(Clause ${item.clause})` : ''}</h4>
    
            <!-- 1. Applicability Radio Buttons -->
            <div class="form-group applicability-toggle">
                <label>Status:</label>
                <input type="radio" id="${applicableId}" name="${applicabilityName}" value="applicable" required>
                <label for="${applicableId}">Applicable / Reviewed</label>
                <input type="radio" id="${notApplicableId}" name="${applicabilityName}" value="not_applicable">
                <label for="${notApplicableId}">Not Applicable / Not Reviewed</label>
            </div>
    
            <!-- 2. Container for details (hidden initially) -->
            <div class="checklist-details-container hidden" id="${detailsContainerId}">
                <div class="form-group">
                    <label for="${evidenceId}">Objective Evidence:</label>
                    <textarea id="${evidenceId}" class="evidence-input" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label for="${commentsId}">Comments:</label>
                    <textarea id="${commentsId}" class="comments-input" rows="2"></textarea>
                </div>
    
                <!-- Container for Compliance, Correction, Classification -->
                <div id="${complianceContainerId}">
                    <div class="compliance-toggle">
                        <label>Compliance:</label>
                        <button type="button" class="compliance-btn" data-compliance="yes">Compliant</button>
                        <button type="button" class="compliance-btn" data-compliance="no">Non-Compliant</button>
                    </div>
    
                    <div class="corrective-action-group">
                        <div class="form-group corrective-action-toggle">
                            <label>Corrective Action Needed?</label>
                            <input type="radio" id="${caYesId}" name="${correctiveActionName}" value="yes">
                            <label for="${caYesId}">Yes</label>
                            <input type="radio" id="${caNoId}" name="${correctiveActionName}" value="no" checked>
                            <label for="${caNoId}">No</label>
                        </div>
                    </div>
    
                    <!-- Classification Dropdown (hidden initially) -->
                    <div class="form-group classification-container hidden" id="${classificationContainerId}">
                        <label for="${classificationId}">Classification:</label>
                        <select id="${classificationId}">
                            <option value="">Select Classification...</option>
                            <option value="Major">Major</option>
                            <option value="Minor">Minor</option>
                            <option value="OFI">OFI (Opportunity for Improvement)</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    
        checklistContainer.appendChild(itemDiv);
    
        // --- Event Listeners for the new structure ---
    
        const detailsContainer = itemDiv.querySelector(`#${detailsContainerId}`);
        const complianceBtns = itemDiv.querySelectorAll('.compliance-btn');
        const correctiveActionRadios = itemDiv.querySelectorAll(`input[name="${correctiveActionName}"]`);
        const classificationContainer = itemDiv.querySelector(`#${classificationContainerId}`);
    
        // Listener for Applicability changes
        itemDiv.querySelectorAll(`input[name="${applicabilityName}"]`).forEach(radio => {
            radio.addEventListener('change', (event) => {
                const showDetails = event.target.value === 'applicable';
                detailsContainer.classList.toggle('hidden', !showDetails);
                // Reset compliance state when switching applicability
                if (!showDetails) {
                    complianceBtns.forEach(b => b.classList.remove('active', 'compliance-yes', 'compliance-no'));
                    itemDiv.querySelector(`#${caNoId}`).checked = true; // Default correction to No
                    classificationContainer.classList.add('hidden'); // Hide classification
                    itemDiv.querySelector(`#${classificationId}`).value = ''; // Reset classification value
                }
                toggleClassificationVisibility(itemDiv); // Re-check classification visibility
            });
        });
    
        // Listener for Compliance buttons
        complianceBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Basic toggle logic
                const parentToggle = this.closest('.compliance-toggle');
                parentToggle.querySelectorAll('.compliance-btn').forEach(b => b.classList.remove('active', 'compliance-yes', 'compliance-no'));
                this.classList.add('active', this.dataset.compliance === 'yes' ? 'compliance-yes' : 'compliance-no');
                // Update classification visibility
                toggleClassificationVisibility(itemDiv);
            });
        });
    
        // Listener for Corrective Action radios
        correctiveActionRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                // Update classification visibility
                toggleClassificationVisibility(itemDiv);
            });
        });
    });
    
    // Helper function to manage classification visibility (place outside the loop, but within initNewAuditForm or globally)
    function toggleClassificationVisibility(itemDiv) {
        const classificationContainer = itemDiv.querySelector('.classification-container');
        if (!classificationContainer) return;
    
        const isApplicable = itemDiv.querySelector('input[name^="applicability-"][value="applicable"]')?.checked;
        const isNonCompliant = itemDiv.querySelector('.compliance-btn[data-compliance="no"].active');
        const isCorrectiveActionYes = itemDiv.querySelector('input[name^="corrective-action-"][value="yes"]')?.checked;
    
        // Show classification only if Applicable, NonCompliant, and CorrectiveAction=Yes
        const showClassification = isApplicable && isNonCompliant && isCorrectiveActionYes;
        classificationContainer.classList.toggle('hidden', !showClassification);
    
        // Reset classification if conditions are no longer met
        if (!showClassification) {
            const classificationSelect = classificationContainer.querySelector('select');
            if (classificationSelect) classificationSelect.value = '';
        }
    }
}
// Helper function to generate number options
function generateNumberOptions(start, end) {
    let options = '';
    for (let i = start; i <= end; i++) {
        options += `<option value="${i}">${i}</option>`;
    }
    return options;
}

// Data collection function (simplified)
function collectAuditFormData() {
    const auditDate = document.getElementById('audit-date').value;
    const refNo = document.getElementById('ref-no').value;
    const directorateUnit = document.getElementById('directorate-unit').value;
    
    // Get selected lead auditors and auditors
    const leadAuditors = Array.from(document.querySelectorAll('#lead-auditors-options input:checked'))
        .map(checkbox => checkbox.value);
    
    const auditors = Array.from(document.querySelectorAll('#auditors-options input:checked'))
        .map(checkbox => checkbox.value);
    
    const objectiveEvidence = document.querySelector('.evidence-input').value;
    
    // Get checklist data
    // --- START OF NEW CODE ---
    const checklistData = []; // Use a different name to avoid confusion temporarily
    const checklistItemElements = checklistContainer?.querySelectorAll('.checklist-item'); // Assuming checklistContainer is defined globally or passed in
    let isFormComplete = true; // Flag to check if all required fields are filled

    if (!checklistItemElements || checklistItemElements.length !== auditChecklist.length) {
        console.error("Checklist item mismatch or not found in DOM.");
        alert("Error processing checklist items. Please refresh and try again.");
        // Decide how to handle this - maybe return null or throw an error
        // For now, we'll proceed but the data might be incomplete
    }

    checklistItemElements.forEach((itemElement, index) => {
        const originalItem = auditChecklist[index]; // Get the corresponding definition
        const itemId = originalItem.id;
        itemElement.style.border = ''; // Reset any previous error highlighting

        // 1. Get Applicability Status
        const applicabilityRadio = itemElement.querySelector(`input[name="applicability-${itemId}"]:checked`);
        const applicability = applicabilityRadio ? applicabilityRadio.value : ''; // 'applicable' or 'not_applicable'

        if (!applicability) {
            isFormComplete = false;
            itemElement.style.border = '2px solid red'; // Highlight the whole item if applicability isn't selected
        }

        // Initialize variables for data points collected *only* if applicable
        let itemObjectiveEvidence = '';
        let itemComments = '';
        let itemCompliance = '';
        let itemCorrectiveActionNeeded = false;
        let itemClassification = '';

        // 2. Collect details ONLY if 'Applicable / Reviewed' is checked
        if (applicability === 'applicable') {
            const detailsContainer = itemElement.querySelector(`#details-container-${itemId}`);

            // Get Objective Evidence (item-specific)
            itemObjectiveEvidence = detailsContainer?.querySelector(`#evidence-${itemId}`)?.value.trim() || '';

            // Get Comments (item-specific)
            itemComments = detailsContainer?.querySelector(`#comments-${itemId}`)?.value.trim() || '';

            // Get Compliance Status
            const complianceBtn = detailsContainer?.querySelector('.compliance-btn.active');
            itemCompliance = complianceBtn ? complianceBtn.dataset.compliance : ''; // 'yes' or 'no' or ''
            if (!itemCompliance) { // Compliance MUST be selected if the item is applicable
                isFormComplete = false;
                detailsContainer?.querySelector('.compliance-toggle')?.style.setProperty('border', '2px solid red', 'important');
            } else {
                detailsContainer?.querySelector('.compliance-toggle')?.style.removeProperty('border');
            }

            // Get Corrective Action Needed Status
            itemCorrectiveActionNeeded = detailsContainer?.querySelector(`input[name="corrective-action-${itemId}"][value="yes"]`)?.checked || false;

            // Get Classification ONLY if Non-Compliant AND Corrective Action is needed
            const classificationSelect = detailsContainer?.querySelector(`#classification-${itemId}`);
            if (itemCompliance === 'no' && itemCorrectiveActionNeeded) {
                itemClassification = classificationSelect?.value || '';
                if (!itemClassification) { // Classification MUST be selected in this specific case
                    isFormComplete = false;
                    classificationSelect?.style.setProperty('border', '2px solid red', 'important');
                } else {
                    classificationSelect?.style.removeProperty('border');
                }
            } else {
                // Reset classification value and border if conditions aren't met
                itemClassification = '';
                if (classificationSelect) {
                    classificationSelect.value = ''; // Clear the selection visually
                    classificationSelect.style.removeProperty('border');
                }
            }
        } else {
            // If not applicable, ensure detail fields are cleared and borders removed
            itemElement.querySelector('.compliance-toggle')?.style.removeProperty('border');
            itemElement.querySelector(`#classification-${itemId}`)?.style.removeProperty('border');
            // Values are already defaulted to empty/false
        }

        // 3. Add the collected data for this item to the array
        checklistData.push({
            id: itemId,
            requirement: originalItem.requirement,
            clause: originalItem.clause,
            applicability: applicability,              // NEW: Added
            objectiveEvidence: itemObjectiveEvidence,  // RENAMED/REPURPOSED: Now item-specific
            comments: itemComments,                    // RENAMED/REPURPOSED: Now item-specific
            compliance: itemCompliance,                // Logically same, but collected conditionally
            correctiveActionNeeded: itemCorrectiveActionNeeded, // Logically same, but collected conditionally
            // correctiveActionsCount: --- REMOVED ---
            classification: itemClassification         // NEW: Added
        });
    });
}

function populateAuditSelector() {
    const selectElement = document.getElementById('dashboard-audit-select');
    if (!selectElement) return;

    selectElement.innerHTML = '<option value="">-- Select Audit --</option>'; // Reset

    // Filter for submitted audits and sort by date descending
    const submittedAudits = audits
        .filter(a => a.status === 'submitted' && a.date) // Ensure date exists
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort newest first

    if (submittedAudits.length === 0) {
        selectElement.disabled = true;
        return;
    }

    selectElement.disabled = false;
    submittedAudits.forEach(audit => {
        const option = document.createElement('option');
        option.value = audit.id;
        option.textContent = `${escapeHtml(audit.directorateUnit || 'N/A')} (${formatDate(audit.date)})`;
        selectElement.appendChild(option);
    });

     // Remove previous listener if exists to prevent duplicates
    selectElement.removeEventListener('change', handleAuditSelectionChange);
    // Add event listener
    selectElement.addEventListener('change', handleAuditSelectionChange);
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

    if (!auditDate) { alert('Select Audit Date.'); auditDateInput?.focus(); return null; }
    if (!directorateUnit) { alert('Enter Directorate / Unit.'); directorateUnitInput?.focus(); return null; }
    if (leadAuditorsSelect?.selectedOptions.length === 0) { alert('Select Lead Auditor(s).'); leadAuditorsSelect?.focus(); return null; }
    if (auditorsSelect?.selectedOptions.length === 0) { alert('Select Auditor(s).'); auditorsSelect?.focus(); return null; }

// Get selected lead auditors and auditors from custom multiselects
    const selectedLeadAuditors = Array.from(document.querySelectorAll('#lead-auditors-options input:checked'))
        .map(checkbox => checkbox.value);

    const selectedAuditors = Array.from(document.querySelectorAll('#auditors-options input:checked'))
        .map(checkbox => checkbox.value); 

    
    if (selectedLeadAuditors.length === 0) { alert('Select Lead Auditor(s).'); /* Optionally focus the dropdown header */ return null; }
    if (selectedAuditors.length === 0) { alert('Select Auditor(s).'); /* Optionally focus the dropdown header */ return null; }
    
    const checklistData = [];
    const checklistItemElements = checklistContainer?.querySelectorAll('.checklist-item');
    let isComplete = true;

    if (!checklistItemElements || checklistItemElements.length !== auditChecklist.length) {
        console.error("Checklist item mismatch or not found.");
        alert("Error processing checklist. Please refresh and try again.");
        return null; // Critical error
    }

    checklistItemElements.forEach((itemElement, index) => {
        const originalItem = auditChecklist[index];
        const itemId = originalItem.id;
        itemElement.style.border = ''; // Reset error indicator

        const complianceBtn = itemElement.querySelector('.compliance-btn.active');
        const compliance = complianceBtn ? complianceBtn.dataset.compliance : '';
        if (!compliance) isComplete = false;

        const evidence = itemElement.querySelector('.evidence-input')?.value.trim() || '';
        const correctiveActionYes = itemElement.querySelector(`input[name="corrective-action-${itemId}"][value="yes"]`)?.checked || false;
        let correctiveActionsCount = null;
        if (correctiveActionYes) {
            const howManySelect = itemElement.querySelector(`#how-many-needed-${itemId}`);
            correctiveActionsCount = howManySelect ? parseInt(howManySelect.value, 10) : null;
            // A count is implicitly required if Yes is selected for full completion
            if (!correctiveActionsCount || isNaN(correctiveActionsCount)) { // Also check if parsing failed
                 isComplete = false;
                 // Ensure the select element itself exists before trying to style it
                 if (howManySelect) {
                    howManySelect.style.border = '2px solid red'; // Highlight the count dropdown
                 }
            } else {
                 // Reset border if valid count is selected
                 if (howManySelect) {
                    howManySelect.style.border = '';
                 }
            }
        }
        const comments = itemElement.querySelector(`#comments-${itemId}`)?.value.trim() || '';

        // Highlight the whole item if compliance is missing or count is missing when needed
        if (!compliance || (correctiveActionYes && !correctiveActionsCount)) {
            itemElement.style.border = '2px solid red'; // Highlight incomplete item
        }


        checklistData.push({
            id: itemId, requirement: originalItem.requirement, clause: originalItem.clause,
            compliance, objectiveEvidence: evidence, correctiveActionNeeded: correctiveActionYes,
            correctiveActionsCount, comments
        });
    });

     const baseData = {
        date: auditDate, directorateUnit, refNo, leadAuditors: selectedLeadAuditors, auditors: selectedAuditors,
        checklist: checklistData, lastModified: firebase.firestore.FieldValue.serverTimestamp()
    };
     if (!currentAudit) {
         if (!currentUser) { console.error("No currentUser."); alert("Error: User session lost."); return null; }
        baseData.createdBy = currentUser.uid;
        baseData.createdByEmail = currentUser.email;
        baseData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
     }

    return { data: baseData, isComplete };
}

async function saveAuditAsDraft() {
    const auditData = collectAuditFormData();
    auditData.status = 'draft';
    await saveAuditToFirestore(auditData);
    loadAudits(); // Refresh the audit history
}

async function submitAudit() {
    const auditData = collectAuditFormData();
    auditData.status = 'submitted';
    auditData.submittedAt = firebase.firestore.FieldValue.serverTimestamp();
    await saveAuditToFirestore(auditData);
    loadAudits(); // Refresh the audit history
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
        audits = [];
        renderAuditHistory();
        renderDashboard(); // This will now handle the empty state correctly
        return;
    }
    db.collection('audits').orderBy('createdAt', 'desc').get()
        .then(querySnapshot => {
            audits = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log(`Loaded ${audits.length} audits.`);

            // Call rendering functions AFTER data is loaded
            if (isSectionVisible('dashboard')) renderDashboard(); // Calls populateAuditSelector inside
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
             renderDashboard(); // Render dashboard even on error to show empty state
        });
}

// --- Dashboard Rendering ---

function renderDashboard() {
    console.log("Rendering dashboard");
    if (!isSectionVisible('dashboard') || !hasPermission('view_dashboard')) return;

    // 1. Populate Audit Selection Dropdown
    populateAuditSelector(); // New function call

    // 2. Render Recent Audits (unchanged)
    renderRecentAudits();

    // 3. Render Non-Conformance Chart (unchanged)
    renderNonConformanceChart();

    // 4. Clear the specific audit chart initially
    const placeholder = document.getElementById('audit-compliance-placeholder');
    const chartCanvas = document.getElementById('audit-compliance-chart');
    if (auditComplianceChartInstance) auditComplianceChartInstance.destroy();
    if (placeholder) placeholder.style.display = 'block'; // Show placeholder
    if (chartCanvas) chartCanvas.style.display = 'none'; // Hide canvas

    // 5. Update UI based on role (unchanged)
    updateUIForRole();
}

function renderComplianceChart() {
     if (!complianceChartCanvas) return;
    const ctx = complianceChartCanvas.getContext('2d');
    if (complianceChartInstance) complianceChartInstance.destroy();
    let totalItems = 0, compliantItems = 0;
    audits.forEach(audit => {
        if (audit.checklist) {
             totalItems += audit.checklist.length;
             compliantItems += audit.checklist.filter(item => item.compliance === 'yes').length;
        }
    });
    const complianceRate = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 0;
    complianceChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['Compliant', 'Non-Compliant'], datasets: [{ data: [complianceRate, 100 - complianceRate], backgroundColor: ['#2a9d8f', '#e76f51'], borderWidth: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: c => `${c.label}: ${c.raw}%` } } } }
    });
}

function renderRecentAudits() {
     if (!recentAuditsList) return;
     recentAuditsList.innerHTML = '';
    const recent = audits.slice(0, 5);
    if (recent.length === 0) { recentAuditsList.innerHTML = '<p>No recent audits.</p>'; return; }
     recent.forEach(audit => {
        const itemDiv = document.createElement('div'); itemDiv.className = 'audit-item'; itemDiv.dataset.auditId = audit.id;
        const createdBy = audit.createdByEmail ? `by ${escapeHtml(audit.createdByEmail)}` : '';
        itemDiv.innerHTML = `<div class="details"><strong>${escapeHtml(audit.directorateUnit || audit.auditedArea) || 'N/A'}</strong><div class="date">${formatDate(audit.date)} ${createdBy}</div></div><span class="status status-${audit.status}">${escapeHtml(audit.status)}</span>`;
        itemDiv.addEventListener('click', () => openAuditDetails(audit));
        recentAuditsList.appendChild(itemDiv);
    });
}

function renderNonConformanceChart() {
    if (!ncChartCanvas) return;
    const ctx = ncChartCanvas.getContext('2d');
     if (ncChartInstance) ncChartInstance.destroy();
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

function renderAuditHistory(auditsToDisplay = audits) { // Allow passing filtered list
     // console.log("Rendering audit history list.");
     if (!auditHistoryList) return;
     auditHistoryList.innerHTML = '';

    if (auditsToDisplay.length === 0) {
        auditHistoryList.innerHTML = '<p>No audits found matching criteria.</p>';
        return;
    }
     auditsToDisplay.forEach(audit => {
        const itemDiv = document.createElement('div'); itemDiv.className = 'audit-item'; itemDiv.dataset.auditId = audit.id;
        const createdBy = audit.createdByEmail ? `by ${escapeHtml(audit.createdByEmail)}` : '';
        const submitted = audit.submittedAt ? `• Submitted: ${formatDateTime(audit.submittedAt)}` : '';
        itemDiv.innerHTML = `<div class="details"><strong>${escapeHtml(audit.directorateUnit || audit.auditedArea) || 'N/A'}</strong><div class="date">${formatDate(audit.date)} ${submitted} ${createdBy}</div><div class="date">Modified: ${formatDateTime(audit.lastModified)}</div></div><span class="status status-${audit.status}">${escapeHtml(audit.status)}</span>`;
        itemDiv.addEventListener('click', () => openAuditDetails(audit));
        auditHistoryList.appendChild(itemDiv);
    });
     if (auditsToDisplay === audits) { // Only update filter if showing full list
         updateAreaFilter();
     }
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
    if (!modal || !modalTitle || !modalBody || !audit) {
        console.error("Modal elements or audit data missing for opening details.");
        return; // Exit if essential elements/data are missing
    }

    currentAudit = audit; // Store the currently viewed audit globally
    // Set the modal title using the directorate/unit and formatted date
    modalTitle.textContent = `Audit: ${escapeHtml(audit.directorateUnit || 'N/A')} (${formatDate(audit.date || null)})`;

    // Format auditor lists for display
    const leadAuditorsText = Array.isArray(audit.leadAuditors) && audit.leadAuditors.length > 0
                             ? audit.leadAuditors.map(name => escapeHtml(name)).join(', ')
                             : 'None Assigned';
    const auditorsText = Array.isArray(audit.auditors) && audit.auditors.length > 0
                         ? audit.auditors.map(name => escapeHtml(name)).join(', ')
                         : 'None Assigned';

    // --- Start Building Modal Body Content ---
    let bodyContent = `
        <div class="audit-meta">
            <p><strong>Ref No:</strong> ${escapeHtml(audit.refNo || 'N/A')}</p>
            <p><strong>Audit Date:</strong> ${formatDate(audit.date || null)}</p>
            <p><strong>Directorate / Unit:</strong> ${escapeHtml(audit.directorateUnit || 'N/A')}</p>
            <p><strong>Lead Auditor(s):</strong> ${leadAuditorsText}</p>
            <p><strong>Auditor(s):</strong> ${auditorsText}</p>
            <p><strong>Status:</strong> <span class="status status-${audit.status || 'unknown'}">${escapeHtml(audit.status || 'Unknown')}</span></p>
            ${audit.createdAt ? `<p><small>Created: ${formatDateTime(audit.createdAt)} by ${escapeHtml(audit.createdByEmail || 'Unknown User')}</small></p>` : ''}
            ${audit.lastModified ? `<p><small>Last Modified: ${formatDateTime(audit.lastModified)}</small></p>` : ''}
            ${audit.submittedAt ? `<p><small>Submitted: ${formatDateTime(audit.submittedAt)}</small></p>` : ''}
        </div>

        <!-- Display the Top-Level Objective Evidence Summary -->
        <div class="evidence-summary">
            <h3>Overall Objective Evidence / Assessment Findings</h3>
            <div class="evidence-content">
                ${audit.objectiveEvidence ? `<pre>${escapeHtml(audit.objectiveEvidence)}</pre>` : '<p>No overall objective evidence provided.</p>'}
            </div>
        </div>

        <!-- Display Checklist Findings -->
        <h3>Checklist Findings</h3>
        <div class="checklist-summary">`;

    // --- Process and Display Each Checklist Item (THIS IS THE MODIFIED PART) ---
    if (audit.checklist && Array.isArray(audit.checklist) && audit.checklist.length > 0) {
        audit.checklist.forEach(item => {
            // Start item container
            bodyContent += `<div class="checklist-item-summary">
                                <h4>${item.id}. ${escapeHtml(item.requirement)} ${item.clause ? `(Clause ${escapeHtml(item.clause)})` : ''}</h4>`;

            // 1. Display Applicability Status
            const applicabilityText = item.applicability === 'applicable' ? 'Applicable / Reviewed' :
                                      item.applicability === 'not_applicable' ? 'Not Applicable / Not Reviewed' :
                                      'Status Not Set'; // Fallback text
            bodyContent += `<p><strong>Status:</strong> ${escapeHtml(applicabilityText)}</p>`;

            // 2. Conditionally display details ONLY if applicable
            if (item.applicability === 'applicable') {
                // Display Item-Level Objective Evidence
                if (item.objectiveEvidence) {
                    bodyContent += `<p><strong>Evidence:</strong><br><pre>${escapeHtml(item.objectiveEvidence)}</pre></p>`;
                } else {
                     bodyContent += `<p><strong>Evidence:</strong> <span class="text-muted"><em>None provided for this item.</em></span></p>`;
                }

                // Display Item-Level Comments
                if (item.comments) {
                    bodyContent += `<p><strong>Comments:</strong><br><pre>${escapeHtml(item.comments)}</pre></p>`;
                } else {
                     bodyContent += `<p><strong>Comments:</strong> <span class="text-muted"><em>None provided for this item.</em></span></p>`;
                }

                // Display Compliance Status
                const compClass = item.compliance === 'yes' ? 'compliant' :
                                  item.compliance === 'no' ? 'non-compliant' : '';
                const compText = item.compliance === 'yes' ? 'Compliant' :
                                 item.compliance === 'no' ? 'Non-Compliant' :
                                 'Compliance Not Selected'; // Fallback text
                bodyContent += `<p><strong>Compliance:</strong> <span class="${compClass}">${escapeHtml(compText)}</span></p>`;

                // Display Corrective Action Needed
                const caText = item.correctiveActionNeeded === true ? 'Yes' :
                               item.correctiveActionNeeded === false ? 'No' :
                               'Not Set'; // Fallback text
                bodyContent += `<p><strong>Correction Needed:</strong> ${escapeHtml(caText)}</p>`;

                // 3. Conditionally display Classification (Only if NC and CA needed)
                if (item.compliance === 'no' && item.correctiveActionNeeded === true) {
                    const classificationText = item.classification || 'Not Set'; // Use 'Not Set' if empty/null
                    bodyContent += `<p><strong>Classification:</strong> ${escapeHtml(classificationText)}</p>`;
                }
            }
             // If not applicable, no further details are shown for this item.

            // Close item container
            bodyContent += `</div>`;
        });
    } else {
        // Message if no checklist data exists for the audit
        bodyContent += '<p>No checklist data available for this audit.</p>';
    }

    // --- Finish Modal Body Content ---
    bodyContent += `</div>`; // Close checklist-summary div

    // Set the generated HTML to the modal body
    modalBody.innerHTML = bodyContent;

    // Update button visibility based on permissions and audit status
    updateModalEditButtonVisibility(); // Ensure this function checks if the user can edit *this specific* audit

    // Display the modal
    modal.classList.remove('hidden');
}

function closeModal() {
     if (!modal) return;
    modal.classList.add('hidden');
    currentAudit = null;
    // console.log("Modal closed.");
}

async function editAudit() { // Made async
    if (!currentAudit) { console.error("No audit selected."); return; }
    if (!canEditAudit(currentAudit)) { alert("Permission Denied."); return; }

    await initNewAuditForm(); // Wait for form init (includes user fetch)

    const auditToEdit = audits.find(a => a.id === currentAudit.id);
     if (!auditToEdit) { alert("Error loading audit data."); switchSection('audit-history'); return; }
    currentAudit = { ...auditToEdit }; // Restore context

    console.log(`Loading audit ${currentAudit.id} for editing.`);
    if(directorateUnitInput) directorateUnitInput.value = currentAudit.directorateUnit || currentAudit.auditedArea || '';
    if(refNoInput) refNoInput.value = currentAudit.refNo || '';
    if(auditDateInput) auditDateInput.value = currentAudit.date || '';

    setSelectedOptions(leadAuditorsSelect, currentAudit.leadAuditors || []);
    setSelectedOptions(auditorsSelect, currentAudit.auditors || []);

    // Inside editAudit function, update the checklist population part:

    const checklistElements = checklistContainer?.querySelectorAll('.checklist-item');
    if (currentAudit.checklist && checklistElements?.length === currentAudit.checklist.length) {
        checklistElements.forEach((itemElement, index) => {
            const itemData = currentAudit.checklist[index]; if (!itemData) return;
            const itemId = itemData.id;
            const detailsContainer = itemElement.querySelector(`#details-container-${itemId}`);

            // 1. Set Applicability Radio
            const applicableRadio = itemElement.querySelector(`#applicable-${itemId}`);
            const notApplicableRadio = itemElement.querySelector(`#not-applicable-${itemId}`);
            if (itemData.applicability === 'applicable') {
                if (applicableRadio) applicableRadio.checked = true;
                detailsContainer?.classList.remove('hidden'); // Show details
            } else if (itemData.applicability === 'not_applicable') {
                if (notApplicableRadio) notApplicableRadio.checked = true;
                detailsContainer?.classList.add('hidden'); // Hide details
            } else {
                if(applicableRadio) applicableRadio.checked = false;
                if(notApplicableRadio) notApplicableRadio.checked = false;
                detailsContainer?.classList.add('hidden'); // Hide details if unset
            }


            // 2. Populate details IF applicable
            if (itemData.applicability === 'applicable') {
                // Set Evidence
                const evidenceEl = itemElement.querySelector(`#evidence-${itemId}`);
                if (evidenceEl) evidenceEl.value = itemData.objectiveEvidence || '';

                // Set Comments
                const commentsEl = itemElement.querySelector(`#comments-${itemId}`);
                if (commentsEl) commentsEl.value = itemData.comments || '';

                // Set Compliance Button
                itemElement.querySelectorAll('.compliance-btn').forEach(btn => {
                    btn.classList.remove('active', 'compliance-yes', 'compliance-no');
                    if (btn.dataset.compliance === itemData.compliance) {
                        btn.classList.add('active', itemData.compliance === 'yes' ? 'compliance-yes' : 'compliance-no');
                    }
                });

                // Set Correction Needed Radio
                const caYesRadio = itemElement.querySelector(`#ca-yes-${itemId}`);
                const caNoRadio = itemElement.querySelector(`#ca-no-${itemId}`);
                if (itemData.correctiveActionNeeded) {
                    if (caYesRadio) caYesRadio.checked = true;
                } else {
                    if (caNoRadio) caNoRadio.checked = true;
                }

                // Set Classification (and visibility)
                const classificationSelect = itemElement.querySelector(`#classification-${itemId}`);
                const classificationContainer = itemElement.querySelector(`#classification-container-${itemId}`);

                // Ensure visibility is correct based on loaded data BEFORE setting value
                toggleClassificationVisibility(itemElement); // Use the helper

                if (classificationSelect && itemData.classification) {
                    // Set the value only if classification is supposed to be visible
                    if (itemData.compliance === 'no' && itemData.correctiveActionNeeded) {
                        classificationSelect.value = itemData.classification;
                    } else {
                        classificationSelect.value = ''; // Clear if not applicable
                    }
                } else if (classificationSelect) {
                    classificationSelect.value = ''; // Clear if no data
                }
            }
        });
    } else console.warn("Checklist mismatch or missing on edit load for audit:", currentAudit.id);


    closeModal();
    switchSection('new-audit');
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


function generateReport() {
    if (!hasPermission('generate_reports')) { alert("Permission Denied."); return; }
     const reportType = document.getElementById('report-type').value;
     const period = document.getElementById('report-period').value;
     if (reportChartInstance) reportChartInstance.destroy();
     if(reportTableContainer) reportTableContainer.innerHTML = '<p>Generating report...</p>';
     if(reportChartContainer) reportChartContainer.style.display = 'none';

     let fromDate, toDate; const today = new Date();
     if (period === 'custom') {
         fromDate = document.getElementById('report-from').value;
         toDate = document.getElementById('report-to').value;
         if (!fromDate || !toDate) {
             alert("Select custom date range.");
             if(reportTableContainer) reportTableContainer.innerHTML = '<p class="error-message">Custom date range incomplete.</p>'; // Use error class
             return;
         }
     } else {
         const toDateObj = new Date(today); toDate = toDateObj.toISOString().split('T')[0];
         const fromDateObj = new Date(today);
         if (period === 'last-month') fromDateObj.setMonth(fromDateObj.getMonth() - 1);
         else if (period === 'last-quarter') fromDateObj.setMonth(fromDateObj.getMonth() - 3);
         else if (period === 'last-year') fromDateObj.setFullYear(fromDateObj.getFullYear() - 1);
         fromDate = fromDateObj.toISOString().split('T')[0];
     }
     console.log(`Generating report: ${reportType} from ${fromDate} to ${toDate}`);
     const reportAudits = audits.filter(a => a.date >= fromDate && a.date <= toDate && a.status === 'submitted');
     if (reportAudits.length === 0) {
         if(reportTableContainer) reportTableContainer.innerHTML = '<p>No submitted audits found for period.</p>';
         return;
      }
     console.log(`Using ${reportAudits.length} audits.`);

     try {
         if(reportChartContainer) reportChartContainer.style.display = 'block';
         if (reportType === 'compliance') generateComplianceReport(reportAudits, fromDate, toDate);
         else if (reportType === 'non-conformance') generateNonConformanceReport(reportAudits, fromDate, toDate);
         else if (reportType === 'trend') generateTrendReport(reportAudits, fromDate, toDate);
         else throw new Error(`Unknown type: ${reportType}`);
     } catch (e) {
         console.error("Report gen error:", e);
         if(reportTableContainer) reportTableContainer.innerHTML = `<p class="error-message">Error: ${e.message}</p>`; // Use error class
         if(reportChartContainer) reportChartContainer.style.display = 'none';
        }
}

function generateComplianceReport(reportAudits, from, to) {
    console.log("Generating Compliance Report");
    if (!reportChartCanvas || !reportTableContainer) return;
    const ctx = reportChartCanvas.getContext('2d');
    const compByArea = {}; let totalAudits = 0;
    reportAudits.forEach(a => {
        const area = a.directorateUnit || a.auditedArea;
        if (a.checklist?.length > 0 && area) {
             totalAudits++; const total = a.checklist.length;
             const compliant = a.checklist.filter(i => i.compliance === 'yes').length;
             const rate = Math.round((compliant / total) * 100);
             if (compByArea[area]) { compByArea[area].totalRate += rate; compByArea[area].count++; }
             else { compByArea[area] = { totalRate: rate, count: 1 }; }
        }
    });
    const areas = Object.keys(compByArea).sort();
    if (areas.length === 0) { reportTableContainer.innerHTML = '<p>No compliance data.</p>'; if(reportChartContainer) reportChartContainer.style.display = 'none'; return; }
    const avgRates = areas.map(a => Math.round(compByArea[a].totalRate / compByArea[a].count));
    if (reportChartInstance) reportChartInstance.destroy(); // Destroy previous before creating new
    reportChartInstance = new Chart(ctx, { type: 'bar', data: { labels: areas, datasets: [{ label: 'Avg Compliance (%)', data: avgRates, backgroundColor: avgRates.map(getComplianceColor) }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100, title: { display: true, text: 'Avg Rate (%)' } } } } });
    let table = `<h3>Compliance (${formatDate(from)} to ${formatDate(to)}) - ${totalAudits} Audits</h3><table class="report-table"><thead><tr><th>Area</th><th>Avg Rate</th><th>Status</th></tr></thead><tbody>`;
    areas.forEach((a, i) => { const r = avgRates[i]; const { statusClass, statusText } = getComplianceStatus(r); table += `<tr><td>${escapeHtml(a)}</td><td>${r}%</td><td class="${statusClass}">${statusText}</td></tr>`; });
    table += `</tbody></table>`; reportTableContainer.innerHTML = table;
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

function handleAuditSelectionChange(event) {
    const selectedAuditId = event.target.value;
    const placeholder = document.getElementById('audit-compliance-placeholder');
    const chartCanvas = document.getElementById('audit-compliance-chart');

    if (auditComplianceChartInstance) {
        auditComplianceChartInstance.destroy(); // Clear previous chart
        auditComplianceChartInstance = null;
    }

    if (!selectedAuditId) {
        if (placeholder) placeholder.style.display = 'block';
        if (chartCanvas) chartCanvas.style.display = 'none';
        return; // No audit selected
    }

    const selectedAudit = audits.find(a => a.id === selectedAuditId);
    if (selectedAudit) {
        if (placeholder) placeholder.style.display = 'none'; // Hide placeholder
        if (chartCanvas) chartCanvas.style.display = 'block'; // Show canvas
        renderSpecificAuditComplianceChart(selectedAudit);
    } else {
        console.error("Selected audit not found:", selectedAuditId);
         if (placeholder) {
             placeholder.textContent = "Error loading audit data.";
             placeholder.style.display = 'block';
         }
        if (chartCanvas) chartCanvas.style.display = 'none';
    }
}


// --- NEW: Render Specific Audit Chart ---
function renderSpecificAuditComplianceChart(audit) {
    const chartCanvas = document.getElementById('audit-compliance-chart');
    if (!chartCanvas || !audit || !audit.checklist) {
         console.warn("Cannot render compliance chart. Missing canvas, audit, or checklist data for:", audit?.id);
         // Optionally display a message on the canvas area
         return;
     }

    const ctx = chartCanvas.getContext('2d');
    if (auditComplianceChartInstance) auditComplianceChartInstance.destroy(); // Destroy previous

    // Filter checklist items that were applicable
    const applicableItems = audit.checklist.filter(item => item.applicability === 'applicable');
    const totalApplicable = applicableItems.length;
    const compliantApplicable = applicableItems.filter(item => item.compliance === 'yes').length;

    let complianceRate = 0;
    if (totalApplicable > 0) {
        complianceRate = Math.round((compliantApplicable / totalApplicable) * 100);
    } else {
        console.log(`No applicable checklist items found for audit ${audit.id} to calculate compliance.`);
         // Optionally, display "No Applicable Items" message on chart area
    }

    auditComplianceChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Compliant', 'Non-Compliant'],
            datasets: [{
                data: [complianceRate, 100 - complianceRate],
                backgroundColor: [
                    getComplianceColor(complianceRate), // Color based on rate
                     '#e76f51' // Standard color for non-compliant part
                ],
                borderColor: '#ffffff', // White border between segments
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                // Show rate for compliant, or calculated rate for non-compliant
                                const rate = context.label === 'Compliant' ? context.parsed : (100 - context.parsed);
                                // Check if rate is the calculated one or the remainder
                                const displayRate = context.dataset.data[context.dataIndex];
                                label += displayRate + '%';
                            }
                            return label;
                        }
                    }
                },
                 title: { // Add a title to the chart
                     display: true,
                     text: `Compliance Rate (${totalApplicable} Applicable Items)`
                 }
            }
        }
    });
}

// --- Run Initialization on Load ---
document.addEventListener('DOMContentLoaded', init);