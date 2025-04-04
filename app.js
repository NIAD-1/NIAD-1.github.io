// --- Firebase Configuration ---
// IMPORTANT: Replace with your actual Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyCLp8nKO2rb7yMyaL0mM6sJOzoFRmm0BdI",
    authDomain: "internalaudit-2cd8c.firebaseapp.com",
    projectId: "internalaudit-2cd8c",
    storageBucket: "internalaudit-2cd8c.firebasestorage.app",
    messagingSenderId: "510488169711",
    appId: "1:510488169711:web:271ed61bd7c4e6c14c5f1a",
    measurementId: "G-43ESSX8GLJ"
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
const userEmail = document.getElementById('user-email');
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
const auditedAreaInput = document.getElementById('audited-area');
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
            // Check general permission before allowing navigation
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
    quickExportBtn?.addEventListener('click', exportDashboardData); // Permission checked inside function

    // New audit form events
    saveDraftBtn?.addEventListener('click', saveAuditAsDraft); // Permission checked inside function
    submitAuditBtn?.addEventListener('click', submitAudit); // Permission checked inside function

    // Audit history events
    document.getElementById('filter-btn')?.addEventListener('click', filterAudits); // Assumes view permission checked by section visibility

    // Reports events
    document.getElementById('generate-report-btn')?.addEventListener('click', generateReport); // Permission checked inside function
    document.getElementById('export-csv-btn')?.addEventListener('click', exportReportToCSV); // Permission checked inside function
    document.getElementById('report-period')?.addEventListener('change', toggleCustomDateRange);

    // Modal events
    closeModalButton?.addEventListener('click', closeModal);
    closeModalBtnFooter?.addEventListener('click', closeModal);
    exportAuditBtn?.addEventListener('click', exportCurrentAudit); // Permission checked inside function
    editAuditBtn?.addEventListener('click', editAudit); // Permission checked inside function
}

// --- Authentication & Role Management ---

// Check auth state and fetch user role
function checkAuthState() {
    auth.onAuthStateChanged(async user => {
        if (user) {
            console.log("User logged in:", user.uid, user.email);
            const userRoleData = await getUserRole(user.uid);

            // Validate fetched role against defined roles
            if (userRoleData && userRoleData.role && Object.values(ROLES).includes(userRoleData.role)) {
                currentUser = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || userRoleData.displayName || user.email.split('@')[0], // Fallback display name
                    role: userRoleData.role
                };
                console.log("Current User with Role:", currentUser);

                if(userEmail) userEmail.textContent = currentUser.displayName; // Display name/email in header
                loginScreen?.classList.add('hidden');
                appContainer?.classList.remove('hidden');

                updateUIForRole(); // Update UI based on role IMMEDIATELY
                loadAudits(); // Load audits (Firestore rules enforce read access)
                switchSection('dashboard'); // Default section after login

            } else {
                 console.error(`Access Denied: User profile missing, or invalid role ('${userRoleData?.role}') assigned for UID: ${user.uid}.`);
                 alert("Your account is not configured correctly or lacks a valid role. Please contact an administrator.");
                 logout(); // Log them out forcefully
            }

        } else { // User is logged out
            currentUser = null;
            audits = []; // Clear data
            currentAudit = null;
            loginScreen?.classList.remove('hidden');
            appContainer?.classList.add('hidden');
            console.log("User logged out");
            // Clear any potentially sensitive UI elements just in case
             if(userEmail) userEmail.textContent = '';
             if(auditHistoryList) auditHistoryList.innerHTML = '';
             if(recentAuditsList) recentAuditsList.innerHTML = '';
             // Add others if necessary
        }
    });
}

// Fetch user role data from Firestore
async function getUserRole(userId) {
    if (!userId) return null;
    try {
        const userDocRef = db.collection('users').doc(userId);
        const docSnap = await userDocRef.get();

        if (docSnap.exists) {
            console.log(`User role data fetched for ${userId}:`, docSnap.data());
            return docSnap.data(); // Return the whole data object
        } else {
            console.warn(`No user document found for UID: ${userId}`);
            return null; // Indicate user profile doesn't exist
        }
    } catch (error) {
        console.error("Error getting user role:", error);
        alert(`Error fetching user profile: ${error.message}`);
        return null; // Return null on error
    }
}

// Login with email/password
function loginWithEmail() {
    if (!loginEmail || !loginPassword || !loginError) return;
    const email = loginEmail.value;
    const password = loginPassword.value;
    loginError.textContent = ''; // Clear previous errors

    if (!email || !password) {
        loginError.textContent = 'Please enter both email and password.';
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .catch(error => {
            loginError.textContent = `Login failed: ${error.message}`;
            console.error("Login Error:", error);
        });
}

// Login with Google
function loginWithGoogle() {
     if (!loginError) return;
    const provider = new firebase.auth.GoogleAuthProvider();
    loginError.textContent = ''; // Clear previous errors
    auth.signInWithPopup(provider)
        .then(async (result) => {
             // Optional: Check if user profile exists. If not, Admin needs to create it.
             const user = result.user;
             const userRoleData = await getUserRole(user.uid);
             if (!userRoleData) {
                  console.warn(`Google Sign-In successful for ${user.email}, but no profile found in Firestore. Logging out.`);
                  alert(`Login successful, but your account (${user.email}) needs setup by an administrator. Please contact them.`);
                  logout(); // Log out until profile is created
             }
             // If profile exists, checkAuthState will handle the rest.
        })
        .catch(error => {
            loginError.textContent = `Google Sign-In failed: ${error.message}`;
             console.error("Google Sign-In Error:", error);
        });
}

// Logout
function logout() {
    auth.signOut().catch(error => {
        console.error("Logout error:", error);
        alert(`Error logging out: ${error.message}`);
    });
}


// --- Permission & UI Control ---

// Check if the current user has a specific permission
function hasPermission(permission) {
    if (!currentUser || !currentUser.role) {
        // console.warn("Permission check failed: No current user or role.");
        return false; // Not logged in or role not loaded
    }
    const allowedRoles = PERMISSIONS[permission];
    if (!allowedRoles) {
        console.warn(`Permission definition missing for: '${permission}'. Denying by default.`);
        return false;
    }
    // console.log(`Checking permission '${permission}' for role '${currentUser.role}'. Allowed: ${allowedRoles.includes(currentUser.role)}`);
    return allowedRoles.includes(currentUser.role);
}

// Update UI elements based on user's role and permissions
function updateUIForRole() {
    if (!currentUser || !currentUser.role) {
        // console.warn("Cannot update UI, currentUser or role missing.");
        // Hide all permission-controlled elements if no valid user/role
        document.querySelectorAll('[data-permission]').forEach(el => {
            el.classList.add('permission-hidden');
        });
        return;
    }

    // console.log(`Updating UI elements for role: ${currentUser.role}`);
    document.querySelectorAll('[data-permission]').forEach(el => {
        const requiredPermission = el.dataset.permission;
        if (hasPermission(requiredPermission)) {
            el.classList.remove('permission-hidden');
             // Reset disabled state in case it was previously disabled
             if (el.tagName === 'BUTTON' || el.tagName === 'SELECT' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                 el.disabled = false;
             }
        } else {
            el.classList.add('permission-hidden');
        }
    });

    // Special check for modal edit button (depends on loaded audit)
    updateModalEditButtonVisibility();
}

// Specific function to update the modal's edit button visibility
function updateModalEditButtonVisibility() {
     if (editAuditBtn) {
         editAuditBtn.classList.toggle('permission-hidden', !canEditAudit(currentAudit));
     }
     if (exportAuditBtn){
        exportAuditBtn.classList.toggle('permission-hidden', !hasPermission('export_data'));
     }
}

// Check if the current user can edit a *specific* audit
function canEditAudit(audit) {
    if (!audit || !currentUser) return false;

    // Admins can edit anything (including submitted, though UI flow might prevent it easily)
    if (currentUser.role === ROLES.ADMIN) {
        return true;
    }

    // Lead Auditors can edit any DRAFT audit
    if (currentUser.role === ROLES.LEAD_AUDITOR && audit.status === 'draft') {
        return true;
    }

    // Auditors can edit their OWN DRAFT audits
    if (currentUser.role === ROLES.AUDITOR &&
        audit.createdBy === currentUser.uid && // Check ownership
        audit.status === 'draft') {            // Check status
        return true;
    }

    // console.log(`Edit check failed for audit ${audit.id}: User role ${currentUser.role}, Audit status ${audit.status}, Owner ${audit.createdBy === currentUser.uid}`);
    return false; // Default deny
}


// --- Navigation ---

// Switch between main content sections
function switchSection(sectionId) {
    console.log(`Switching to section: ${sectionId}`);
    // Update active nav item
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
    });

    // Show the selected section, hide others
    let sectionFoundAndPermitted = false;
    contentSections.forEach(section => {
        const isTargetSection = section.id === `${sectionId}-section`;
        const permission = section.dataset.permission; // Check section's permission

        if (isTargetSection) {
            // Final check: Does user have permission for this section?
             if (!permission || hasPermission(permission)) {
                section.classList.remove('hidden');
                sectionFoundAndPermitted = true;
                 // Initialize section content if needed
                initializeSection(sectionId);
            } else {
                section.classList.add('hidden'); // Hide if no permission
                 console.warn(`Permission denied for section: ${sectionId}`);
                 // Optionally show an error message or redirect
                 alert("Permission denied to access this section.");
                 // Redirect to dashboard if access denied (prevent blank screen)
                 if (sectionId !== 'dashboard') {
                     switchSection('dashboard');
                 }
            }
        } else {
            section.classList.add('hidden'); // Hide non-target sections
        }
    });

    if (sectionFoundAndPermitted) {
        // Re-apply general UI updates after switching section
        updateUIForRole();
    } else if (!document.querySelector(`.content-section:not(.hidden)`)) {
        // If somehow no section is visible (e.g., permission issue on default), force dashboard
        console.warn("No permitted section found, defaulting to dashboard.");
        switchSection('dashboard');
    }
}

// Initialize section-specific content/data loading
function initializeSection(sectionId) {
    switch (sectionId) {
        case 'new-audit':
            initNewAuditForm();
            break;
        case 'dashboard':
            renderDashboard(); // Assumes audits are loaded or will be loaded
            break;
        case 'audit-history':
            renderAuditHistory(); // Assumes audits are loaded
            break;
        case 'reports':
            initReportControls(); // Setup report filters
            // Clear previous report results
             if(reportChartInstance) reportChartInstance.destroy();
             if(reportTableContainer) reportTableContainer.innerHTML = '<p>Select report criteria and click "Generate Report".</p>';
             if(reportChartContainer) reportChartContainer.style.display = 'none';
            break;
        case 'user-management':
            loadUsersForManagement(); // Fetch and display users
            break;
        default:
            // console.log(`No specific initialization for section: ${sectionId}`);
            break;
    }
}

// --- Audit Management ---

// Initialize the New Audit form
function initNewAuditForm() {
    console.log("Initializing new audit form.");
    if (!auditForm || !auditDateInput || !auditedAreaInput || !checklistContainer) return;

    auditForm.reset(); // Reset standard form elements
    auditDateInput.value = new Date().toISOString().split('T')[0]; // Set date to today
    checklistContainer.innerHTML = ''; // Clear dynamically added checklist items
    currentAudit = null; // Ensure we are creating a new audit, not editing

    // Populate checklist items
    auditChecklist.forEach(item => {
        const checklistItemDiv = document.createElement('div');
        checklistItemDiv.className = 'checklist-item';
        checklistItemDiv.innerHTML = `
            <h4>${item.id}. ${escapeHtml(item.requirement)} ${item.clause ? `(Clause ${item.clause})` : ''}</h4>
            <div class="compliance-toggle">
                <button type="button" class="compliance-btn" data-compliance="yes">Compliant</button>
                <button type="button" class="compliance-btn" data-compliance="no">Non-Compliant</button>
            </div>
            <div class="form-group">
                <label for="evidence-${item.id}">Objective Evidence:</label>
                <textarea id="evidence-${item.id}" class="evidence-input" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label for="comments-${item.id}">Comments:</label>
                <textarea id="comments-${item.id}" class="comments-input" rows="2"></textarea>
            </div>
        `;
        checklistContainer.appendChild(checklistItemDiv);

        // Add event listeners to compliance buttons within this item
        const complianceBtns = checklistItemDiv.querySelectorAll('.compliance-btn');
        complianceBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const toggleGroup = this.closest('.compliance-toggle');
                // Deactivate siblings
                toggleGroup.querySelectorAll('.compliance-btn').forEach(b => {
                     b.classList.remove('active', 'compliance-yes', 'compliance-no');
                });
                 // Activate this button
                 this.classList.add('active');
                 this.classList.add(this.dataset.compliance === 'yes' ? 'compliance-yes' : 'compliance-no');
            });
        });
    });
    // Ensure save/submit buttons are visible if user has permission
    updateUIForRole();
}

// Collect data from the audit form
function collectAuditFormData() {
    const auditDate = auditDateInput.value;
    const auditedArea = auditedAreaInput.value.trim();

    // Basic Validation
    if (!auditDate) {
        alert('Please select an Audit Date.');
        auditDateInput.focus();
        return null;
    }
    if (!auditedArea) {
        alert('Please enter the Audited Area / Directorate.');
        auditedAreaInput.focus();
        return null;
    }

    const checklistData = [];
    const checklistItemElements = checklistContainer.querySelectorAll('.checklist-item');
    let isComplete = true; // Flag to check if all compliance statuses are selected

    checklistItemElements.forEach((itemElement, index) => {
        const originalChecklistItem = auditChecklist[index]; // Get corresponding data
        const complianceBtn = itemElement.querySelector('.compliance-btn.active');
        const compliance = complianceBtn ? complianceBtn.dataset.compliance : ''; // '' if none selected
        const evidence = itemElement.querySelector('.evidence-input').value.trim();
        const comments = itemElement.querySelector('.comments-input').value.trim();

        if (!compliance) { // Check if a status was selected
            isComplete = false;
            // Optionally highlight the incomplete item
            itemElement.style.border = '2px solid red';
        } else {
            itemElement.style.border = ''; // Reset border if previously marked
        }


        checklistData.push({
            id: originalChecklistItem.id, // Use the predefined ID
            requirement: originalChecklistItem.requirement,
            clause: originalChecklistItem.clause,
            compliance: compliance,
            objectiveEvidence: evidence,
            comments: comments
        });
    });

     // If submitting, ensure all items are marked compliant/non-compliant
     // This check is now part of the submitAudit function, but keeping track here is useful.
     // if (isSubmitting && !isComplete) {
     //     alert("Please select 'Compliant' or 'Non-Compliant' for all checklist items before submitting.");
     //     return null; // Prevent submission
     // }


    // Prepare base data object
     const data = {
        date: auditDate,
        auditedArea: auditedArea,
        checklist: checklistData,
        lastModified: firebase.firestore.FieldValue.serverTimestamp() // Use server time
    };

     // Add creator info ONLY if it's a new audit (currentAudit is null)
     if (!currentAudit) {
         if (!currentUser) {
            console.error("Cannot save audit: currentUser is null.");
            alert("Error: User information not found. Cannot save audit.");
            return null;
         }
        data.createdBy = currentUser.uid;
        data.createdByEmail = currentUser.email; // Store email for display
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
     }

    return { data, isComplete }; // Return data and completion status
}


// Save audit as draft
function saveAuditAsDraft() {
    if (!hasPermission('create_audit')) {
        alert("Permission Denied: You cannot save audit drafts.");
        return;
    }

    const formDataResult = collectAuditFormData();
    if (!formDataResult || !formDataResult.data) return; // Validation failed or user missing

    const auditData = formDataResult.data;
    auditData.status = 'draft'; // Set status

    // Proceed to save (even if checklist isn't fully complete for draft)
    saveAuditToFirestore(auditData);
}


// Submit audit
function submitAudit() {
    if (!hasPermission('submit_audit')) {
        alert("Permission Denied: You cannot submit audits.");
        return;
    }

    const formDataResult = collectAuditFormData();
    if (!formDataResult || !formDataResult.data) return; // Validation failed or user missing

    // Check if checklist is fully completed before submitting
    if (!formDataResult.isComplete) {
        alert("Please select 'Compliant' or 'Non-Compliant' for ALL checklist items before submitting.");
         // Find the first incomplete item and focus it (optional enhancement)
         const firstIncomplete = checklistContainer.querySelector('.checklist-item:not(:has(.compliance-btn.active))');
         if (firstIncomplete) firstIncomplete.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return; // Stop submission
    }


    const auditData = formDataResult.data;
    auditData.status = 'submitted'; // Set status
    auditData.submittedAt = firebase.firestore.FieldValue.serverTimestamp(); // Add submission time

    saveAuditToFirestore(auditData);
}

// Save audit data to Firestore (handles create/update)
function saveAuditToFirestore(auditData) {
    let promise;
    let action = 'created'; // For alert message

    // Determine if updating an existing audit or creating a new one
    if (currentAudit && currentAudit.id) { // We are editing
        action = 'updated';
        // Final permission check: Can this user edit THIS specific audit?
        if (!canEditAudit(currentAudit)) {
             alert("Permission Denied: You cannot edit this audit in its current state or do not have the required role.");
             return;
        }
        const auditRef = db.collection('audits').doc(currentAudit.id);
        // Ensure crucial fields like createdBy, createdAt are not overwritten
        const { createdBy, createdAt, createdByEmail, ...updateData } = auditData;
        promise = auditRef.update(updateData);
        console.log(`Updating audit ${currentAudit.id}`);

    } else { // We are creating a new audit
         // Permission check (redundant but safe)
         if (!hasPermission('create_audit')) {
             alert("Permission Denied: You cannot create new audits.");
             return;
         }
         // Ensure creator fields are present (should be added in collectAuditFormData)
         if (!auditData.createdBy || !auditData.createdAt) {
             console.error("Missing creator/timestamp info for new audit:", auditData);
             alert("Error: Could not save audit due to missing user information.");
             return;
         }
        promise = db.collection('audits').add(auditData);
        console.log(`Creating new audit`);
    }

    // Execute the Firestore operation
    promise
        .then(() => {
            alert(`Audit ${action} successfully!`);
            loadAudits(); // Refresh the audit list data
            switchSection('audit-history'); // Navigate to history after save/update
        })
        .catch(error => {
            alert(`Error saving audit: ${error.message}`);
            console.error("Firestore save error:", error);
        });
}


// Load audits from Firestore
function loadAudits() {
    console.log("Loading audits...");
    if (!currentUser) {
         console.warn("Cannot load audits, no user logged in.");
         audits = []; // Clear local cache
         renderAuditHistory(); // Update UI to show empty state
         renderDashboard();
         return;
    }
    // Firestore rules handle read permission. We fetch all audits the user CAN see.
    db.collection('audits')
        .orderBy('createdAt', 'desc') // Order by creation time, newest first
        .get()
        .then(querySnapshot => {
            audits = []; // Clear previous local cache
            querySnapshot.forEach(doc => {
                // Convert Timestamps here if needed immediately, or format later
                const data = doc.data();
                audits.push({
                    id: doc.id,
                    ...data
                    // Example conversion (do this in format functions preferably):
                    // createdAt: data.createdAt?.toDate(),
                    // lastModified: data.lastModified?.toDate(),
                    // submittedAt: data.submittedAt?.toDate()
                });
            });
            console.log(`Loaded ${audits.length} audits.`);

            // Refresh relevant UI sections AFTER data is loaded
            if (isSectionVisible('dashboard')) renderDashboard();
            if (isSectionVisible('audit-history')) renderAuditHistory();
            if (isSectionVisible('reports')) updateAreaFilter(); // Update report filter options

        })
        .catch(error => {
            console.error('Error loading audits: ', error);
            alert(`Failed to load audits: ${error.message}`);
            audits = []; // Clear cache on error
            // Display error in relevant lists
            if(recentAuditsList) recentAuditsList.innerHTML = '<p class="error-message">Error loading recent audits.</p>';
             if(auditHistoryList) auditHistoryList.innerHTML = '<p class="error-message">Error loading audit history.</p>';
        });
}


// --- Dashboard Rendering ---

function renderDashboard() {
    console.log("Rendering dashboard");
    if (!isSectionVisible('dashboard') || !hasPermission('view_dashboard')) return;

    // Use the globally loaded 'audits' array
    renderComplianceChart(); // Pass data if needed, or calculate inside
    renderRecentAudits();
    renderNonConformanceChart(); // Pass data if needed, or calculate inside
    updateUIForRole(); // Ensure quick actions visibility is correct
}

// Render overall compliance chart
function renderComplianceChart() {
     if (!complianceChartCanvas) return;
    const ctx = complianceChartCanvas.getContext('2d');
    if (complianceChartInstance) {
        complianceChartInstance.destroy(); // Clear previous chart
    }

    let totalItems = 0;
    let compliantItems = 0;
    // Calculate from all audits user can see
    audits.forEach(audit => {
        if (audit.checklist && Array.isArray(audit.checklist)) {
             totalItems += audit.checklist.length;
             compliantItems += audit.checklist.filter(item => item.compliance === 'yes').length;
        }
    });
    const complianceRate = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 0;
    const nonComplianceRate = 100 - complianceRate;


    complianceChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Compliant', 'Non-Compliant'],
            datasets: [{
                label: 'Overall Compliance',
                data: [complianceRate, nonComplianceRate],
                backgroundColor: ['#2a9d8f', '#e76f51'], // Success, Danger colors
                borderColor: [ '#ffffff', '#ffffff'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%', // Makes it a thinner doughnut
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { callbacks: { label: (context) => `${context.label}: ${context.raw}%` } }
            }
        }
    });
}

// Render list of recent audits
function renderRecentAudits() {
     if (!recentAuditsList) return;
     recentAuditsList.innerHTML = ''; // Clear previous list

    const recent = audits.slice(0, 5); // Get the 5 most recent from loaded data

    if (recent.length === 0) {
        recentAuditsList.innerHTML = '<p>No recent audits found.</p>';
        return;
    }

     recent.forEach(audit => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'audit-item';
        itemDiv.dataset.auditId = audit.id; // Store ID for click handler
        const createdBy = audit.createdByEmail ? `by ${escapeHtml(audit.createdByEmail)}` : '';
        itemDiv.innerHTML = `
            <div class="details">
                <strong>${escapeHtml(audit.auditedArea) || 'N/A'}</strong>
                <div class="date">${formatDate(audit.date)} ${createdBy}</div>
            </div>
            <span class="status status-${audit.status}">${escapeHtml(audit.status)}</span>
        `;
        itemDiv.addEventListener('click', () => openAuditDetails(audit));
        recentAuditsList.appendChild(itemDiv);
    });
}

// Render non-conformance areas chart
function renderNonConformanceChart() {
    if (!ncChartCanvas) return;
    const ctx = ncChartCanvas.getContext('2d');
     if (ncChartInstance) {
        ncChartInstance.destroy(); // Clear previous chart
    }

    // Group non-conformances by area from loaded audits
    const ncByArea = {};
    let hasNcData = false;
    audits.forEach(audit => {
         if (audit.checklist && Array.isArray(audit.checklist) && audit.auditedArea) {
             const ncCount = audit.checklist.filter(item => item.compliance === 'no').length;
             if (ncCount > 0) {
                  hasNcData = true;
                  ncByArea[audit.auditedArea] = (ncByArea[audit.auditedArea] || 0) + ncCount;
             }
         }
    });


     if (!hasNcData) {
         console.log("No non-conformance data for chart.");
         // Optional: Display message on canvas if needed
         return;
     }

     // Sort areas by NC count descending, take top N if desired
     const sortedAreas = Object.entries(ncByArea)
                             .sort(([, countA], [, countB]) => countB - countA);
                             // .slice(0, 10); // Uncomment to show only top 10

     const labels = sortedAreas.map(([area]) => area.length > 30 ? area.substring(0, 27) + '...' : area); // Shorten labels
     const data = sortedAreas.map(([, count]) => count);


     ncChartInstance = new Chart(ctx, {
        type: 'bar', // Or 'bar' with indexAxis: 'y' for horizontal
        data: {
            labels: labels,
            datasets: [{
                label: 'Non-Conformances',
                data: data,
                backgroundColor: '#e76f51', // Danger color
                borderColor: '#c0392b',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal bars are often better for category names
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { beginAtZero: true, title: { display: true, text: 'Count' } },
                y: { ticks: { autoSkip: false } } // Prevent labels skipping if many areas
            },
            plugins: { legend: { display: false } }
        }
    });
}


// --- Audit History & Filtering ---

function renderAuditHistory() {
     console.log("Rendering audit history list.");
     if (!auditHistoryList) return;
     auditHistoryList.innerHTML = ''; // Clear current list

    const displayAudits = audits; // Use filtered audits if filtering is applied, otherwise all loaded audits

    if (displayAudits.length === 0) {
        auditHistoryList.innerHTML = '<p>No audits found.</p>';
        return;
    }

     displayAudits.forEach(audit => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'audit-item';
        itemDiv.dataset.auditId = audit.id;
        const createdBy = audit.createdByEmail ? `by ${escapeHtml(audit.createdByEmail)}` : '';
        const submitted = audit.submittedAt ? `• Submitted: ${formatDateTime(audit.submittedAt)}` : '';
        itemDiv.innerHTML = `
            <div class="details">
                <strong>${escapeHtml(audit.auditedArea) || 'N/A'}</strong>
                <div class="date">${formatDate(audit.date)} ${submitted} ${createdBy}</div>
                <div class="date">Last Modified: ${formatDateTime(audit.lastModified)}</div>
            </div>
            <span class="status status-${audit.status}">${escapeHtml(audit.status)}</span>
        `;
        itemDiv.addEventListener('click', () => openAuditDetails(audit));
        auditHistoryList.appendChild(itemDiv);
    });

     // Ensure the area filter dropdown is up-to-date
     updateAreaFilter();
}

// Filter audits displayed in the history list
function filterAudits() {
    const fromDate = document.getElementById('date-from').value;
    const toDate = document.getElementById('date-to').value;
    const areaFilter = areaFilterHistory.value;

    console.log(`Filtering history: From=${fromDate}, To=${toDate}, Area=${areaFilter}`);

    const filtered = audits.filter(audit => {
        let match = true;
        if (fromDate && audit.date < fromDate) match = false;
        if (toDate && audit.date > toDate) match = false;
        if (areaFilter && audit.auditedArea !== areaFilter) match = false;
        return match;
    });

    // Re-render the list with filtered data
    renderFilteredAuditHistory(filtered);
}

// Helper to render history list with specific data (used by filter)
function renderFilteredAuditHistory(filteredAudits) {
     if (!auditHistoryList) return;
     auditHistoryList.innerHTML = ''; // Clear current list

     if (filteredAudits.length === 0) {
        auditHistoryList.innerHTML = '<p>No audits match the selected filters.</p>';
        return;
    }
    // Use the same rendering logic as renderAuditHistory
    filteredAudits.forEach(audit => {
         const itemDiv = document.createElement('div');
         itemDiv.className = 'audit-item';
         itemDiv.dataset.auditId = audit.id;
         const createdBy = audit.createdByEmail ? `by ${escapeHtml(audit.createdByEmail)}` : '';
         const submitted = audit.submittedAt ? `• Submitted: ${formatDateTime(audit.submittedAt)}` : '';
         itemDiv.innerHTML = `
            <div class="details">
                <strong>${escapeHtml(audit.auditedArea) || 'N/A'}</strong>
                <div class="date">${formatDate(audit.date)} ${submitted} ${createdBy}</div>
                <div class="date">Last Modified: ${formatDateTime(audit.lastModified)}</div>
            </div>
            <span class="status status-${audit.status}">${escapeHtml(audit.status)}</span>
        `;
         itemDiv.addEventListener('click', () => openAuditDetails(audit));
         auditHistoryList.appendChild(itemDiv);
    });
}


// Update the Area filter dropdown options
function updateAreaFilter() {
    if (!areaFilterHistory) return;

    const currentFilterValue = areaFilterHistory.value; // Preserve selection

    // Get unique, sorted areas from the *loaded* audits
    const areas = [...new Set(audits.map(a => a.auditedArea).filter(Boolean))].sort();

    // Clear existing options (keep the "All Areas" default)
    while (areaFilterHistory.options.length > 1) {
        areaFilterHistory.remove(1);
    }

    // Add new options
    areas.forEach(area => {
        const option = document.createElement('option');
        option.value = area;
        option.textContent = escapeHtml(area);
        areaFilterHistory.appendChild(option);
    });

    // Restore previous selection if it still exists
    areaFilterHistory.value = currentFilterValue;
}


// --- Modal Functionality ---

// Open the audit details modal
function openAuditDetails(audit) {
    console.log("Opening details for audit:", audit.id);
    if (!modal || !modalTitle || !modalBody || !audit) return;

    currentAudit = audit; // Set the globally tracked audit

    // Populate modal title
    modalTitle.textContent = `Audit Details: ${escapeHtml(audit.auditedArea)} (${formatDate(audit.date)})`;

    // Build modal body content
    const createdBy = audit.createdByEmail ? escapeHtml(audit.createdByEmail) : audit.createdBy || 'Unknown';
    let bodyContent = `
        <div class="audit-meta">
            <p><strong>Audited Area:</strong> ${escapeHtml(audit.auditedArea) || 'N/A'}</p>
            <p><strong>Audit Date:</strong> ${formatDate(audit.date)}</p>
            <p><strong>Status:</strong> <span class="status status-${audit.status}">${escapeHtml(audit.status)}</span></p>
            <p><strong>Created By:</strong> ${createdBy}</p>
            <p><strong>Created At:</strong> ${formatDateTime(audit.createdAt)}</p>
            <p><strong>Last Modified:</strong> ${formatDateTime(audit.lastModified)}</p>
            <p><strong>Submitted At:</strong> ${audit.submittedAt ? formatDateTime(audit.submittedAt) : 'N/A'}</p>
        </div>

        <h3>Checklist Items (${audit.checklist ? audit.checklist.length : 0})</h3>
        <div class="checklist-summary">
    `;

    if (audit.checklist && Array.isArray(audit.checklist)) {
        audit.checklist.forEach(item => {
            const complianceClass = item.compliance === 'yes' ? 'compliant' : (item.compliance === 'no' ? 'non-compliant' : '');
            const complianceText = item.compliance === 'yes' ? 'Compliant' : (item.compliance === 'no' ? 'Non-Compliant' : 'Not Selected');
            bodyContent += `
                <div class="checklist-item-summary">
                    <h4>${item.id}. ${escapeHtml(item.requirement)} ${item.clause ? `(Clause ${item.clause})` : ''}</h4>
                    <p><strong>Status:</strong> <span class="${complianceClass}">${complianceText}</span></p>
                    ${item.objectiveEvidence ? `<p><strong>Objective Evidence:</strong><br><pre>${escapeHtml(item.objectiveEvidence)}</pre></p>` : ''}
                    ${item.comments ? `<p><strong>Comments:</strong><br><pre>${escapeHtml(item.comments)}</pre></p>` : ''}
                </div>
            `;
        });
    } else {
         bodyContent += '<p>No checklist data available.</p>';
    }
    bodyContent += `</div>`; // Close checklist-summary

    modalBody.innerHTML = bodyContent;

    // Update button visibility based on role and audit state
    updateModalEditButtonVisibility();

    // Show the modal
    modal.classList.remove('hidden');
}

// Close the audit details modal
function closeModal() {
     if (!modal) return;
    modal.classList.add('hidden');
    currentAudit = null; // Clear the tracked audit
    console.log("Modal closed.");
}

// Handle clicking the Edit button in the modal
function editAudit() {
    // Permission/state check
    if (!currentAudit) {
        console.error("No audit selected to edit.");
        return;
    }
    if (!canEditAudit(currentAudit)) {
         alert("Permission Denied: Cannot edit this audit.");
         return;
    }

    // Initialize the form first
    initNewAuditForm(); // This also sets currentAudit = null initially
    currentAudit = { ...audits.find(a => a.id === currentAudit.id) }; // IMPORTANT: Re-assign currentAudit AFTER initNewAuditForm clears it

    console.log(`Loading audit ${currentAudit.id} into form for editing.`);

    // Populate form fields
    auditDateInput.value = currentAudit.date || '';
    auditedAreaInput.value = currentAudit.auditedArea || '';

    // Populate checklist items
    const checklistItemElements = checklistContainer.querySelectorAll('.checklist-item');
    if (currentAudit.checklist && checklistItemElements.length === currentAudit.checklist.length) {
        checklistItemElements.forEach((itemElement, index) => {
            const auditItemData = currentAudit.checklist[index];
             if (!auditItemData) return; // Skip if data missing

             // Set compliance buttons
             const complianceBtns = itemElement.querySelectorAll('.compliance-btn');
             complianceBtns.forEach(btn => {
                 btn.classList.remove('active', 'compliance-yes', 'compliance-no');
                 if (btn.dataset.compliance === auditItemData.compliance) {
                     btn.classList.add('active');
                     btn.classList.add(auditItemData.compliance === 'yes' ? 'compliance-yes' : 'compliance-no');
                 }
             });
             // Set evidence and comments
             const evidenceInput = itemElement.querySelector('.evidence-input');
             const commentsInput = itemElement.querySelector('.comments-input');
             if(evidenceInput) evidenceInput.value = auditItemData.objectiveEvidence || '';
             if(commentsInput) commentsInput.value = auditItemData.comments || '';
        });
    } else {
         console.error("Checklist mismatch or missing data during edit load.");
         alert("Error loading audit details for editing.");
         return; // Prevent switching if load fails
    }

    closeModal(); // Close the modal
    switchSection('new-audit'); // Navigate to the form section
}

// Export the currently viewed audit details to CSV
function exportCurrentAudit() {
    if (!hasPermission('export_data')) {
        alert("Permission Denied: You cannot export audit data.");
        return;
    }
    if (!currentAudit || !currentAudit.checklist) {
        alert('No audit details loaded to export.');
        return;
    }

    const headers = ['ID', 'Requirement', 'Clause', 'Compliance', 'Objective Evidence', 'Comments'];
    const rows = currentAudit.checklist.map(item => [
        item.id,
        item.requirement,
        item.clause || '',
        item.compliance === 'yes' ? 'Compliant' : (item.compliance === 'no' ? 'Non-Compliant' : 'Not Selected'),
        item.objectiveEvidence || '',
        item.comments || ''
    ]);

    // Add audit metadata at the top
     const metaData = [
        ['Audit Area:', currentAudit.auditedArea],
        ['Audit Date:', formatDate(currentAudit.date)],
        ['Status:', currentAudit.status],
        ['Created By:', currentAudit.createdByEmail || currentAudit.createdBy],
        ['Created At:', formatDateTime(currentAudit.createdAt)],
        ['Last Modified:', formatDateTime(currentAudit.lastModified)],
        ['Submitted At:', currentAudit.submittedAt ? formatDateTime(currentAudit.submittedAt) : 'N/A']
     ];


    // Format for CSV (handle quotes and commas)
     const formatCsvCell = (cell) => {
         const cellStr = String(cell);
         if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
             return `"${cellStr.replace(/"/g, '""')}"`;
         }
         return cellStr;
     };

    let csvContent = metaData.map(row => row.map(formatCsvCell).join(',')).join('\n') + '\n\n'; // Add meta first
    csvContent += headers.map(formatCsvCell).join(',') + '\n'; // Add headers
    csvContent += rows.map(row => row.map(formatCsvCell).join(',')).join('\n'); // Add data rows

    // Sanitize filename
    const safeArea = (currentAudit.auditedArea || 'UnknownArea').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const safeDate = (currentAudit.date || 'UnknownDate').replace(/-/g, '');
    const fileName = `nafdac_audit_${safeArea}_${safeDate}.csv`;

    downloadCSV(csvContent, fileName);
}


// --- Reporting ---

function initReportControls() {
    // Set default date range (e.g., last month) or leave blank
     const today = new Date();
     const lastMonth = new Date(today);
     lastMonth.setMonth(lastMonth.getMonth() - 1);

     document.getElementById('report-from').value = lastMonth.toISOString().split('T')[0];
     document.getElementById('report-to').value = today.toISOString().split('T')[0];
     document.getElementById('custom-date-range').classList.add('hidden'); // Hide custom range initially
     document.getElementById('report-period').value = 'last-month'; // Set default period selection

     // Clear previous results
     if(reportChartInstance) reportChartInstance.destroy();
     if(reportTableContainer) reportTableContainer.innerHTML = '<p>Select report criteria and click "Generate Report".</p>';
     if(reportChartContainer) reportChartContainer.style.display = 'none';

     // Update filters if needed (e.g., area dropdown for reports)
     updateAreaFilter(); // Assuming reports might use the same filter ID or a similar one
}

function toggleCustomDateRange() {
    const periodSelect = document.getElementById('report-period');
    const customRangeDiv = document.getElementById('custom-date-range');
    if (periodSelect && customRangeDiv) {
        customRangeDiv.classList.toggle('hidden', periodSelect.value !== 'custom');
    }
}

function generateReport() {
    if (!hasPermission('generate_reports')) {
         alert("Permission Denied: You cannot generate reports.");
         return;
    }

     const reportType = document.getElementById('report-type').value;
     const period = document.getElementById('report-period').value;

     // Clear previous results & destroy chart
     if (reportChartInstance) reportChartInstance.destroy();
     reportTableContainer.innerHTML = '<p>Generating report...</p>';
     reportChartContainer.style.display = 'none'; // Hide chart until data is ready


     let fromDateStr, toDateStr;
     const today = new Date();

     // Determine date range
     if (period === 'custom') {
         fromDateStr = document.getElementById('report-from').value;
         toDateStr = document.getElementById('report-to').value;
         if (!fromDateStr || !toDateStr) {
             alert("Please select both 'From' and 'To' dates for custom range.");
             reportTableContainer.innerHTML = '<p class="error-message">Custom date range incomplete.</p>';
             return;
         }
     } else { // Calculate based on selected period
         const toDateObj = new Date(today);
         toDateStr = toDateObj.toISOString().split('T')[0];
         const fromDateObj = new Date(today);
         if (period === 'last-month') fromDateObj.setMonth(fromDateObj.getMonth() - 1);
         else if (period === 'last-quarter') fromDateObj.setMonth(fromDateObj.getMonth() - 3);
         else if (period === 'last-year') fromDateObj.setFullYear(fromDateObj.getFullYear() - 1);
         fromDateStr = fromDateObj.toISOString().split('T')[0];
     }

     console.log(`Generating report type '${reportType}' for period ${fromDateStr} to ${toDateStr}`);

     // Filter audits for the period (consider only submitted audits for reports)
     const reportAudits = audits.filter(audit =>
         audit.date >= fromDateStr &&
         audit.date <= toDateStr &&
         audit.status === 'submitted' // Typically reports are based on completed/submitted audits
     );

     if (reportAudits.length === 0) {
         reportTableContainer.innerHTML = '<p>No submitted audit data available for the selected period.</p>';
         return; // No data to report
     }

     console.log(`Using ${reportAudits.length} audits for the report.`);

     // Generate specific report type
     try {
         reportChartContainer.style.display = 'block'; // Show chart area
         switch (reportType) {
             case 'compliance':
                 generateComplianceReport(reportAudits, fromDateStr, toDateStr);
                 break;
             case 'non-conformance':
                 generateNonConformanceReport(reportAudits, fromDateStr, toDateStr);
                 break;
             case 'trend':
                 generateTrendReport(reportAudits, fromDateStr, toDateStr);
                 break;
             default:
                 throw new Error(`Unknown report type: ${reportType}`);
         }
     } catch (error) {
         console.error("Error generating report:", error);
         reportTableContainer.innerHTML = `<p class="error-message">Error generating report: ${error.message}</p>`;
         reportChartContainer.style.display = 'none'; // Hide chart area on error
     }
}


// Generate Compliance Summary Report
function generateComplianceReport(reportAudits, fromDate, toDate) {
    console.log("Generating Compliance Report");
    const ctx = reportChartCanvas.getContext('2d');
    const complianceByArea = {}; // Store { totalRate: number, count: number }
    let totalAuditsInReport = 0;

    reportAudits.forEach(audit => {
        if (audit.checklist && audit.checklist.length > 0 && audit.auditedArea) {
             totalAuditsInReport++;
             const totalItems = audit.checklist.length;
             const compliantItems = audit.checklist.filter(item => item.compliance === 'yes').length;
             const rate = Math.round((compliantItems / totalItems) * 100);
             if (complianceByArea[audit.auditedArea]) {
                 complianceByArea[audit.auditedArea].totalRate += rate;
                 complianceByArea[audit.auditedArea].count++;
             } else {
                 complianceByArea[audit.auditedArea] = { totalRate: rate, count: 1 };
             }
        }
    });

    const areas = Object.keys(complianceByArea).sort();
    if (areas.length === 0) {
         reportTableContainer.innerHTML = '<p>No compliance data found for report.</p>';
         reportChartContainer.style.display = 'none';
         return;
    }
    const averageRates = areas.map(area => Math.round(complianceByArea[area].totalRate / complianceByArea[area].count));

    // Render Chart
    reportChartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels: areas, datasets: [{ label: 'Avg Compliance (%)', data: averageRates, backgroundColor: averageRates.map(getComplianceColor) }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100, title: { display: true, text: 'Avg Compliance Rate (%)' } } } }
    });

    // Render Table
    let tableHTML = `<h3>Compliance Summary (${formatDate(fromDate)} to ${formatDate(toDate)}) - ${totalAuditsInReport} Audits</h3><table class="report-table"><thead><tr><th>Audited Area</th><th>Avg Compliance Rate</th><th>Status</th></tr></thead><tbody>`;
    areas.forEach((area, index) => {
        const rate = averageRates[index];
        const { statusClass, statusText } = getComplianceStatus(rate);
        tableHTML += `<tr><td>${escapeHtml(area)}</td><td>${rate}%</td><td class="${statusClass}">${statusText}</td></tr>`;
    });
    tableHTML += `</tbody></table>`;
    reportTableContainer.innerHTML = tableHTML;
}

// Generate Non-Conformance Analysis Report
function generateNonConformanceReport(reportAudits, fromDate, toDate) {
     console.log("Generating Non-Conformance Report");
     const ctx = reportChartCanvas.getContext('2d');
     const ncByRequirement = {}; // Key: "ID|Requirement Text", Value: count
     let totalNC = 0;
     let totalItemsChecked = 0;

     reportAudits.forEach(audit => {
         if (audit.checklist) {
             audit.checklist.forEach(item => {
                 totalItemsChecked++;
                 if (item.compliance === 'no') {
                     totalNC++;
                     const key = `${item.id}|${item.requirement}`;
                     ncByRequirement[key] = (ncByRequirement[key] || 0) + 1;
                 }
             });
         }
     });

     const sortedNC = Object.entries(ncByRequirement).sort(([, countA], [, countB]) => countB - countA);

     if (sortedNC.length === 0) {
         reportTableContainer.innerHTML = '<p>No non-conformances found for report.</p>';
         reportChartContainer.style.display = 'none';
         return;
     }

     // Render Chart (Top N)
     const topN = 10;
     const topNC = sortedNC.slice(0, topN);
     const chartLabels = topNC.map(([key]) => {
         const req = key.split('|')[1];
         return req.length > 40 ? req.substring(0, 37) + '...' : req; // Shorten
     });
     const chartData = topNC.map(([, count]) => count);

     reportChartInstance = new Chart(ctx, {
         type: 'bar',
         data: { labels: chartLabels, datasets: [{ label: 'NC Count', data: chartData, backgroundColor: '#e76f51' }] },
         options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true, title: { display: true, text: 'Count' } } }, plugins: { legend: { display: false } } }
     });

     // Render Table
     let tableHTML = `<h3>Non-Conformance Analysis (${formatDate(fromDate)} to ${formatDate(toDate)})</h3><p>Total Non-Conformances: ${totalNC} (out of ${totalItemsChecked} items checked)</p><table class="report-table"><thead><tr><th>ID</th><th>Requirement</th><th>Clause</th><th>Count</th><th>% of Total NC</th></tr></thead><tbody>`;
     sortedNC.forEach(([key, count]) => {
         const [idStr, requirement] = key.split('|');
         const clause = auditChecklist.find(item => item.id.toString() === idStr)?.clause || 'N/A';
         const percentage = totalNC > 0 ? Math.round((count / totalNC) * 100) : 0;
         tableHTML += `<tr><td>${idStr}</td><td>${escapeHtml(requirement)}</td><td>${clause}</td><td>${count}</td><td>${percentage}%</td></tr>`;
     });
     tableHTML += `</tbody></table>`;
     reportTableContainer.innerHTML = tableHTML;
}

// Generate Compliance Trend Report
function generateTrendReport(reportAudits, fromDate, toDate) {
     console.log("Generating Trend Report");
     const ctx = reportChartCanvas.getContext('2d');
     const monthlyData = {}; // Key: "YYYY-MM", Value: { totalItems, compliantItems, auditCount }

     reportAudits.forEach(audit => {
         if (audit.date && audit.checklist) {
             const month = audit.date.substring(0, 7);
             if (!monthlyData[month]) monthlyData[month] = { totalItems: 0, compliantItems: 0, auditCount: 0 };
             monthlyData[month].auditCount++;
             monthlyData[month].totalItems += audit.checklist.length;
             monthlyData[month].compliantItems += audit.checklist.filter(item => item.compliance === 'yes').length;
         }
     });

     const sortedMonths = Object.keys(monthlyData).sort();
     if (sortedMonths.length === 0) {
         reportTableContainer.innerHTML = '<p>No data available for trend report.</p>';
          reportChartContainer.style.display = 'none';
         return;
     }
     const monthlyRates = sortedMonths.map(month => {
         const data = monthlyData[month];
         return data.totalItems > 0 ? Math.round((data.compliantItems / data.totalItems) * 100) : 0;
     });

     // Render Chart
     reportChartInstance = new Chart(ctx, {
         type: 'line',
         data: { labels: sortedMonths.map(formatMonth), datasets: [{ label: 'Monthly Compliance (%)', data: monthlyRates, borderColor: '#3498db', tension: 0.1, fill: false }] },
         options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100, title: { display: true, text: 'Compliance Rate (%)' } } } }
     });

     // Render Table
     let tableHTML = `<h3>Compliance Trend (${formatDate(fromDate)} to ${formatDate(toDate)})</h3><table class="report-table"><thead><tr><th>Month</th><th>Audits</th><th>Items Checked</th><th>Compliant Items</th><th>Compliance Rate</th></tr></thead><tbody>`;
     sortedMonths.forEach(month => {
         const data = monthlyData[month];
         const rate = data.totalItems > 0 ? Math.round((data.compliantItems / data.totalItems) * 100) : 0;
         tableHTML += `<tr><td>${formatMonth(month)}</td><td>${data.auditCount}</td><td>${data.totalItems}</td><td>${data.compliantItems}</td><td>${rate}%</td></tr>`;
     });
     tableHTML += `</tbody></table>`;
     reportTableContainer.innerHTML = tableHTML;
}


// Export generated report table to CSV
function exportReportToCSV() {
    if (!hasPermission('export_data')) {
        alert("Permission Denied: You cannot export report data.");
        return;
    }

    const table = reportTableContainer?.querySelector('.report-table');
    if (!table) {
        alert('No report table found to export.');
        return;
    }
    const reportTitle = reportTableContainer?.querySelector('h3')?.textContent || "Report";

    let csvContent = `"${reportTitle}"\n\n`; // Add title
    const rows = table.querySelectorAll('tr');
    const csvRows = [];

    rows.forEach(row => {
        const cols = row.querySelectorAll('th, td');
        const csvCols = Array.from(cols).map(col => formatCsvCell(col.textContent)); // Use helper
        csvRows.push(csvCols.join(','));
    });

    csvContent += csvRows.join('\n');

    // Generate filename
    const reportType = document.getElementById('report-type').value;
    const period = document.getElementById('report-period').value;
    let datePart = period === 'custom'
        ? `${document.getElementById('report-from').value}_to_${document.getElementById('report-to').value}`
        : period.replace('last-', '');

    const fileName = `nafdac_${reportType}_report_${datePart}.csv`;
    downloadCSV(csvContent, fileName);
}

// Export all audit data (dashboard export)
function exportDashboardData() {
     if (!hasPermission('export_data')) {
        alert("Permission Denied: You cannot export all audit data.");
        return;
    }
    if (audits.length === 0) {
        alert('No audit data available to export.');
        return;
    }

    const headers = [
        'Audit ID', 'Audit Date', 'Audited Area', 'Status', 'Created By Email', 'Created At', 'Last Modified', 'Submitted At',
        'Checklist ID', 'Requirement', 'Clause', 'Compliance', 'Objective Evidence', 'Comments'
    ];
    const rows = [];

    audits.forEach(audit => {
        const createdAt = formatDateTime(audit.createdAt);
        const lastModified = formatDateTime(audit.lastModified);
        const submittedAt = audit.submittedAt ? formatDateTime(audit.submittedAt) : '';

        if (audit.checklist && audit.checklist.length > 0) {
            audit.checklist.forEach(item => {
                rows.push([
                    audit.id, audit.date, audit.auditedArea, audit.status, audit.createdByEmail || '', createdAt, lastModified, submittedAt,
                    item.id, item.requirement, item.clause || '', item.compliance === 'yes' ? 'Compliant' : (item.compliance === 'no' ? 'Non-Compliant' : 'Not Selected'), item.objectiveEvidence || '', item.comments || ''
                ]);
            });
        } else { // Include audit even if checklist is empty/missing
            rows.push([
                 audit.id, audit.date, audit.auditedArea, audit.status, audit.createdByEmail || '', createdAt, lastModified, submittedAt,
                 '', '', '', '', '', '' // Empty checklist fields
            ]);
        }
    });

    // Format for CSV
    let csvContent = headers.map(formatCsvCell).join(',') + '\n';
    csvContent += rows.map(row => row.map(formatCsvCell).join(',')).join('\n');

    const fileName = `nafdac_all_audit_data_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, fileName);
}

// --- User Management ---

// Load users for the management section
async function loadUsersForManagement() {
    if (!hasPermission('manage_users') || !userListContainer) return;

    userListContainer.innerHTML = '<p>Loading users...</p>';

    try {
        const usersSnapshot = await db.collection('users').orderBy('email').get();
        const userList = [];
        usersSnapshot.forEach(doc => {
            userList.push({ id: doc.id, ...doc.data() });
        });
        renderUserList(userList);
    } catch (error) {
        console.error("Error loading users for management:", error);
        userListContainer.innerHTML = '<p class="error-message">Failed to load users.</p>';
    }
}

// Render the list of users in the User Management section
function renderUserList(users) {
     if (!userListContainer) return;
     userListContainer.innerHTML = ''; // Clear loading/previous list

     if (users.length === 0) {
        userListContainer.innerHTML = '<p>No user profiles found in Firestore.</p>';
        return;
    }

     users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-list-item';
        userItem.dataset.userId = user.id;

        const userInfo = document.createElement('div');
        userInfo.className = 'user-info-details';
        userInfo.innerHTML = `
            <p class="user-email">${escapeHtml(user.email || 'No Email')}</p>
            <p class="user-role">Current Role: <strong>${escapeHtml(user.role || 'Not Set')}</strong></p>
            <p class="user-uid">UID: ${user.id}</p>
        `;

        const roleSelectorDiv = document.createElement('div');
        roleSelectorDiv.className = 'user-role-selector';

        // Prevent admins from changing their own role via this UI
        if (currentUser && user.id === currentUser.uid) {
            roleSelectorDiv.innerHTML = `<p><em>(Your Account)</em></p>`;
        } else {
            const select = document.createElement('select');
            select.className = 'role-select';
            select.dataset.userId = user.id;
            select.dataset.originalRole = user.role || ''; // Store original role for revert

            // Add options for roles (Admin, Lead Auditor, Auditor)
            Object.values(ROLES).forEach(roleValue => {
                const option = document.createElement('option');
                option.value = roleValue;
                let roleText = roleValue.replace('_', ' '); // Basic formatting
                roleText = roleText.charAt(0).toUpperCase() + roleText.slice(1);
                option.textContent = roleText;
                option.selected = user.role === roleValue;
                select.appendChild(option);
            });

            select.addEventListener('change', handleRoleChange);
            roleSelectorDiv.appendChild(select);
        }

        userItem.appendChild(userInfo);
        userItem.appendChild(roleSelectorDiv);
        userListContainer.appendChild(userItem);
    });
}

// Handle role change from dropdown
async function handleRoleChange(event) {
    if (!hasPermission('manage_users')) {
        alert("Permission Denied.");
        event.target.value = event.target.dataset.originalRole; // Revert dropdown
        return;
    }

    const selectElement = event.target;
    const userIdToUpdate = selectElement.dataset.userId;
    const newRole = selectElement.value;
    const originalRole = selectElement.dataset.originalRole;

    if (!userIdToUpdate || !newRole || !originalRole) {
        console.error("Missing data for role change.");
        return;
    }

    const userEmailText = selectElement.closest('.user-list-item')?.querySelector('.user-email')?.textContent || `User ID ${userIdToUpdate}`;

    if (!confirm(`Change role for ${userEmailText} from '${originalRole}' to '${newRole}'?`)) {
        selectElement.value = originalRole; // Revert on cancel
        return;
    }

    console.log(`Updating role for ${userIdToUpdate} to ${newRole}`);
    selectElement.disabled = true; // Disable during update

    try {
        const userRef = db.collection('users').doc(userIdToUpdate);
        await userRef.update({ role: newRole });
        alert(`Role updated successfully for ${userEmailText}.`);
        console.log(`Role updated for ${userIdToUpdate}`);
        // Update stored original role and display text
        selectElement.dataset.originalRole = newRole;
        const roleTextElement = selectElement.closest('.user-list-item')?.querySelector('.user-role strong');
        if (roleTextElement) roleTextElement.textContent = newRole;

    } catch (error) {
        console.error(`Error updating role for ${userIdToUpdate}:`, error);
        alert(`Failed to update role: ${error.message}`);
        selectElement.value = originalRole; // Revert on error
    } finally {
        selectElement.disabled = false; // Re-enable
    }
}

// --- Utility Helpers ---

// Download CSV content as a file
function downloadCSV(csvContent, fileName) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // Feature detection
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up
    } else {
        // Fallback for older browsers (less common now)
        navigator.msSaveBlob(blob, fileName);
    }
}

// Format date string as "MMM D, YYYY" (e.g., Aug 21, 2023)
function formatDate(dateInput) {
    if (!dateInput) return 'N/A';
    let date;
    if (dateInput.toDate) { // Firestore Timestamp
        date = dateInput.toDate();
    } else {
         // Try creating date, ensuring UTC parts are used if it's just YYYY-MM-DD
         const parts = String(dateInput).split('-');
         if (parts.length === 3) {
            date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
         } else {
             date = new Date(dateInput); // General fallback
         }
    }

    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleDateString('en-US', { // en-GB for dd/mm/yyyy
        year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' // Use UTC to prevent off-by-one day
    });
}


// Format month string "YYYY-MM" as "Month YYYY" (e.g., August 2023)
function formatMonth(monthString) {
    if (!monthString || monthString.length !== 7) return monthString || 'N/A';
    try {
        const [year, month] = monthString.split('-');
        const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', timeZone: 'UTC' });
    } catch (e) { return monthString; }
}

// Format Firestore Timestamp or Date object as readable date/time
function formatDateTime(timestamp) {
    if (!timestamp) return 'N/A';
    let date;
    if (timestamp.toDate) date = timestamp.toDate(); // Firestore Timestamp
    else if (timestamp instanceof Date) date = timestamp; // JS Date
    else date = new Date(timestamp); // Attempt parse

    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleString('en-US', { // Or 'en-GB'
        year: 'numeric', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit' // hour12: true (optional)
    });
}

// Basic HTML escaping
function escapeHtml(unsafe) {
    if (unsafe === null || typeof unsafe === 'undefined') return '';
    return unsafe.toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// Helper to format CSV cells (quotes, commas)
function formatCsvCell(cell) {
     const cellStr = String(cell ?? ''); // Handle null/undefined -> empty string
     if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
         return `"${cellStr.replace(/"/g, '""')}"`; // Escape internal quotes
     }
     return cellStr;
}


// Helper to check if a section is currently visible
function isSectionVisible(sectionId) {
    const section = document.getElementById(`${sectionId}-section`);
    return section && !section.classList.contains('hidden');
}

// Helper for report status colors/text
function getComplianceStatus(rate) {
    if (rate >= 90) return { statusClass: 'excellent', statusText: 'Excellent' };
    if (rate >= 75) return { statusClass: 'good', statusText: 'Good' };
    if (rate >= 50) return { statusClass: 'fair', statusText: 'Fair' };
    return { statusClass: 'poor', statusText: 'Needs Improvement' };
}
function getComplianceColor(rate) {
    if (rate >= 90) return '#2a9d8f'; // Success
    if (rate >= 75) return '#0077b6'; // Good (Blueish)
    if (rate >= 50) return '#f4a261'; // Fair (Warning)
    return '#e76f51'; // Poor (Danger)
}

// --- Run Initialization on Load ---
document.addEventListener('DOMContentLoaded', init);
```

---

**4. `firestore.rules`**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to get user's role from the 'users' collection
    // Returns null if user doc or role field doesn't exist
    function getUserRole(userId) {
      return get(/databases/$(database)/documents/users/$(userId)).data.role;
    }

    // Helper function to check if the authenticated user is the owner of the audit document
    function isAuditOwner(auditDoc) {
       // Check if user is authenticated and their UID matches the createdBy field
       return request.auth != null && request.auth.uid == auditDoc.data.createdBy;
    }

    // Users Collection Rules
    match /users/{userId} {
      // Allow authenticated users to read their own profile
      // Allow admins to read any user profile (for user management)
      allow read: if request.auth != null
                   && (request.auth.uid == userId || getUserRole(request.auth.uid) == 'admin');

      // Allow authenticated users to create their OWN profile document initially
      // IMPORTANT: Prevent users setting their own role to 'admin' on creation.
      //            Only allow 'auditor' or 'lead_auditor' if needed, otherwise only admin should set roles.
      // Recommendation: Disable user self-creation here (allow create: if false;) and have Admin create profiles.
      allow create: if request.auth != null
                    && request.auth.uid == userId
                    && request.resource.data.role != 'admin'; // Cannot self-assign admin

      // Allow Admins to update any user's profile (including role)
      // Allow users to update their own profile data *EXCEPT* the 'role' field
      allow update: if request.auth != null && (
                      // Admin can update anything
                      (getUserRole(request.auth.uid) == 'admin')
                      ||
                      // User can update own data, BUT cannot change the 'role' field
                      (request.auth.uid == userId && !('role' in request.resource.data))
                     );

      // Disallow deletion of user profiles by default. Can be enabled for Admins if necessary.
      allow delete: if false; // Or: if request.auth != null && getUserRole(request.auth.uid) == 'admin';
    }

    // Audits Collection Rules
    match /audits/{auditId} {

      // Allow read for Admin, Lead Auditor, Auditor roles
      allow read: if request.auth != null
                   && getUserRole(request.auth.uid) in ['admin', 'lead_auditor', 'auditor'];

      // Allow create for Admin, Lead Auditor, Auditor roles
      // Ensure createdBy matches the authenticated user's UID
      // Ensure initial status is either 'draft' or 'submitted' (can't create in other states)
      allow create: if request.auth != null
                     && getUserRole(request.auth.uid) in ['admin', 'lead_auditor', 'auditor']
                     && request.resource.data.createdBy == request.auth.uid // Owner must match creator
                     && request.resource.data.status in ['draft', 'submitted']; // Valid initial status

      // Allow update under specific conditions:
      allow update: if request.auth != null
                     // Condition 0: Cannot change the 'createdBy' field after creation
                     && !('createdBy' in request.resource.data)
                     // Condition Group: Who can update?
                     && (
                       // Condition 1: Admins can update any audit document
                       (getUserRole(request.auth.uid) == 'admin')
                       ||
                       // Condition 2: Lead Auditors can update any audit IF its current status is 'draft'
                       (getUserRole(request.auth.uid) == 'lead_auditor' && resource.data.status == 'draft')
                       ||
                       // Condition 3: Auditors can update an audit IF they are the owner AND its current status is 'draft'
                       (getUserRole(request.auth.uid) == 'auditor' && isAuditOwner(resource) && resource.data.status == 'draft')
                     );
                     // Note: This rule allows changing the status field (e.g., draft -> submitted)
                     // by anyone matching the conditions above, provided the *starting* status allows the update.
                     // For example, an Auditor can change their own draft to submitted. A Lead Auditor can change anyone's draft to submitted.

      // Allow delete only for users with the Admin role
      allow delete: if request.auth != null && getUserRole(request.auth.uid) == 'admin';
    }
  }
}
```