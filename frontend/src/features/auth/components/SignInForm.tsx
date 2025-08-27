import React, { useState, memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSendVerificationCode, useSignin } from '../hooks/useAuth';
import { EmailStep } from './EmailStep';
import { CodeStep } from './CodeStep';
import { type EmailStepData, type CodeStepData } from '@/utils';

const SignInFormComponent: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [emailData, setEmailData] = useState<EmailStepData | null>(null);

  const sendVerificationCodeMutation = useSendVerificationCode();
  const signinMutation = useSignin();

  const isLoading = useMemo(() => 
    sendVerificationCodeMutation.isPending || signinMutation.isPending, 
    [sendVerificationCodeMutation.isPending, signinMutation.isPending]
  );

  const handleEmailSubmit = useCallback(async (data: EmailStepData) => {
    await sendVerificationCodeMutation.mutateAsync({ email: data.email });
    setEmailData(data);
    setStep('code');
  }, [sendVerificationCodeMutation]);

  const handleCodeSubmit = useCallback(async (data: CodeStepData) => {
    if (!emailData) {
      throw new Error('Email data not found');
    }

    await signinMutation.mutateAsync({
      email: emailData.email,
      verificationCode: data.verificationCode,
    });
    // Redirect to boards after successful signin
    console.log('Signin successful, navigating to /boards');
    navigate('/boards');
  }, [emailData, signinMutation, navigate]);

  const handleBackToEmail = useCallback(() => {
    setStep('email');
  }, []);

  if (step === 'email') {
    return (
      <EmailStep
        isSignUp={false}
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

export const SignInForm = memo(SignInFormComponent);
