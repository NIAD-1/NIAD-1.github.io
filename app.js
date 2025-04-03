// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCLp8nKO2rb7yMyaL0mM6sJOzoFRmm0BdI",
    authDomain: "internalaudit-2cd8c.firebaseapp.com",
    projectId: "internalaudit-2cd8c",
    storageBucket: "internalaudit-2cd8c.firebasestorage.app",
    messagingSenderId: "510488169711",
    appId: "1:510488169711:web:271ed61bd7c4e6c14c5f1a",
    measurementId: "G-43ESSX8GLJ"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// DOM Elements
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

// Audit Checklist Data
const auditChecklist = [
    {
        id: 1,
        requirement: "Identification of interested parties and needs",
        clause: "4.1"
    },
    {
        id: 2,
        requirement: "Process flow (interaction)",
        clause: "4.4"
    },
    {
        id: 3,
        requirement: "Organogram",
        clause: "4.4.1"
    },
    {
        id: 4,
        requirement: "Master list, SOP index, Records list",
        clause: "4.4.1"
    },
    {
        id: 5,
        requirement: "Quality manual - awareness",
        clause: "4.1"
    },
    {
        id: 6,
        requirement: "Quality Policy - awareness",
        clause: "5.2.2"
    },
    {
        id: 7,
        requirement: "JD for Quality manager, Appointment letter /acceptance, Appointment of quality team",
        clause: "5.3"
    },
    {
        id: 8,
        requirement: "SOP Risk management, Training /awareness, Constitution of RMT, Risk identification, Risk analysis /risk register, Use of annexures",
        clause: "6.1.1"
    },
    {
        id: 9,
        requirement: "Quality objectives, Awareness, Action plan",
        clause: "6.2"
    },
    {
        id: 10,
        requirement: "SOP change management, Awareness, Any Changes?? Was SOP followed",
        clause: "6.3"
    },
    {
        id: 11,
        requirement: "Nominal roll, Signature atlas",
        clause: ""
    },
    {
        id: 12,
        requirement: "Adequacy of space /equipment for QM activities",
        clause: "7.1.3"
    },
    {
        id: 13,
        requirement: "SOP Measuring and Monitoring of resources, Awareness, Implementation of SOP",
        clause: "7.1.5"
    },
    {
        id: 14,
        requirement: "SOP organizational knowledge, Awareness, Any library?",
        clause: "7.1.6"
    },
    {
        id: 15,
        requirement: "Training plan, Training records, Training SOP and awareness, Use of annexures in SOP, Competency matrix, Staff JD",
        clause: "7.2"
    },
    {
        id: 16,
        requirement: "Communication matrix, Implementation of matrix",
        clause: "7.4"
    },
    {
        id: 17,
        requirement: "SOP of SOP's, awareness and implementation in process SOP's",
        clause: "7.5.1"
    },
    {
        id: 18,
        requirement: "SOP documented information -awareness, Implementation",
        clause: "7.5.3.1, 4.4.2"
    },
    {
        id: 19,
        requirement: "Operational SOP's, Awareness, Compliant to format/structure, Evidence of use, Appropriateness",
        clause: "8.1"
    },
    {
        id: 20,
        requirement: "Addressing customer complaint, Feedback system",
        clause: "8.2"
    },
    {
        id: 21,
        requirement: "SOP Non -conforming output -awareness",
        clause: "8.7"
    },
    {
        id: 22,
        requirement: "KPI matrix",
        clause: "9.1"
    },
    {
        id: 23,
        requirement: "Evaluation of measurable output, feedback survey?",
        clause: ""
    },
    {
        id: 24,
        requirement: "SOP internal audit -awareness, Audit plan, Audit report",
        clause: ""
    },
    {
        id: 25,
        requirement: "Management review plan, Agenda and Minutes",
        clause: "9.3.2"
    },
    {
        id: 26,
        requirement: "SOP corrective action, Awareness, Implementation",
        clause: "10.2"
    },
    {
        id: 27,
        requirement: "PROCESS SOP'S, Adequacy and use",
        clause: "4.4.2, 8.1"
    }
];

// Global Variables
let currentUser = null;
let audits = [];
let currentAudit = null;

// Initialize the app
function init() {
    setupEventListeners();
    checkAuthState();
}

// Set up event listeners
function setupEventListeners() {
    // Auth events
    loginBtn.addEventListener('click', loginWithEmail);
    googleLoginBtn.addEventListener('click', loginWithGoogle);
    logoutBtn.addEventListener('click', logout);
    
    // Navigation events
    navItems.forEach(item => {
        item.addEventListener('click', () => switchSection(item.dataset.section));
    });
    
    // Quick actions
    quickNewAuditBtn.addEventListener('click', () => switchSection('new-audit'));
    quickExportBtn.addEventListener('click', exportDashboardData);
    
    // New audit form events
    document.getElementById('save-draft-btn')?.addEventListener('click', saveAuditAsDraft);
    document.getElementById('submit-audit-btn')?.addEventListener('click', submitAudit);
    
    // Audit history events
    document.getElementById('filter-btn')?.addEventListener('click', filterAudits);
    
    // Reports events
    document.getElementById('generate-report-btn')?.addEventListener('click', generateReport);
    document.getElementById('export-csv-btn')?.addEventListener('click', exportReportToCSV);
    document.getElementById('report-period')?.addEventListener('change', toggleCustomDateRange);
    
    // Modal events
    document.querySelector('.close-modal')?.addEventListener('click', closeModal);
    document.getElementById('close-modal-btn')?.addEventListener('click', closeModal);
    document.getElementById('export-audit-btn')?.addEventListener('click', exportCurrentAudit);
    document.getElementById('edit-audit-btn')?.addEventListener('click', editAudit);
}

// Check auth state
function checkAuthState() {
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            userEmail.textContent = user.email;
            loginScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
            loadAudits();
            switchSection('dashboard');
        } else {
            currentUser = null;
            loginScreen.classList.remove('hidden');
            appContainer.classList.add('hidden');
        }
    });
}

// Login with email/password
function loginWithEmail() {
    const email = loginEmail.value;
    const password = loginPassword.value;
    
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => {
            loginError.textContent = error.message;
        });
}

// Login with Google
function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .catch(error => {
            loginError.textContent = error.message;
        });
}

// Logout
function logout() {
    auth.signOut();
}

// Switch between sections
function switchSection(sectionId) {
    // Update active nav item
    navItems.forEach(item => {
        if (item.dataset.section === sectionId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Show the selected section
    contentSections.forEach(section => {
        if (section.id === `${sectionId}-section`) {
            section.classList.remove('hidden');
            
            // Initialize section if needed
            if (sectionId === 'new-audit') {
                initNewAuditForm();
            } else if (sectionId === 'dashboard') {
                renderDashboard();
            } else if (sectionId === 'audit-history') {
                renderAuditHistory();
            } else if (sectionId === 'reports') {
                initReportControls();
            }
        } else {
            section.classList.add('hidden');
        }
    });
}

// Initialize new audit form
function initNewAuditForm() {
    const checklistContainer = document.getElementById('checklist-container');
    checklistContainer.innerHTML = '';
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('audit-date').value = today;
    
    // Create checklist items
    auditChecklist.forEach(item => {
        const checklistItem = document.createElement('div');
        checklistItem.className = 'checklist-item';
        checklistItem.innerHTML = `
            <h4>${item.requirement} ${item.clause ? `(Clause ${item.clause})` : ''}</h4>
            <div class="compliance-toggle">
                <button class="compliance-btn" data-compliance="yes">Compliant</button>
                <button class="compliance-btn" data-compliance="no">Non-Compliant</button>
            </div>
            <div class="form-group">
                <label>Objective Evidence:</label>
                <textarea class="evidence-input" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label>Comments:</label>
                <textarea class="comments-input" rows="2"></textarea>
            </div>
        `;
        checklistContainer.appendChild(checklistItem);
        
        // Add event listeners to compliance buttons
        const complianceBtns = checklistItem.querySelectorAll('.compliance-btn');
        complianceBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                complianceBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    });
    
    // Reset current audit
    currentAudit = null;
}

// Save audit as draft
function saveAuditAsDraft() {
    const auditData = collectAuditFormData();
    auditData.status = 'draft';
    saveAuditToFirestore(auditData);
}

// Submit audit
function submitAudit() {
    const auditData = collectAuditFormData();
    auditData.status = 'submitted';
    auditData.submittedAt = new Date();
    saveAuditToFirestore(auditData);
}

// Collect data from audit form
function collectAuditFormData() {
    const auditDate = document.getElementById('audit-date').value;
    const auditedArea = document.getElementById('audited-area').value;
    
    const checklistItems = document.querySelectorAll('.checklist-item');
    const checklistData = [];
    
    checklistItems.forEach((item, index) => {
        const complianceBtn = item.querySelector('.compliance-btn.active');
        const compliance = complianceBtn ? complianceBtn.dataset.compliance : '';
        const evidence = item.querySelector('.evidence-input').value;
        const comments = item.querySelector('.comments-input').value;
        
        checklistData.push({
            id: auditChecklist[index].id,
            requirement: auditChecklist[index].requirement,
            clause: auditChecklist[index].clause,
            compliance: compliance,
            objectiveEvidence: evidence,
            comments: comments
        });
    });
    
    return {
        date: auditDate,
        auditedArea: auditedArea,
        checklist: checklistData,
        createdBy: currentUser.uid,
        createdAt: new Date(),
        lastModified: new Date()
    };
}

// Save audit to Firestore
function saveAuditToFirestore(auditData) {
    let promise;
    
    if (currentAudit && currentAudit.id) {
        // Update existing audit
        const auditRef = db.collection('audits').doc(currentAudit.id);
        promise = auditRef.update({
            ...auditData,
            lastModified: new Date()
        });
    } else {
        // Create new audit
        promise = db.collection('audits').add(auditData);
    }
    
    promise
        .then(() => {
            alert('Audit saved successfully!');
            loadAudits();
            switchSection('audit-history');
        })
        .catch(error => {
            alert('Error saving audit: ' + error.message);
        });
}

// Load audits from Firestore
function loadAudits() {
    db.collection('audits')
        .where('createdBy', '==', currentUser.uid)
        .orderBy('createdAt', 'desc')
        .get()
        .then(querySnapshot => {
            audits = [];
            querySnapshot.forEach(doc => {
                audits.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Update UI
            if (document.getElementById('dashboard-section').classList.contains('hidden') === false) {
                renderDashboard();
            }
            
            if (document.getElementById('audit-history-section').classList.contains('hidden') === false) {
                renderAuditHistory();
            }
            
            // Update area filter dropdown
            updateAreaFilter();
        })
        .catch(error => {
            console.error('Error loading audits: ', error);
        });
}

// Render dashboard
function renderDashboard() {
    // Calculate compliance stats
    const totalItems = audits.reduce((sum, audit) => sum + audit.checklist.length, 0);
    const compliantItems = audits.reduce((sum, audit) => {
        return sum + audit.checklist.filter(item => item.compliance === 'yes').length;
    }, 0);
    const complianceRate = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 0;
    
    // Render compliance chart
    renderComplianceChart(complianceRate);
    
    // Render recent audits
    renderRecentAudits();
    
    // Render non-conformance chart
    renderNonConformanceChart();
}

// Render compliance chart
function renderComplianceChart(complianceRate) {
    const ctx = document.getElementById('compliance-chart').getContext('2d');
    
    if (window.complianceChart) {
        window.complianceChart.destroy();
    }
    
    window.complianceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Compliant', 'Non-Compliant'],
            datasets: [{
                data: [complianceRate, 100 - complianceRate],
                backgroundColor: ['#27ae60', '#e74c3c'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });
}

// Render recent audits
function renderRecentAudits() {
    const recentAuditsList = document.getElementById('recent-audits-list');
    recentAuditsList.innerHTML = '';
    
    const recentAudits = audits.slice(0, 5);
    
    if (recentAudits.length === 0) {
        recentAuditsList.innerHTML = '<p>No recent audits found.</p>';
        return;
    }
    
    recentAudits.forEach(audit => {
        const auditItem = document.createElement('div');
        auditItem.className = 'audit-item';
        auditItem.innerHTML = `
            <div>
                <strong>${audit.auditedArea}</strong>
                <div class="date">${formatDate(audit.date)}</div>
            </div>
            <span class="status status-${audit.status}">${audit.status}</span>
        `;
        auditItem.addEventListener('click', () => openAuditDetails(audit));
        recentAuditsList.appendChild(auditItem);
    });
}

// Render non-conformance chart
function renderNonConformanceChart() {
    // Group non-conformances by area
    const ncByArea = {};
    
    audits.forEach(audit => {
        const nonCompliantItems = audit.checklist.filter(item => item.compliance === 'no').length;
        
        if (ncByArea[audit.auditedArea]) {
            ncByArea[audit.auditedArea] += nonCompliantItems;
        } else {
            ncByArea[audit.auditedArea] = nonCompliantItems;
        }
    });
    
    const ctx = document.getElementById('nc-chart').getContext('2d');
    
    if (window.ncChart) {
        window.ncChart.destroy();
    }
    
    const areas = Object.keys(ncByArea);
    const ncCounts = areas.map(area => ncByArea[area]);
    
    window.ncChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: areas,
            datasets: [{
                label: 'Non-Conformances',
                data: ncCounts,
                backgroundColor: '#e74c3c'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Non-Conformances'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Audited Area'
                    }
                }
            }
        }
    });
}

// Render audit history
function renderAuditHistory() {
    const auditHistoryList = document.getElementById('audit-history-list');
    auditHistoryList.innerHTML = '';
    
    if (audits.length === 0) {
        auditHistoryList.innerHTML = '<p>No audits found.</p>';
        return;
    }
    
    audits.forEach(audit => {
        const auditItem = document.createElement('div');
        auditItem.className = 'audit-item';
        auditItem.innerHTML = `
            <div>
                <strong>${audit.auditedArea}</strong>
                <div class="date">${formatDate(audit.date)} • ${formatDateTime(audit.createdAt)}</div>
            </div>
            <span class="status status-${audit.status}">${audit.status}</span>
        `;
        auditItem.addEventListener('click', () => openAuditDetails(audit));
        auditHistoryList.appendChild(auditItem);
    });
}

// Open audit details modal
function openAuditDetails(audit) {
    currentAudit = audit;
    const modal = document.getElementById('audit-detail-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    
    modalTitle.textContent = `Audit Details: ${audit.auditedArea} (${formatDate(audit.date)})`;
    
    // Build modal content
    let content = `
        <div class="audit-meta">
            <p><strong>Status:</strong> <span class="status status-${audit.status}">${audit.status}</span></p>
            <p><strong>Created:</strong> ${formatDateTime(audit.createdAt)}</p>
            ${audit.lastModified ? `<p><strong>Last Modified:</strong> ${formatDateTime(audit.lastModified)}</p>` : ''}
            ${audit.submittedAt ? `<p><strong>Submitted:</strong> ${formatDateTime(audit.submittedAt)}</p>` : ''}
        </div>
        
        <h3>Checklist Items</h3>
        <div class="checklist-summary">
    `;
    
    // Add checklist items
    audit.checklist.forEach(item => {
        content += `
            <div class="checklist-item-summary">
                <h4>${item.id}. ${item.requirement} ${item.clause ? `(Clause ${item.clause})` : ''}</h4>
                <p><strong>Status:</strong> <span class="${item.compliance === 'yes' ? 'compliant' : 'non-compliant'}">
                    ${item.compliance === 'yes' ? 'Compliant' : 'Non-Compliant'}
                </span></p>
                ${item.objectiveEvidence ? `<p><strong>Objective Evidence:</strong> ${item.objectiveEvidence}</p>` : ''}
                ${item.comments ? `<p><strong>Comments:</strong> ${item.comments}</p>` : ''}
            </div>
        `;
    });
    
    content += `</div>`;
    
    // Add history if available
    if (audit.history && audit.history.length > 0) {
        content += `
            <h3>Audit History</h3>
            <div class="audit-history">
        `;
        
        audit.history.forEach(record => {
            content += `
                <div class="history-record">
                    <p><strong>${formatDateTime(record.timestamp)}</strong> by ${record.changedBy}</p>
                    <pre>${JSON.stringify(record.changes, null, 2)}</pre>
                </div>
            `;
        });
        
        content += `</div>`;
    }
    
    modalContent.innerHTML = content;
    modal.classList.remove('hidden');
}

// Close modal
function closeModal() {
    document.getElementById('audit-detail-modal').classList.add('hidden');
}

// Export current audit to CSV
function exportCurrentAudit() {
    if (!currentAudit) return;
    
    const headers = ['ID', 'Requirement', 'Clause', 'Compliance', 'Objective Evidence', 'Comments'];
    const rows = currentAudit.checklist.map(item => [
        item.id,
        `"${item.requirement.replace(/"/g, '""')}"`,
        item.clause,
        item.compliance === 'yes' ? 'Compliant' : 'Non-Compliant',
        `"${(item.objectiveEvidence || '').replace(/"/g, '""')}"`,
        `"${(item.comments || '').replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [
        `"NAFDAC Audit Report - ${currentAudit.auditedArea} - ${formatDate(currentAudit.date)}"`,
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    downloadCSV(csvContent, `nafdac_audit_${currentAudit.auditedArea}_${currentAudit.date}.csv`);
}

// Edit audit
function editAudit() {
    if (!currentAudit) return;
    
    // Set form values
    document.getElementById('audit-date').value = currentAudit.date;
    document.getElementById('audited-area').value = currentAudit.auditedArea;
    
    // Set checklist values
    const checklistItems = document.querySelectorAll('.checklist-item');
    checklistItems.forEach((item, index) => {
        const auditItem = currentAudit.checklist[index];
        
        // Set compliance buttons
        const complianceBtns = item.querySelectorAll('.compliance-btn');
        complianceBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.compliance === auditItem.compliance) {
                btn.classList.add('active');
            }
        });
        
        // Set evidence and comments
        item.querySelector('.evidence-input').value = auditItem.objectiveEvidence || '';
        item.querySelector('.comments-input').value = auditItem.comments || '';
    });
    
    // Switch to new audit section
    switchSection('new-audit');
    closeModal();
}

// Filter audits
function filterAudits() {
    const fromDate = document.getElementById('date-from').value;
    const toDate = document.getElementById('date-to').value;
    const areaFilter = document.getElementById('audit-area-filter').value;
    
    let filteredAudits = [...audits];
    
    // Apply date filter
    if (fromDate) {
        filteredAudits = filteredAudits.filter(audit => audit.date >= fromDate);
    }
    
    if (toDate) {
        filteredAudits = filteredAudits.filter(audit => audit.date <= toDate);
    }
    
    // Apply area filter
    if (areaFilter) {
        filteredAudits = filteredAudits.filter(audit => audit.auditedArea === areaFilter);
    }
    
    // Render filtered audits
    const auditHistoryList = document.getElementById('audit-history-list');
    auditHistoryList.innerHTML = '';
    
    if (filteredAudits.length === 0) {
        auditHistoryList.innerHTML = '<p>No audits match the selected filters.</p>';
        return;
    }
    
    filteredAudits.forEach(audit => {
        const auditItem = document.createElement('div');
        auditItem.className = 'audit-item';
        auditItem.innerHTML = `
            <div>
                <strong>${audit.auditedArea}</strong>
                <div class="date">${formatDate(audit.date)} • ${formatDateTime(audit.createdAt)}</div>
            </div>
            <span class="status status-${audit.status}">${audit.status}</span>
        `;
        auditItem.addEventListener('click', () => openAuditDetails(audit));
        auditHistoryList.appendChild(auditItem);
    });
}

// Update area filter dropdown
function updateAreaFilter() {
    const areaFilter = document.getElementById('audit-area-filter');
    
    // Clear existing options except the first one
    while (areaFilter.options.length > 1) {
        areaFilter.remove(1);
    }
    
    // Get unique areas
    const areas = [...new Set(audits.map(audit => audit.auditedArea))];
    
    // Add area options
    areas.forEach(area => {
        const option = document.createElement('option');
        option.value = area;
        option.textContent = area;
        areaFilter.appendChild(option);
    });
}

// Initialize report controls
function initReportControls() {
    // Set default dates
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    document.getElementById('report-from').value = lastMonth.toISOString().split('T')[0];
    document.getElementById('report-to').value = today.toISOString().split('T')[0];
}

// Toggle custom date range
function toggleCustomDateRange() {
    const periodSelect = document.getElementById('report-period');
    const customRange = document.getElementById('custom-date-range');
    
    if (periodSelect.value === 'custom') {
        customRange.classList.remove('hidden');
    } else {
        customRange.classList.add('hidden');
    }
}

// Generate report
function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const period = document.getElementById('report-period').value;
    
    let fromDate, toDate;
    const today = new Date();
    
    // Determine date range based on period selection
    if (period === 'custom') {
        fromDate = document.getElementById('report-from').value;
        toDate = document.getElementById('report-to').value;
    } else {
        toDate = today.toISOString().split('T')[0];
        
        const tempDate = new Date();
        if (period === 'last-month') {
            tempDate.setMonth(tempDate.getMonth() - 1);
        } else if (period === 'last-quarter') {
            tempDate.setMonth(tempDate.getMonth() - 3);
        } else if (period === 'last-year') {
            tempDate.setFullYear(tempDate.getFullYear() - 1);
        }
        
        fromDate = tempDate.toISOString().split('T')[0];
    }
    
    // Filter audits for the selected period
    const reportAudits = audits.filter(audit => {
        return audit.date >= fromDate && audit.date <= toDate;
    });
    
    // Generate report based on type
    if (reportType === 'compliance') {
        generateComplianceReport(reportAudits, fromDate, toDate);
    } else if (reportType === 'non-conformance') {
        generateNonConformanceReport(reportAudits, fromDate, toDate);
    } else if (reportType === 'trend') {
        generateTrendReport(reportAudits, fromDate, toDate);
    }
}

// Generate compliance report
function generateComplianceReport(audits, fromDate, toDate) {
    if (audits.length === 0) {
        document.getElementById('report-table-container').innerHTML = '<p>No audit data available for the selected period.</p>';
        return;
    }
    
    // Calculate compliance by area
    const complianceByArea = {};
    
    audits.forEach(audit => {
        const totalItems = audit.checklist.length;
        const compliantItems = audit.checklist.filter(item => item.compliance === 'yes').length;
        const complianceRate = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 0;
        
        complianceByArea[audit.auditedArea] = complianceRate;
    });
    
    // Render chart
    const ctx = document.getElementById('report-chart').getContext('2d');
    
    if (window.reportChart) {
        window.reportChart.destroy();
    }
    
    const areas = Object.keys(complianceByArea);
    const complianceRates = areas.map(area => complianceByArea[area]);
    
    window.reportChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: areas,
            datasets: [{
                label: 'Compliance Rate (%)',
                data: complianceRates,
                backgroundColor: '#3498db'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Compliance Rate (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Audited Area'
                    }
                }
            }
        }
    });
    
    // Render table
    let tableHTML = `
        <h3>Compliance Summary (${formatDate(fromDate)} to ${formatDate(toDate)})</h3>
        <table class="report-table">
            <thead>
                <tr>
                    <th>Audited Area</th>
                    <th>Compliance Rate</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    areas.forEach(area => {
        const rate = complianceByArea[area];
        let statusClass = '';
        let statusText = '';
        
        if (rate >= 90) {
            statusClass = 'excellent';
            statusText = 'Excellent';
        } else if (rate >= 75) {
            statusClass = 'good';
            statusText = 'Good';
        } else if (rate >= 50) {
            statusClass = 'fair';
            statusText = 'Fair';
        } else {
            statusClass = 'poor';
            statusText = 'Needs Improvement';
        }
        
        tableHTML += `
            <tr>
                <td>${area}</td>
                <td>${rate}%</td>
                <td class="${statusClass}">${statusText}</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    document.getElementById('report-table-container').innerHTML = tableHTML;
}

// Generate non-conformance report
function generateNonConformanceReport(audits, fromDate, toDate) {
    if (audits.length === 0) {
        document.getElementById('report-table-container').innerHTML = '<p>No audit data available for the selected period.</p>';
        return;
    }
    
    // Group non-conformances by requirement
    const ncByRequirement = {};
    let totalNC = 0;
    
    audits.forEach(audit => {
        audit.checklist.forEach(item => {
            if (item.compliance === 'no') {
                if (ncByRequirement[item.requirement]) {
                    ncByRequirement[item.requirement]++;
                } else {
                    ncByRequirement[item.requirement] = 1;
                }
                totalNC++;
            }
        });
    });
    
    // Sort by frequency (descending)
    const sortedRequirements = Object.keys(ncByRequirement).sort((a, b) => {
        return ncByRequirement[b] - ncByRequirement[a];
    });
    
    // Render chart
    const ctx = document.getElementById('report-chart').getContext('2d');
    
    if (window.reportChart) {
        window.reportChart.destroy();
    }
    
    // Show top 10 non-conformances
    const topN = 10;
    const topRequirements = sortedRequirements.slice(0, topN);
    const topCounts = topRequirements.map(req => ncByRequirement[req]);
    
    window.reportChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: topRequirements.map(req => req.length > 50 ? req.substring(0, 50) + '...' : req),
            datasets: [{
                label: 'Number of Non-Conformances',
                data: topCounts,
                backgroundColor: '#e74c3c'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Non-Conformances'
                    }
                }
            }
        }
    });
    
    // Render table
    let tableHTML = `
        <h3>Non-Conformance Details (${formatDate(fromDate)} to ${formatDate(toDate)})</h3>
        <p>Total Non-Conformances: ${totalNC}</p>
        <table class="report-table">
            <thead>
                <tr>
                    <th>Requirement</th>
                    <th>Clause</th>
                    <th>Count</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    sortedRequirements.forEach(req => {
        const count = ncByRequirement[req];
        const percentage = totalNC > 0 ? Math.round((count / totalNC) * 100) : 0;
        const clause = auditChecklist.find(item => item.requirement === req)?.clause || '';
        
        tableHTML += `
            <tr>
                <td>${req.length > 100 ? req.substring(0, 100) + '...' : req}</td>
                <td>${clause}</td>
                <td>${count}</td>
                <td>${percentage}%</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    document.getElementById('report-table-container').innerHTML = tableHTML;
}

// Generate trend report
function generateTrendReport(audits, fromDate, toDate) {
    if (audits.length === 0) {
        document.getElementById('report-table-container').innerHTML = '<p>No audit data available for the selected period.</p>';
        return;
    }
    
    // Group audits by month and calculate monthly compliance
    const monthlyData = {};
    
    audits.forEach(audit => {
        const month = audit.date.substring(0, 7); // YYYY-MM format
        
        if (!monthlyData[month]) {
            monthlyData[month] = {
                totalItems: 0,
                compliantItems: 0
            };
        }
        
        monthlyData[month].totalItems += audit.checklist.length;
        monthlyData[month].compliantItems += audit.checklist.filter(item => item.compliance === 'yes').length;
    });
    
    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyData).sort();
    
    // Prepare chart data
    const complianceRates = sortedMonths.map(month => {
        const data = monthlyData[month];
        return data.totalItems > 0 ? Math.round((data.compliantItems / data.totalItems) * 100) : 0;
    });
    
    // Render chart
    const ctx = document.getElementById('report-chart').getContext('2d');
    
    if (window.reportChart) {
        window.reportChart.destroy();
    }
    
    window.reportChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedMonths,
            datasets: [{
                label: 'Compliance Rate (%)',
                data: complianceRates,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Compliance Rate (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Month'
                    }
                }
            }
        }
    });
    
    // Render table
    let tableHTML = `
        <h3>Compliance Trend (${formatDate(fromDate)} to ${formatDate(toDate)})</h3>
        <table class="report-table">
            <thead>
                <tr>
                    <th>Month</th>
                    <th>Audits</th>
                    <th>Items Checked</th>
                    <th>Compliant Items</th>
                    <th>Compliance Rate</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    sortedMonths.forEach(month => {
        const data = monthlyData[month];
        const rate = data.totalItems > 0 ? Math.round((data.compliantItems / data.totalItems) * 100) : 0;
        const monthAudits = audits.filter(audit => audit.date.startsWith(month));
        
        tableHTML += `
            <tr>
                <td>${formatMonth(month)}</td>
                <td>${monthAudits.length}</td>
                <td>${data.totalItems}</td>
                <td>${data.compliantItems}</td>
                <td>${rate}%</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    document.getElementById('report-table-container').innerHTML = tableHTML;
}

// Export report to CSV
function exportReportToCSV() {
    const reportType = document.getElementById('report-type').value;
    const period = document.getElementById('report-period').value;
    const fromDate = document.getElementById('report-from').value;
    const toDate = document.getElementById('report-to').value;
    
    let csvContent = '';
    let fileName = '';
    
    if (reportType === 'compliance') {
        // Generate compliance CSV
        fileName = `compliance_report_${fromDate}_to_${toDate}.csv`;
        
        // Get data from the table
        const table = document.querySelector('.report-table');
        if (!table) return;
        
        const rows = table.querySelectorAll('tr');
        const csvRows = [];
        
        rows.forEach(row => {
            const cols = row.querySelectorAll('th, td');
            const csvCols = Array.from(cols).map(col => {
                // Handle quotes and commas in content
                let text = col.textContent.trim();
                if (text.includes(',') || text.includes('"')) {
                    text = `"${text.replace(/"/g, '""')}"`;
                }
                return text;
            });
            csvRows.push(csvCols.join(','));
        });
        
        csvContent = csvRows.join('\n');
    } else if (reportType === 'non-conformance') {
        // Generate non-conformance CSV
        fileName = `non_conformance_report_${fromDate}_to_${toDate}.csv`;
        
        // Get data from the table
        const table = document.querySelector('.report-table');
        if (!table) return;
        
        const rows = table.querySelectorAll('tr');
        const csvRows = [];
        
        rows.forEach(row => {
            const cols = row.querySelectorAll('th, td');
            const csvCols = Array.from(cols).map(col => {
                let text = col.textContent.trim();
                if (text.includes(',') || text.includes('"')) {
                    text = `"${text.replace(/"/g, '""')}"`;
                }
                return text;
            });
            csvRows.push(csvCols.join(','));
        });
        
        csvContent = csvRows.join('\n');
    } else if (reportType === 'trend') {
        // Generate trend CSV
        fileName = `compliance_trend_${fromDate}_to_${toDate}.csv`;
        
        // Get data from the table
        const table = document.querySelector('.report-table');
        if (!table) return;
        
        const rows = table.querySelectorAll('tr');
        const csvRows = [];
        
        rows.forEach(row => {
            const cols = row.querySelectorAll('th, td');
            const csvCols = Array.from(cols).map(col => {
                let text = col.textContent.trim();
                if (text.includes(',') || text.includes('"')) {
                    text = `"${text.replace(/"/g, '""')}"`;
                }
                return text;
            });
            csvRows.push(csvCols.join(','));
        });
        
        csvContent = csvRows.join('\n');
    }
    
    if (csvContent) {
        downloadCSV(csvContent, fileName);
    }
}

// Export dashboard data
function exportDashboardData() {
    if (audits.length === 0) {
        alert('No audit data available to export.');
        return;
    }
    
    // Prepare comprehensive CSV data
    const headers = ['Audit ID', 'Date', 'Audited Area', 'Status', 'Checklist Item', 'Clause', 'Compliance', 'Objective Evidence', 'Comments'];
    const rows = [];
    
    audits.forEach(audit => {
        audit.checklist.forEach(item => {
            rows.push([
                audit.id,
                audit.date,
                audit.auditedArea,
                audit.status,
                item.requirement,
                item.clause,
                item.compliance === 'yes' ? 'Compliant' : 'Non-Compliant',
                item.objectiveEvidence || '',
                item.comments || ''
            ]);
        });
    });
    
    // Format CSV content
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => {
            // Escape quotes and wrap in quotes if contains comma
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
                return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        }).join(','))
    ].join('\n');
    
    downloadCSV(csvContent, 'nafdac_audit_data_export.csv');
}

// Download CSV file
function downloadCSV(content, fileName) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Helper function to format month
function formatMonth(monthString) {
    if (!monthString) return '';
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

// Helper function to format date/time
function formatDateTime(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);