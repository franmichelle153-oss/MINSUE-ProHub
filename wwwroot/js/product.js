// MINSU E-ProHub - Product Page JavaScript
// =========================================

document.addEventListener('DOMContentLoaded', function () {
    console.log('%c 🛍️ MINSU E-ProHub Products ', 'background: linear-gradient(135deg, #1a5f3f, #7cb342); color: white; font-size: 20px; font-weight: bold; padding: 15px 30px; border-radius: 10px;');

    initProductFilters();
    initProductSearch();
    initProductAnimations();
    initReservationButtons();
});

// ==================== PRODUCT FILTERS ====================

function initProductFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productItems = document.querySelectorAll('.product-item');

    filterButtons.forEach(button => {       
        button.addEventListener('click', function () {
            const filter = this.getAttribute('data-filter');

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filter products with animation
            productItems.forEach((item, index) => {
                const category = item.getAttribute('data-category');

                if (filter === 'all' || category === filter) {
                    setTimeout(() => {
                        item.style.display = 'block';
                        item.classList.remove('hidden');
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, 50);
                    }, index * 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                        item.classList.add('hidden');
                    }, 300);
                }
            });

            // Show count message
            setTimeout(() => {
                const visibleCount = document.querySelectorAll('.product-item:not(.hidden)').length;
                console.log(`Showing ${visibleCount} product(s)`);
            }, 500);
        });
    });
}

// ==================== PRODUCT SEARCH ====================

function initProductSearch() {
    const searchInput = document.getElementById('searchProduct');
    const productItems = document.querySelectorAll('.product-item');

    if (!searchInput) return;

    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase().trim();

        productItems.forEach((item, index) => {
            const productName = item.querySelector('.product-name').textContent.toLowerCase();
            const productCategory = item.querySelector('.product-category').textContent.toLowerCase();

            const matches = productName.includes(searchTerm) ||
                productCategory.includes(searchTerm);

            if (matches || searchTerm === '') {
                setTimeout(() => {
                    item.style.display = 'block';
                    item.classList.remove('hidden');
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 50);
                }, index * 30);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    item.style.display = 'none';
                    item.classList.add('hidden');
                }, 200);
            }
        });

        // Show "no results" message if needed
        setTimeout(() => {
            const visibleCount = document.querySelectorAll('.product-item:not(.hidden)').length;
            if (visibleCount === 0 && searchTerm !== '') {
                console.log('No products found matching your search');
            }
        }, 300);
    });

    // Clear button functionality
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            this.value = '';
            this.dispatchEvent(new Event('input'));
        }
    });
}

// ==================== PRODUCT ANIMATIONS ====================

function initProductAnimations() {
    // Animate product cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.product-item').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(item);
    });

    // Add hover effect to product cards
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transition = 'transform 0.3s ease';
        });

        card.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;

            this.style.transform = `
                perspective(1000px) 
                rotateY(${deltaX * 3}deg) 
                rotateX(${-deltaY * 3}deg) 
                translateY(-15px)
            `;
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) translateY(0)';
        });
    });
}

// ==================== RESERVATION BUTTONS ====================

function initReservationButtons() {
    // This function can be used to add additional event listeners or initialization
    // Currently, the onclick handlers in the HTML are sufficient
    console.log('Reservation buttons initialized');
}

// ==================== RESERVE PRODUCT ====================

function reserveProduct(productName) {
    console.log(`%c Reserving: ${productName} `, 'background: #7cb342; color: white; font-size: 14px; padding: 8px 15px; border-radius: 5px;');

    // Find the product item by data-name attribute
    const productItem = document.querySelector(`.product-item[data-name="${productName}"]`);
    
    if (!productItem) {
        console.error(`Product not found: ${productName}`);
        showNotification('Product not found', 'error');
        return;
    }

    // Extract product details from the DOM
    const productPrice = productItem.querySelector('.product-price').textContent;
    const productCategory = productItem.querySelector('.product-category').textContent;
    const productIcon = productItem.querySelector('.product-icon').textContent;

    // Show reservation modal
    showReservationModal(productName, productPrice, productCategory, productIcon);
}

// ==================== RESERVATION MODAL (WITHOUT PAYMENT METHOD) ====================

function showReservationModal(productName, productPrice, productCategory, productIcon) {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'reservationModal';

    // Create modal content WITHOUT payment method section
    modalOverlay.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <div class="modal-header-content">
                    <div class="modal-icon-wrapper">
                        <span class="modal-product-icon">${productIcon}</span>
                    </div>
                    <div>
                        <h2 class="modal-title">Reserve Product</h2>
                        <p class="modal-subtitle">Complete your reservation details</p>
                    </div>
                </div>
                <button class="modal-close" onclick="closeReservationModal()">✕</button>
            </div>
            
            <div class="modal-body">
                <!-- Product Summary -->
                <div class="product-summary">
                    <div class="summary-icon">${productIcon}</div>
                    <div class="summary-details">
                        <h3 class="summary-name">${productName}</h3>
                        <p class="summary-category">${productCategory}</p>
                        <div class="summary-price">${productPrice}</div>
                    </div>
                </div>

                <!-- Reservation Form -->
                <form id="reservationForm" class="reservation-form">
                    <!-- Student Information -->
                    <div class="form-section">
                        <h4 class="form-section-title">
                            <span class="section-icon">👤</span>
                            Student Information
                        </h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="studentName" class="form-label">Full Name *</label>
                                <input type="text" id="studentName" class="form-control" placeholder="Enter your full name" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="studentId" class="form-label">Student ID *</label>
                                <input type="text" id="studentId" class="form-control" placeholder="e.g., 2024-12345" required>
                            </div>
                            <div class="form-group">
                                <label for="studentEmail" class="form-label">Email *</label>
                                <input type="email" id="studentEmail" class="form-control" placeholder="you@minsu.edu.ph" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="studentPhone" class="form-label">Phone Number *</label>
                                <input type="tel" id="studentPhone" class="form-control" placeholder="+63 XXX XXX XXXX" required>
                            </div>
                            <div class="form-group">
                                <label for="studentYear" class="form-label">Year Level *</label>
                                <select id="studentYear" class="form-control" required>
                                    <option value="">Select year level</option>
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                    <option value="Graduate">Graduate Student</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Product Details -->
                    <div class="form-section">
                        <h4 class="form-section-title">
                            <span class="section-icon">📦</span>
                            Product Details
                        </h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="productQuantity" class="form-label">Quantity *</label>
                                <input type="number" id="productQuantity" class="form-control" value="1" min="1" max="10" required>
                            </div>
                            <div class="form-group" id="sizeSection" style="display: none;">
                                <label for="productSize" class="form-label">Size *</label>
                                <select id="productSize" class="form-control">
                                    <option value="">Select size</option>
                                    <option value="Small">Small</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Large">Large</option>
                                    <option value="XL">XL</option>
                                    <option value="XXL">XXL</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Pickup Details -->
                    <div class="form-section">
                        <h4 class="form-section-title">
                            <span class="section-icon">📅</span>
                            Pickup Details
                        </h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="pickupDate" class="form-label">Preferred Pickup Date *</label>
                                <input type="date" id="pickupDate" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="pickupTime" class="form-label">Preferred Time *</label>
                                <select id="pickupTime" class="form-control" required>
                                    <option value="">Select time</option>
                                    <option value="8:00 AM - 9:00 AM">8:00 AM - 9:00 AM</option>
                                    <option value="9:00 AM - 10:00 AM">9:00 AM - 10:00 AM</option>
                                    <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                                    <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                                    <option value="1:00 PM - 2:00 PM">1:00 PM - 2:00 PM</option>
                                    <option value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</option>
                                    <option value="3:00 PM - 4:00 PM">3:00 PM - 4:00 PM</option>
                                    <option value="4:00 PM - 5:00 PM">4:00 PM - 5:00 PM</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Additional Notes -->
                    <div class="form-section">
                        <h4 class="form-section-title">
                            <span class="section-icon">📝</span>
                            Additional Notes (Optional)
                        </h4>
                        <div class="form-group">
                            <textarea id="additionalNotes" class="form-control" rows="3" placeholder="Any special requests or notes..."></textarea>
                        </div>
                    </div>

                    <!-- Order Summary -->
                    <div class="order-summary">
                        <div class="summary-row">
                            <span>Product:</span>
                            <span>${productName}</span>
                        </div>
                        <div class="summary-row">
                            <span>Unit Price:</span>
                            <span>${productPrice}</span>
                        </div>
                        <div class="summary-row">
                            <span>Quantity:</span>
                            <span id="summaryQuantity">1</span>
                        </div>
                        <div class="summary-row total-row">
                            <span>Total Amount:</span>
                            <span id="summaryTotal">${productPrice}</span>
                        </div>
                    </div>

                    <!-- Terms and Conditions -->
                    <div class="form-section">
                        <label class="checkbox-label">
                            <input type="checkbox" id="agreeTerms" required>
                            <span>I agree to the <a href="#" class="terms-link">Terms and Conditions</a> and <a href="#" class="terms-link">Cancellation Policy</a></span>
                        </label>
                    </div>
                </form>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="closeReservationModal()">
                    Cancel
                </button>
                <button type="submit" form="reservationForm" class="btn-primary">
                    <span class="btn-icon">✓</span>
                    Confirm Reservation
                </button>
            </div>
        </div>
    `;

    // Add to body
    document.body.appendChild(modalOverlay);

    // Animate in
    setTimeout(() => {
        modalOverlay.classList.add('active');
    }, 10);

    // Show size selector for uniforms
    if (productCategory.toLowerCase().includes('uniform')) {
        document.getElementById('sizeSection').style.display = 'block';
        document.getElementById('productSize').required = true;
    }

    // Set minimum pickup date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('pickupDate').min = tomorrow.toISOString().split('T')[0];

    // Update total on quantity change
    document.getElementById('productQuantity').addEventListener('input', function () {
        const quantity = parseInt(this.value) || 1;
        const unitPrice = parseFloat(productPrice.replace('₱', '').replace(',', ''));
        const total = unitPrice * quantity;

        document.getElementById('summaryQuantity').textContent = quantity;
        document.getElementById('summaryTotal').textContent = '₱' + total.toFixed(2);
    });

    // Handle form submission
    document.getElementById('reservationForm').addEventListener('submit', function (e) {
        e.preventDefault();
        submitReservation(productName);
    });

    // Close on overlay click
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) {
            closeReservationModal();
        }
    });
}

function closeReservationModal() {
    const modal = document.getElementById('reservationModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

async function submitReservation(productName) {
    // Get form data
    const formData = {
        studentName: document.getElementById('studentName').value,
        studentId: document.getElementById('studentId').value,
        email: document.getElementById('studentEmail').value,
      yearLevel: document.getElementById('studentYear').value,
        productId: parseInt(document.querySelector('.product-item[data-name="' + productName + '"]').dataset.productId),
  quantityOrder: parseInt(document.getElementById('productQuantity').value),
        dateToClaim: new Date(document.getElementById('pickupDate').value + 'T' + 
     document.getElementById('pickupTime').value.split(' - ')[0]).toISOString()
    };

    // Validate form
    const form = document.getElementById('reservationForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Check terms agreement
    if (!document.getElementById('agreeTerms').checked) {
        showNotification('Please agree to the Terms and Conditions', 'error');
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector('.modal-footer .btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
    submitBtn.disabled = true;

    // Add loading overlay
    const loadingOverlay = addLoadingOverlay();

    try {
 // Get the anti-forgery token
        const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value;
        if (!token) {
      throw new Error('Anti-forgery token not found');
        }

        // Send reservation data to backend
  const response = await fetch('/api/ReservationApi/Create', {
            method: 'POST',
            headers: {
      'Content-Type': 'application/json',
      'RequestVerificationToken': token
            },
          body: JSON.stringify(formData)
        });

      if (!response.ok) {
      const errorData = await response.json();
     throw new Error(errorData.message || 'Failed to create reservation');
  }

        const result = await response.json();

        // Close reservation modal
        closeReservationModal();

 // Show success modal
     showSuccessModal({
   reservationId: result.reservationId,
    productName: productName,
   pickupDate: formData.dateToClaim,
     pickupTime: document.getElementById('pickupTime').value,
          totalAmount: document.getElementById('summaryTotal').textContent,
          studentEmail: formData.email
        });

        // Show success notification
     showNotification('Reservation created successfully!', 'success');

    } catch (error) {
        console.error('Reservation error:', error);
   showNotification(error.message || 'Failed to create reservation. Please try again.', 'error');
    } finally {
        // Remove loading overlay
        removeLoadingOverlay();
        
    // Reset button state
        if (submitBtn) {
     submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        }
    }
}

// Helper function to add loading overlay
function addLoadingOverlay() {
    const modalBody = document.querySelector('.modal-body');
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-content">
       <div class="loading-spinner-large"></div>
            <p class="loading-text">Processing your reservation...</p>
   <p class="loading-subtext">Please wait a moment</p>
        </div>
    `;
    modalBody.style.position = 'relative';
    modalBody.appendChild(loadingOverlay);
    return loadingOverlay;
}

// Helper function to remove loading overlay
function removeLoadingOverlay() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

// ==================== RESERVATION SUCCESS MODAL ====================

function showSuccessModal(formData) {
    const successModal = document.createElement('div');
    successModal.className = 'modal-overlay active';
    successModal.innerHTML = `
        <div class="success-modal-container">
  <div class="success-icon-wrapper">
    <div class="success-icon">✓</div>
      </div>
            <h2 class="success-title">Reservation Confirmed!</h2>
     <p class="success-message">Your reservation has been successfully submitted.</p>
         
            <div class="success-details">
    <div class="detail-row">
      <span class="detail-label">Reservation ID:</span>
     <span class="detail-value">${formData.reservationId}</span>
         </div>
    <div class="detail-row">
           <span class="detail-label">Product:</span>
         <span class="detail-value">${formData.productName}</span>
          </div>
                <div class="detail-row">
        <span class="detail-label">Pickup Date:</span>
      <span class="detail-value">${new Date(formData.pickupDate).toLocaleDateString()} at ${formData.pickupTime}</span>
     </div>
        <div class="detail-row">
          <span class="detail-label">Total Amount:</span>
        <span class="detail-value">${formData.totalAmount}</span>
        </div>
     </div>

            <p class="success-note">
        📧 A confirmation email has been sent to <strong>${formData.studentEmail}</strong>
            </p>
            
            <div class="success-actions">
        <button class="btn-primary" onclick="this.closest('.modal-overlay').remove()">
         Done
       </button>
          <button class="btn-secondary" onclick="printReservationDetails(${JSON.stringify(formData)})">
      Print Receipt
             </button>
   </div>
        </div>
    `;

    document.body.appendChild(successModal);
    createConfetti();
}

function printReservationDetails(formData) {
const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
       <head>
        <title>Reservation Receipt - ${formData.reservationId}</title>
        <style>
       body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
.details { margin: 20px 0; }
          .detail-row { margin: 10px 0; }
        .detail-label { font-weight: bold; }
             .footer { margin-top: 50px; text-align: center; font-size: 0.9em; }
 </style>
      </head>
            <body>
  <div class="header">
      <h1>MINSU E-ProHub</h1>
   <h2>Reservation Receipt</h2>
    </div>
           <div class="details">
   <div class="detail-row">
          <span class="detail-label">Reservation ID:</span>
           <span>${formData.reservationId}</span>
      </div>
    <div class="detail-row">
         <span class="detail-label">Product:</span>
             <span>${formData.productName}</span>
         </div>
         <div class="detail-row">
   <span class="detail-label">Pickup Date:</span>
           <span>${new Date(formData.pickupDate).toLocaleDateString()} at ${formData.pickupTime}</span>
     </div>
  <div class="detail-row">
          <span class="detail-label">Total Amount:</span>
                <span>${formData.totalAmount}</span>
             </div>
                </div>
       <div class="footer">
  <p>Thank you for your reservation!</p>
         <p>Please present this receipt when claiming your item.</p>
    </div>
    </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// ==================== NOTIFICATION SYSTEM ====================

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;

    // Add styles
    notification.style.position = 'fixed';
    notification.style.top = '100px';
    notification.style.right = '30px';
    notification.style.background = type === 'success' ?
        'linear-gradient(135deg, #7cb342, #689f38)' :
        'linear-gradient(135deg, #1a5f3f, #134d30)';
    notification.style.color = 'white';
    notification.style.padding = '20px 30px';
    notification.style.borderRadius = '15px';
    notification.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.3)';
    notification.style.zIndex = '10000';
    notification.style.transform = 'translateX(400px)';
    notification.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    notification.style.fontWeight = '600';
    notification.style.fontSize = '1rem';

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// ==================== UTILITY FUNCTIONS ====================

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(price);
}

// Smooth scroll to products
function scrollToProducts() {
    const productsSection = document.querySelector('.products-section');
    if (productsSection) {
        productsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ==================== FILTER COUNT BADGE ====================

function updateFilterCounts() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        const filter = button.getAttribute('data-filter');
        let count;

        if (filter === 'all') {
            count = document.querySelectorAll('.product-item').length;
        } else {
            count = document.querySelectorAll(`.product-item[data-category="${filter}"]`).length;
        }

        // Add count badge to button
        const existingBadge = button.querySelector('.count-badge');
        if (existingBadge) {
            existingBadge.textContent = count;
        } else {
            const badge = document.createElement('span');
            badge.className = 'count-badge';
            badge.textContent = count;
            badge.style.marginLeft = '8px';
            badge.style.background = 'rgba(255, 255, 255, 0.3)';
            badge.style.padding = '2px 8px';
            badge.style.borderRadius = '50px';
            badge.style.fontSize = '0.85rem';
            button.appendChild(badge);
        }
    });
}

// Initialize count badges
setTimeout(updateFilterCounts, 100);

// ==================== CONSOLE WELCOME ====================

console.log('%c 📦 Products Loaded Successfully! ', 'background: #f4d03f; color: #134d30; font-size: 14px; padding: 8px 15px; border-radius: 5px;');
console.log('%c 🎯 Use filters to browse categories ', 'color: #1a5f3f; font-size: 12px; padding: 5px;');
console.log('%c 🔍 Search for specific products ', 'color: #7cb342; font-size: 12px; padding: 5px;');

// ==================== CONFETTI ANIMATION ====================

function createConfetti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Create confetti particles
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            particle.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background-color: ${['#7cb342', '#f4d03f', '#1a5f3f', '#ff6b6b', '#4ecdc4'][Math.floor(Math.random() * 5)]};
                left: ${randomInRange(0, 100)}%;
                top: -10px;
                opacity: 1;
                z-index: 10000;
                animation: confetti-fall ${randomInRange(2, 4)}s linear forwards;
            `;
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 4000);
        }
    }, 250);

    // Add confetti animation CSS if not already present
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent = `
            @keyframes confetti-fall {
                to {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}
