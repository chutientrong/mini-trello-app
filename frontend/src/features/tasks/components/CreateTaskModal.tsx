import React, { memo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, FormField, Button } from '@/components';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(100, 'Task title must be less than 100 characters'),
  description: z.string().max(300, 'Description must be less than 300 characters').optional(),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description?: string) => Promise<void>;
  isLoading?: boolean;
  cardTitle?: string;
}

const CreateTaskModalComponent: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  cardTitle,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const onSubmitForm = async (data: CreateTaskFormData) => {
    try {
      await onSubmit(data.title.trim(), data.description?.trim() || undefined);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
      setError('root', {
        type: 'manual',
        message: 'Failed to create task. Please try again.',
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const footer = (
    <>
      <Button
        onClick={handleClose}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="create-task-form"
        disabled={isSubmitting || isLoading}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting || isLoading ? 'Creating...' : 'Create Task'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Add Task${cardTitle ? ` to "${cardTitle}"` : ''}`}
      footer={footer}
      size="md"
    >
      <form id="create-task-form" onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        <FormField
          type="text"
          label="Task Title"
          placeholder="Enter task title"
          required
          autoFocus
          error={errors.title?.message}
          {...register('title')}
        />

        <FormField
          type="textarea"
          label="Description (optional)"
          placeholder="Enter task description"
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        {errors.root && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {errors.root.message}
          </div>
        )}
      </form>
    </Modal>
  );
};

export const CreateTaskModal = memo(CreateTaskModalComponent);
