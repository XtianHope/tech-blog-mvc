document.addEventListener('DOMContentLoaded', () => {
    const signupButton = document.getElementById('signupButton');
    
    if (signupButton) {
      signupButton.addEventListener('click', () => {
        window.location.href = '/signup';
      });
    }
  });


  document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    
    if (loginButton) {
      loginButton.addEventListener('click', () => {
        window.location.href = '/login';
      });
    }
  });

  
  document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.querySelector('.button.is-danger');
    
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        window.location.href = '/logout';
      });
    }
  });