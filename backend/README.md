# Todo API Documentation

This API provides CRUD operations for managing todo items.

## Endpoints

### GET /api/todos
- Retrieves all todo items
- Query parameters:
  - `completed`: Filter by completion status (true/false)

### GET /api/todos/:id
- Retrieves a specific todo item by ID

### POST /api/todos
- Creates a new todo item
- Required fields in request body:
  - `title`: String
- Optional fields:
  - `completed`: Boolean (defaults to false)

### PUT /api/todos/:id
- Updates an existing todo item
- Fields that can be updated:
  - `title`: String
  - `completed`: Boolean

### DELETE /api/todos/:id
- Deletes a todo item by ID

## Running the API
echo 'Fix completed successfully'
