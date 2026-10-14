# Database Schema Documentation: Jajal Medical

This document describes the relational database structure, column definitions, data constraints, foreign key relationships, and indexes for the Medical Case Management portal.

---

## 1. Relational Entity Diagram

```
+--------------------------------------------------+
|                      users                       |
+--------------------------------------------------+
| id            BIGINT UNSIGNED AUTO_INCREMENT [PK]|
| name          VARCHAR(255) NOT NULL              |
| email         VARCHAR(255) NOT NULL UNIQUE       |
| password      VARCHAR(255) NOT NULL              |
| role          ENUM('admin','viewer','engineer')  |
| created_at    TIMESTAMP NULL                     |
| updated_at    TIMESTAMP NULL                     |
+--------------------------------------------------+
                        |
                        | 1 (User / Author)
                        |
                        | N (Cases created)
                        v
+--------------------------------------------------+
|                      cases                       |
+--------------------------------------------------+
| id                BIGINT UNSIGNED AUTO_INCREMENT |
| case_number       VARCHAR(64) NOT NULL [UNIQUE]  |
| patient_reference VARCHAR(64) NOT NULL           |
| surgeon_name      VARCHAR(255) NOT NULL          |
| implant_type      VARCHAR(255) NOT NULL          |
| status            ENUM(...) NOT NULL [INDEX]     |
| priority          ENUM('Low','Medium','High')    |
| surgery_date      DATE NULL                      |
| created_by        BIGINT UNSIGNED NOT NULL [FK]  |
| created_at        TIMESTAMP NULL                 |
| updated_at        TIMESTAMP NULL                 |
+--------------------------------------------------+
```

---

## 2. Table Specifications

### Table: `users`
Stores authorized healthcare personnel and clinical engineers accessing the application.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | Primary Key, Auto Increment | Unique user identifier |
| `name` | `VARCHAR(255)` | `NOT NULL` | Full clinical or engineer staff name |
| `email` | `VARCHAR(255)` | `NOT NULL`, `UNIQUE INDEX` | Login work email address |
| `password` | `VARCHAR(255)` | `NOT NULL` | Hashed authentication password |
| `role` | `ENUM` | `'admin'`, `'viewer'`, `'engineer'` | Authorization level governing permissions |
| `created_at` | `TIMESTAMP` | Default current timestamp | Record registration timestamp |
| `updated_at` | `TIMESTAMP` | Auto-updates on edit | Record last modification timestamp |

### Table: `cases`
Stores patient-matched surgical implant records and clinical manufacturing lifecycle stages.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | Primary Key, Auto Increment | Unique internal case record ID |
| `case_number` | `VARCHAR(64)` | `NOT NULL`, `UNIQUE INDEX` | Clinical identifier (e.g. `CASE-0001`) |
| `patient_reference`| `VARCHAR(64)` | `NOT NULL` | Synthetic de-identified patient code |
| `surgeon_name` | `VARCHAR(255)` | `NOT NULL` | Primary operating surgeon |
| `implant_type` | `VARCHAR(255)` | `NOT NULL` | Specific prosthetic or implant device type |
| `status` | `ENUM` | `INDEX`, `NOT NULL` | `Draft`, `Planning`, `In Review`, `Approved`, `Completed`, `Cancelled` |
| `priority` | `ENUM` | `NOT NULL` | `Low`, `Medium`, `High` |
| `surgery_date` | `DATE` | `NULLABLE` | Scheduled operating theater date (YYYY-MM-DD) |
| `created_by` | `BIGINT UNSIGNED` | `NOT NULL`, Foreign Key | References `users(id)` ON DELETE RESTRICT |
| `created_at` | `TIMESTAMP` | Default current timestamp | Initial case creation timestamp |
| `updated_at` | `TIMESTAMP` | Auto-updates on edit | Last case modification timestamp |

---

## 3. Database Constraints & Indexes

1. **Unique Index on `case_number`:**
   Enforces that duplicate case numbers are strictly prevented at the database storage engine layer.
   ```sql
   ALTER TABLE `cases` ADD UNIQUE KEY `cases_case_number_unique` (`case_number`);
   ```

2. **Index on `status`:**
   Optimizes dashboard count aggregation queries and status-based table filtering on high-volume case databases.
   ```sql
   ALTER TABLE `cases` ADD INDEX `cases_status_index` (`status`);
   ```

3. **Foreign Key Constraint (`created_by` -> `users.id`):**
   Maintains relational integrity, guaranteeing every case record is attributable to a valid user account.
   ```sql
   ALTER TABLE `cases`
     ADD CONSTRAINT `cases_created_by_foreign`
     FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
     ON DELETE RESTRICT;
   ```

---

## 4. DDL Migration Example (MySQL / Laravel)

```php
// Migration: create_cases_table.php
Schema::create('cases', function (Blueprint $table) {
    $table->id();
    $table->string('case_number')->unique();
    $table->string('patient_reference');
    $table->string('surgeon_name');
    $table->string('implant_type');
    $table->enum('status', ['Draft', 'Planning', 'In Review', 'Approved', 'Completed', 'Cancelled'])->index();
    $table->enum('priority', ['Low', 'Medium', 'High'])->default('Medium');
    $table->date('surgery_date')->nullable();
    $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
    $table->timestamps();
});
```
