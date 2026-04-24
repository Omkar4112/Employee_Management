# 🚀 Smart Workforce Management - Backend

This is the Spring Boot backend for the Workforce Management System.

## 🏗️ Tech Stack
- **Framework:** Spring Boot 3.x
- **Database:** MySQL
- **ORM:** Spring Data JPA
- **Security:** Spring Security (RBAC)

## ⚙️ Configuration
Update `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/workforce_db
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update
```

## 🚀 Getting Started
1. Ensure MySQL is running.
2. Create database `workforce_db`.
3. Run `./mvnw spring-boot:run`.

## 📡 API Endpoints
- `GET /api/employees` - Fetch all
- `POST /api/employees` - Hire new
- `PUT /api/employees/{id}` - Update profile
- `DELETE /api/employees/{id}` - Terminate
