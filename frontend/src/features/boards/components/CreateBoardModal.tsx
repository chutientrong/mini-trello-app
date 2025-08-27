import React, { memo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, FormField, Button } from '@/components';

const createBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(100, 'Board name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

type CreateBoardFormData = z.infer<typeof createBoardSchema>;

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description?: string) => Promise<void>;
  isLoading?: boolean;
}

const CreateBoardModalComponent: React.FC<CreateBoardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<CreateBoardFormData>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmitForm = async (data: CreateBoardFormData) => {
    try {
      await onSubmit(data.name.trim(), data.description?.trim() || undefined);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to create board:', error);
      setError('root', {
        type: 'manual',
        message: 'Failed to create board. Please try again.',
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
        variant="secondary"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="create-board-form"
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting || isLoading ? 'Creating...' : 'Create Board'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Board"
      footer={footer}
      size="md"
    >
      <form id="create-board-form" onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        <FormField
          type="text"
          label="Board Name"
          placeholder="Enter board name"
          required
          autoFocus
          error={errors.name?.message}
          {...register('name')}
        />

        <FormField
          type="textarea"
          label="Description (optional)"
          placeholder="Enter board description"
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

export const CreateBoardModal = memo(CreateBoardModalComponent);
