import React, { memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal, FormField } from "@/components";

const createCardSchema = z.object({
  title: z
    .string()
    .min(1, "Card title is required")
    .max(100, "Card title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

type CreateCardFormData = z.infer<typeof createCardSchema>;

interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description?: string) => Promise<void>;
  isLoading?: boolean;
}

const CreateCardModalComponent: React.FC<CreateCardModalProps> = ({
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
  } = useForm<CreateCardFormData>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmitForm = async (data: CreateCardFormData) => {
    try {
      await onSubmit(data.title.trim(), data.description?.trim() || undefined);
      reset();
      onClose();
    } catch (error) {
      console.error("Failed to create card:", error);
      setError("root", {
        type: "manual",
        message: "Failed to create card. Please try again.",
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const footer = (
    <>
      <button
        type="button"
        onClick={handleClose}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="create-card-form"
        disabled={isSubmitting || isLoading}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting || isLoading ? "Creating..." : "Create Card"}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Card"
      footer={footer}
      size="md"
    >
      <form
        id="create-card-form"
        onSubmit={handleSubmit(onSubmitForm)}
        className="space-y-4"
      >
        <FormField
          type="text"
          label="Card Title"
          placeholder="Enter card title"
          required
          autoFocus
          error={errors.title?.message}
          {...register("title")}
        />

        <FormField
          type="textarea"
          label="Description (optional)"
          placeholder="Enter card description"
          rows={3}
          error={errors.description?.message}
          {...register("description")}
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

export const CreateCardModal = memo(CreateCardModalComponent);
