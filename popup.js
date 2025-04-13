// Function to initialize the instruction popup functionality
function initializeInstructionsPopup() {
  const infoButton = document.getElementById('info-button');
  const closePopupButton = document.getElementById('close-popup');
  const instructionsPopup = document.getElementById('instructions-popup');
  const overlay = document.getElementById('overlay');
  
  // Show popup when info button is clicked
  infoButton.addEventListener('click', function() {
    instructionsPopup.classList.add('visible');
    overlay.classList.add('visible');
  });
  
  // Close popup when close button is clicked
  closePopupButton.addEventListener('click', function() {
    instructionsPopup.classList.remove('visible');
    overlay.classList.remove('visible');
  });
  
  // Close popup when overlay is clicked
  overlay.addEventListener('click', function() {
    instructionsPopup.classList.remove('visible');
    overlay.classList.remove('visible');
  });
  
  // Close popup when Escape key is pressed
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && instructionsPopup.classList.contains('visible')) {
      instructionsPopup.classList.remove('visible');
      overlay.classList.remove('visible');
    }
  });
}