document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Getting values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    const confirmPass = document.getElementById('confirmPassword').value;
    const course = document.getElementById('course').value;
    const genders = document.querySelectorAll('input[name="gender"]:checked');
    const errorArea = document.getElementById('errorArea');

    // Validation
    if (pass !== confirmPass) {
        errorArea.innerText = " Passwords do not match!";
        return;
    }

    if (genders.length === 0) {
        errorArea.innerText = " Please select a Gender.";
        return;
    }

    if (course === "") {
        errorArea.innerText = " Please select a Department.";
        return;
    }

    // On Success
    errorArea.innerText = "";
    document.getElementById('userDisplay').innerText = name;
    document.getElementById('successModal').style.display = 'flex';
});

function closeModal() {
    document.getElementById('successModal').style.display = 'none';
    document.getElementById('registrationForm').reset();
}