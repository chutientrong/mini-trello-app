import React, { useState, memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSendVerificationCode, useSignup } from '../hooks/useAuth';
import { EmailStep } from './EmailStep';
import { CodeStep } from './CodeStep';
import { type SignUpEmailStepData, type CodeStepData } from '@/utils';

const SignUpFormComponent: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [emailData, setEmailData] = useState<SignUpEmailStepData | null>(null);

  const sendVerificationCodeMutation = useSendVerificationCode();
  const signupMutation = useSignup();

  const isLoading = useMemo(() => 
    sendVerificationCodeMutation.isPending || signupMutation.isPending, 
    [sendVerificationCodeMutation.isPending, signupMutation.isPending]
  );

  const handleEmailSubmit = useCallback(async (data: SignUpEmailStepData) => {
    await sendVerificationCodeMutation.mutateAsync({ email: data.email, isSignup: true });
    setEmailData(data);
    setStep('code');
  }, [sendVerificationCodeMutation]);

  const handleCodeSubmit = useCallback(async (data: CodeStepData) => {
    if (!emailData) {
      throw new Error('Email data not found');
    }

    await signupMutation.mutateAsync({
      fullName: emailData.fullName,
      email: emailData.email,
      verificationCode: data.verificationCode,
    });
    // Redirect to boards after successful signup
    navigate('/boards');
  }, [emailData, signupMutation, navigate]);

  const handleBackToEmail = useCallback(() => {
    setStep('email');
  }, []);

  if (step === 'email') {
    return (
      <EmailStep
        isSignUp={true}
        onSubmit={handleEmailSubmit}
        isLoading={isLoading}
      />
    );
  }

  return (
    <CodeStep
      onSubmit={handleCodeSubmit}
      onBack={handleBackToEmail}
      isLoading={isLoading}
    />
  );
};

export const SignUpForm = memo(SignUpFormComponent);
