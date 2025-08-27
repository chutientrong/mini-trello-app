import React, { memo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, VerificationCodeInput } from '@/components';
import { ChevronLeft } from 'lucide-react';
import { codeStepSchema, type CodeStepData } from '@/utils';

interface CodeStepProps {
  onSubmit: (data: CodeStepData) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  error?: string;
}

const CodeStepComponent: React.FC<CodeStepProps> = ({
  onSubmit,
  onBack,
  isLoading,
  error,
}) => {
  const {
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    setValue,
  } = useForm<CodeStepData>({
    resolver: zodResolver(codeStepSchema),
    defaultValues: { verificationCode: '' },
  });

  const verificationCode = watch('verificationCode');

  const onSubmitForm = useCallback(async (data: CodeStepData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Code step error:', error);
      setError('root', {
        type: 'manual',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }, [onSubmit, setError]);

  const handleCodeChange = useCallback((code: string) => {
    setValue('verificationCode', code);
  }, [setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div className="text-center">
        <Button
          variant="link"
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-500 mb-4 bg-transparent border-none hover:bg-transparent"
        >
          <ChevronLeft className="h-4 w-4 mr-1 font-medium" /> Back
        </Button>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Email Verification
        </h2>
        <p className="text-gray-600 text-sm">
          Please enter the code that was sent to your email address
        </p>
      </div>

      <div className="space-y-4">
        <VerificationCodeInput
          value={verificationCode}
          onChange={handleCodeChange}
          error={errors.verificationCode?.message || error}
          disabled={isLoading}
          autoFocus
          placeholder="Enter 6-digit code"
        />

        {errors.root && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {errors.root.message}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full"
        >
          {isLoading ? 'Verifying...' : 'Submit'}
        </Button>
      </div>

      <div className="text-center">
        <span className="text-sm text-gray-600">Didn't receive the code? </span>
        <Button
          variant='link'
          className="text-sm font-medium"
        >
          Resend
        </Button>
      </div>
    </form>
  );
};

export const CodeStep = memo(CodeStepComponent);
