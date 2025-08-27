import React, { memo, useState, useCallback } from 'react';
import { Mail, Check, X, Bell } from 'lucide-react';
import { Modal, Button, Input } from '@/components';
import { useInviteMember } from '../hooks/useBoardMembers';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

const InviteMemberModalComponent: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  boardId,
}) => {
  const [email, setEmail] = useState('');

  const inviteMemberMutation = useInviteMember();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;

    try {
      await inviteMemberMutation.mutateAsync({
        boardId,
        email: email.trim(),
        role: 'member', // Default role
      });

      // Clear form
      setEmail('');
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  }, [boardId, email, inviteMemberMutation]);

  const handleClose = useCallback(() => {
    setEmail('');
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite Member"
      size="md"
    >
      <div className="space-y-6">
        {/* Invite by Email */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            Invite by Email
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={inviteMemberMutation.isPending}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={!email.trim() || inviteMemberMutation.isPending}
              className="w-full"
            >
              {inviteMemberMutation.isPending ? 'Sending Invitation...' : 'Send Invitation'}
            </Button>
          </form>
        </div>

        {/* Info about notifications */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start space-x-2">
            <Bell className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">In-App Notifications</p>
              <p className="text-xs text-blue-700 mt-1">
                The invited user will receive a notification in their app. They can accept or decline the invitation directly from their notification panel.
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {inviteMemberMutation.isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-sm text-green-800">
                Invitation sent successfully! The recipient will receive a notification.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {inviteMemberMutation.isError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <X className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-sm text-red-800">
                {inviteMemberMutation.error?.message || 'Failed to send invitation. Please try again.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export const InviteMemberModal = memo(InviteMemberModalComponent);
