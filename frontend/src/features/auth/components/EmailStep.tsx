import React, { memo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField, Button, Image } from '@/components';
import logoImage from '@/assets/logo.png';
import { Link } from 'react-router-dom';
import { emailStepSchema, signUpEmailStepSchema, type EmailStepData, type SignUpEmailStepData } from '@/utils';

// Base props that are always required
interface BaseEmailStepProps {
  isLoading: boolean;
  error?: string;
}

// Props for signup flow
interface SignUpEmailStepProps extends BaseEmailStepProps {
  isSignUp: true;
  onSubmit: (data: SignUpEmailStepData) => Promise<void>;
}

// Props for signin flow
interface SignInEmailStepProps extends BaseEmailStepProps {
  isSignUp: false;
  onSubmit: (data: EmailStepData) => Promise<void>;
}

// Union type for all possible props
type EmailStepProps = SignUpEmailStepProps | SignInEmailStepProps;

const EmailStepComponent: React.FC<EmailStepProps> = (props) => {
  const { isSignUp } = props;

  if (isSignUp) {
    return <SignUpEmailStep {...props} />;
  } else {
    return <SignInEmailStep {...props} />;
  }
};

export const EmailStep = memo(EmailStepComponent);

// SignIn Email Step Component
const SignInEmailStep: React.FC<SignInEmailStepProps> = ({ onSubmit, isLoading, error }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<EmailStepData>({
    resolver: zodResolver(emailStepSchema),
    defaultValues: { email: '' },
  });

  const onSubmitForm = async (data: EmailStepData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Email step error:', error);
      setError('root', {
        type: 'manual',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div className="text-center">
        <Image 
          src={logoImage} 
          alt="Logo" 
          className="h-14 mx-auto mb-2"
          showError={true}
        />
        <p className="text-gray-600">
          Please enter your email address to sign in.
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          type="email"
          label="Email address"
          placeholder="Enter your email"
          required
          autoComplete="email"
          autoFocus
          error={errors.email?.message || error}
          {...register('email')}
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
          {isLoading ? 'Sending code...' : 'Continue'}
        </Button>
      </div>

      <div className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
          Sign up
        </Link>
      </div>
    </form>
  );
};

// SignUp Email Step Component
const SignUpEmailStep: React.FC<SignUpEmailStepProps> = ({ onSubmit, isLoading, error }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignUpEmailStepData>({
    resolver: zodResolver(signUpEmailStepSchema),
    defaultValues: { fullName: '', email: '' },
  });

  const onSubmitForm = async (data: SignUpEmailStepData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Email step error:', error);
      setError('root', {
        type: 'manual',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div className="text-center">
        <Image 
          src={logoImage} 
          alt="Logo" 
          className="h-14 mx-auto mb-2"
          showError={true}
        />
        <p className="text-gray-600">
          Please enter your information to sign up.
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          type="text"
          label="Full name"
          placeholder="Enter your full name"
          required
          autoComplete="name"
          autoFocus
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        
        <FormField
          type="email"
          label="Email address"
          placeholder="Enter your email"
          required
          autoComplete="email"
          error={errors.email?.message || error}
          {...register('email')}
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
          {isLoading ? 'Sending code...' : 'Continue'}
        </Button>
      </div>

      <div className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-500">
          Sign in
        </Link>
      </div>
    </form>
  );
};
