// State Management
const state = {
    image: null,
    focalPoint: { x: 50, y: 50 }, // Percentages
    isDragging: false,
    currentObjectFit: 'cover'
};

// DOM Elements
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const focalSection = document.getElementById('focalSection');
const controlsSection = document.getElementById('controlsSection');
const previewsSection = document.getElementById('previewsSection');
const imageWrapper = document.getElementById('imageWrapper');
const previewImage = document.getElementById('previewImage');
const focalPoint = document.getElementById('focalPoint');
const coordX = document.getElementById('coordX');
const coordY = document.getElementById('coordY');
const desktopPreview = document.getElementById('desktopPreview');
const mobilePreview = document.getElementById('mobilePreview');
const copyCssBtn = document.getElementById('copyCssBtn');
const copyDataBtn = document.getElementById('copyDataBtn');
const resetBtn = document.getElementById('resetBtn');
const toast = document.getElementById('toast');
const objectFitRadios = document.querySelectorAll('input[name="objectFit"]');

// Initialize
function init() {
    setupEventListeners();
}

// Event Listeners Setup
function setupEventListeners() {
    // Upload zone drag and drop
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('dragleave', handleDragLeave);
    uploadZone.addEventListener('drop', handleDrop);
    uploadZone.addEventListener('click', () => fileInput.click());

    // File input
    selectFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });
    fileInput.addEventListener('change', handleFileSelect);

    // Focal point selection
    imageWrapper.addEventListener('click', handleImageClick);
    imageWrapper.addEventListener('mousedown', handleFocalMouseDown);

    // Object fit controls
    objectFitRadios.forEach(radio => {
        radio.addEventListener('change', handleObjectFitChange);
    });

    // Action buttons
    copyCssBtn.addEventListener('click', copyCssToClipboard);
    copyDataBtn.addEventListener('click', copyDataToClipboard);
    resetBtn.addEventListener('click', resetApp);
}

// Drag and Drop Handlers
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// File Selection Handler
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// Process Uploaded File
function handleFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file', 'error');
        return;
    }

    // Read and display image
    const reader = new FileReader();
    reader.onload = (e) => {
        state.image = e.target.result;
        loadImage(e.target.result);
    };
    reader.readAsDataURL(file);
}

// Load Image and Show Sections
function loadImage(src) {
    previewImage.src = src;
    desktopPreview.src = src;
    mobilePreview.src = src;

    // Wait for image to load before showing sections
    previewImage.onload = () => {
        // Show all sections
        focalSection.style.display = 'block';
        controlsSection.style.display = 'block';
        previewsSection.style.display = 'block';

        // Set default focal point to center
        state.focalPoint = { x: 50, y: 50 };
        updateFocalPoint();
        updatePreviews();

        // Scroll to focal section
        focalSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
}

// Focal Point Handlers
function handleImageClick(e) {
    if (state.isDragging) return;

    const rect = imageWrapper.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    state.focalPoint = {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y))
    };

    updateFocalPoint();
    updatePreviews();
}

function handleFocalMouseDown(e) {
    // Check if clicking near the focal point marker
    const rect = imageWrapper.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const distance = Math.sqrt(
        Math.pow(clickX - state.focalPoint.x, 2) +
        Math.pow(clickY - state.focalPoint.y, 2)
    );

    // If within 5% threshold, start dragging
    if (distance < 5) {
        state.isDragging = true;
        imageWrapper.style.cursor = 'grabbing';

        const handleMouseMove = (e) => {
            if (!state.isDragging) return;

            const rect = imageWrapper.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            state.focalPoint = {
                x: Math.max(0, Math.min(100, x)),
                y: Math.max(0, Math.min(100, y))
            };

            updateFocalPoint();
            updatePreviews();
        };

        const handleMouseUp = () => {
            state.isDragging = false;
            imageWrapper.style.cursor = 'crosshair';
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        e.preventDefault();
    }
}

// Update Focal Point Display
function updateFocalPoint() {
    // Position the focal point marker
    focalPoint.style.left = `${state.focalPoint.x}%`;
    focalPoint.style.top = `${state.focalPoint.y}%`;

    // Update coordinate display
    coordX.textContent = `${Math.round(state.focalPoint.x)}%`;
    coordY.textContent = `${Math.round(state.focalPoint.y)}%`;
}

// Update Preview Images
function updatePreviews() {
    const objectPosition = `${state.focalPoint.x}% ${state.focalPoint.y}%`;

    desktopPreview.style.objectPosition = objectPosition;
    mobilePreview.style.objectPosition = objectPosition;
}

// Object Fit Change Handler
function handleObjectFitChange(e) {
    state.currentObjectFit = e.target.value;

    desktopPreview.style.objectFit = state.currentObjectFit;
    mobilePreview.style.objectFit = state.currentObjectFit;
}

// Copy CSS to Clipboard
function copyCssToClipboard() {
    const css = `--focal-x: ${Math.round(state.focalPoint.x)}%;
--focal-y: ${Math.round(state.focalPoint.y)}%;
object-position: var(--focal-x) var(--focal-y);`;

    copyToClipboard(css, 'CSS copied to clipboard!');
}

// Copy Data Attribute to Clipboard
function copyDataToClipboard() {
    const dataAttr = `data-focal-x="${Math.round(state.focalPoint.x)}" data-focal-y="${Math.round(state.focalPoint.y)}"`;

    copyToClipboard(dataAttr, 'Data attributes copied to clipboard!');
}

// Generic Copy to Clipboard
async function copyToClipboard(text, message) {
    try {
        await navigator.clipboard.writeText(text);
        showToast(message, 'success');
    } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            showToast(message, 'success');
        } catch (err) {
            showToast('Failed to copy to clipboard', 'error');
        }

        document.body.removeChild(textarea);
    }
}

// Show Toast Notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.style.background = type === 'success' ?
        'var(--success-color)' :
        'var(--danger-color)';

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Reset Application
function resetApp() {
    // Reset state
    state.image = null;
    state.focalPoint = { x: 50, y: 50 };
    state.isDragging = false;
    state.currentObjectFit = 'cover';

    // Clear images
    previewImage.src = '';
    desktopPreview.src = '';
    mobilePreview.src = '';

    // Hide sections
    focalSection.style.display = 'none';
    controlsSection.style.display = 'none';
    previewsSection.style.display = 'none';

    // Reset file input
    fileInput.value = '';

    // Reset object fit radio
    document.querySelector('input[name="objectFit"][value="cover"]').checked = true;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    showToast('App reset successfully', 'success');
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
