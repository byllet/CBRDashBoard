<template>
  <div id="app">
    <!-- Навигационное меню -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="logo">
          <span> Аналитика ЦБРФ </span>
        </div>
        <div class="nav-links">
          <router-link to="/" class="nav-link" active-class="active">
            Курсы валют
          </router-link>
          <router-link to="/credit_stats" class="nav-link" active-class="active">
            Статистика кредитования
          </router-link>
          <router-link to="monetary_aggregates" class="nav-link" active-class="active">
            Денежные агрегаты
          </router-link>
          <router-link to="deposit_rates" class="nav-link" active-class="active">
            Ставки по депозитам
          </router-link>
          <router-link to="credit_rates" class="nav-link" active-class="active">
            Ставки по кредитам
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Содержимое текущей страницы -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Навигация */
.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.logo span {
  font-size: 1.8rem;
}

.nav-links {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.nav-link {
  text-decoration: none;
  color: #666;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  background: #f0f0f0;
  color: #42b983;
}

.nav-link.active {
  background: #42b983;
  color: white;
}

/* Основной контент */
.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 20px auto;
  width: 100%;
  padding: 0 20px;
}


.router-view {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    text-align: center;
  }
  
  .nav-links {
    justify-content: center;
  }
  
  .main-content {
    padding: 0 15px;
  }
}
</style>