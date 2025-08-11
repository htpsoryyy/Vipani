// 
const editButton = document.getElementById('editButton');
const logoutButton = document.getElementById('logoutButton');
const form = document.getElementById('profileForm');
const inputs = ['name', 'email', 'password', 'imageInput'].map(id => document.getElementById(id));
const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');

// Sample initial data for demonstration (could be fetched from server)
const initialData = {
  name: 'Oryza Sativa Putri',
  email: 'oryzasativaputri2@gmail.com',
  password: '09062009'
};

// Populate fields with initial data
document.getElementById('name').value = initialData.name;
document.getElementById('email').value = initialData.email;
document.getElementById('password').value = initialData.password;

// Enable or disable inputs with pink themed styling
function setInputsEnabled(enabled) {
  inputs.forEach(input => {
    input.disabled = !enabled;
    if (enabled) {
      input.classList.remove('bg-pink-100', 'text-gray-900', 'cursor-not-allowed');
      input.classList.add('bg-white', 'text-gray-900', 'cursor-text', 'border-pink-600', 'focus:ring-pink-500', 'focus:border-pink-500');
    } else {
      input.classList.add('bg-pink-100', 'text-gray-900', 'cursor-not-allowed');
      input.classList.remove('bg-white', 'cursor-text', 'focus:ring-pink-500', 'focus:border-pink-500');
    }
  });
}

// Validate email format
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

let editing = false;
editButton.addEventListener('click', () => {
  if (!editing) {
    // Switch to edit mode
    editing = true;
    setInputsEnabled(true);
    editButton.textContent = 'Save Changes';
  } else {
    // Validate inputs before saving
    let isValid = true;
    if (!document.getElementById('name').value.trim()) {
      nameError.classList.remove('hidden');
      isValid = false;
    } else {
      // nameError.classList.add('hidden');
    }
    if (!validateEmail(document.getElementById('email').value.trim())) {
      emailError.classList.remove('hidden');
      isValid = false;
    } else {
      emailError.classList.add('hidden');
    }
    if (document.getElementById('password').value.length < 6) {
      passwordError.classList.remove('hidden');
      isValid = false;
    } else {
      passwordError.classList.add('hidden');
    }
    if (!isValid) {
      return;
    }
    // Switch back to read-only mode
    editing = false;
    setInputsEnabled(false);
    editButton.textContent = 'Edit Profile'; // Change button text back to "Edit Profile"
    alert('Profile saved successfully!');
    // Here you can add further logic like sending data to a backend or saving locally.
  }
});

logoutButton.addEventListener('click', () => {
  alert('You have been logged out.');
  // Additional logout logic can be added here
});

// Profile image change preview (only works when enabled)
const imageInput = document.getElementById('imageInput');
const profileImage = document.getElementById('profileImage');
imageInput.addEventListener('change', function () {
  if (!this.disabled && this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      profileImage.src = e.target.result;
    };
    reader.readAsDataURL(this.files[0]);
  }
});
