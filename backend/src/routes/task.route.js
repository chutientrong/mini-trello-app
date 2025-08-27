const express = require('express');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { checkTaskPermission, checkAssignPermission } = require('../middlewares/taskPermission');
const taskValidation = require('../validations/task.validation');
const taskController = require('../controllers/task.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), checkTaskPermission('create'), validate(taskValidation.createTask), taskController.createTask)
  .get(auth(), checkTaskPermission('read'), validate(taskValidation.getTasks), taskController.getTasks);

router
  .route('/reorder')
  .patch(auth(), checkTaskPermission('reorder'), validate(taskValidation.reorderTasks), taskController.reorderTasks);

router
  .route('/:taskId')
  .get(auth(), checkTaskPermission('read'), validate(taskValidation.getTask), taskController.getTask)
  .patch(auth(), checkTaskPermission('update'), validate(taskValidation.updateTask), taskController.updateTask)
  .delete(auth(), checkTaskPermission('delete'), validate(taskValidation.deleteTask), taskController.deleteTask);

router
  .route('/:taskId/assign')
  .post(auth(), checkAssignPermission, validate(taskValidation.assignMember), taskController.assignMember)
  .delete(auth(), checkAssignPermission, validate(taskValidation.removeMember), taskController.removeMember);

router
  .route('/:taskId/move-to-card')
  .patch(auth(), checkTaskPermission('update'), validate(taskValidation.moveTaskToCard), taskController.moveTaskToCard);

module.exports = router;
