describe('Todo App Critical Path', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('allows user to follow the main flow', () => {
    // 1. Visit My Todos page
    cy.contains('My Todos').click();
    cy.url().should('include', '/todos');

    // 2. Add a new Task
    const taskTitle = `E2E Test Task ${Date.now()}`;
    cy.get('input[placeholder="Task title..."]').type(taskTitle);
    
    // Select Category
    cy.get('select').select(1); 
    
    cy.contains('button', 'Add').click();

    // 3. Verify Task Appears
    cy.contains(taskTitle).should('be.visible');

    // 4. Mark as Completed
    cy.contains(taskTitle)
      .parents('.todo-item')
      .find('.checkbox')
      .click();
    
    cy.contains(taskTitle).should('have.class', 'completed'); // Check if title has completed class

    // 5. Delete Task
    cy.contains(taskTitle)
      .parents('.todo-item')
      .find('.delete-btn')
      .click();

    cy.contains(taskTitle).should('not.exist');
  });
});
