<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Register - Library Management</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600&display=swap" rel="stylesheet">

<link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/common.css">
<link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/auth.css">
</head>

<body class="auth-page">

<div class="login-container">
    <div class="login-card">
        <div class="login-header">
            <div class="login-icon">
                <i class="bi bi-person-plus-fill"></i>
            </div>
            <h3 class="login-title">Join Us Today</h3>
            <p class="login-subtitle">Create your library account to get started</p>
        </div>

        <!-- Show Error Message -->
        <c:if test="${not empty errorMessage}">
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <c:out value="${errorMessage}" />
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        </c:if>

        <form action="AuthenticationController" method="post">
            <input type="hidden" name="action" value="registerUser">

            <div class="form-floating">
                <input type="text" class="form-control" id="fullname" name="fullname" placeholder="Full Name">
                <label for="fullname"><i class="bi bi-person-fill me-2"></i>Full Name</label>
                <div class="text-danger small" id="fullnameError"></div>
            </div>

            <div class="form-floating">
                <input type="email" class="form-control" id="email" name="email" placeholder="Email Address">
                <label for="email"><i class="bi bi-envelope-fill me-2"></i>Email Address</label>
                <div class="form-text">This will be your username for login</div>
                <div class="text-danger small" id="emailError"></div>
            </div>

            <div class="form-floating">
                <input type="password" class="form-control" id="password" name="password" placeholder="Password">
                <label for="password"><i class="bi bi-lock-fill me-2"></i>Password</label>
                <div class="text-danger small" id="passwordError"></div>
            </div>

            <div class="form-floating">
                <input type="password" class="form-control" id="confirmPassword" placeholder="Confirm Password">
                <label for="confirmPassword"><i class="bi bi-lock-fill me-2"></i>Confirm Password</label>
                <div class="text-danger small" id="confirmPasswordError"></div>
            </div>

            <button type="submit" class="btn btn-login">
                <i class="bi bi-check-circle me-2"></i>Create Account
            </button>

            <div class="text-center mt-3">
                <p class="mb-0">
                    Already have an account?
                    <a href="AuthenticationController?action=showLogin" class="login-link">Sign in here</a>
                </p>
            </div>

        </form>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

<script>
function setRegisterValidation() {

    const form = document.querySelector('.login-container form');
    if(!form) return;

    form.addEventListener('submit', function(event) {

        const fullname = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        document.getElementById('fullnameError').textContent = '';
        document.getElementById('emailError').textContent = '';
        document.getElementById('passwordError').textContent = '';
        document.getElementById('confirmPasswordError').textContent = '';

        let hasError = false;

        if(!fullname){
            document.getElementById('fullnameError').textContent = "Please enter full name";
            hasError = true;
        }

        if(!email){
            document.getElementById('emailError').textContent = "Please enter email";
            hasError = true;
        }

        if(!password){
            document.getElementById('passwordError').textContent = "Please enter password";
            hasError = true;
        }

        if(password !== confirmPassword){
            document.getElementById('confirmPasswordError').textContent = "Passwords do not match";
            hasError = true;
        }

        if(hasError){
            event.preventDefault();
        }
    });
}

if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setRegisterValidation);
} else {
    setRegisterValidation();
}
</script>

</body>
</html>
