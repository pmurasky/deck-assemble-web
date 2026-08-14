import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsClient } from '@/components/profile/SettingsClient';
import * as profileApi from '@/lib/api/profile';

vi.mock('@/lib/api/profile');

describe('SettingsClient Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('loads profile and updates profile fields upon form submit', async () => {
    vi.mocked(profileApi.fetchProfile).mockResolvedValue({
      id: 1,
      displayName: 'Peter M',
      email: 'peter@example.com',
      preferredFormat: 'Commander',
      experienceLevel: 'COMPETITIVE',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    });

    vi.mocked(profileApi.saveProfile).mockResolvedValue({
      id: 1,
      displayName: 'Peter The Builder',
      email: 'peter@example.com',
      preferredFormat: 'Modern',
      experienceLevel: 'EXPERT',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-02T00:00:00Z',
    });

    render(<SettingsClient />);

    await waitFor(() => {
      expect(profileApi.fetchProfile).toHaveBeenCalled();
      expect(screen.getByDisplayValue('Peter M')).toBeInTheDocument();
      expect(screen.getByDisplayValue('peter@example.com')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Display Name/i);
    fireEvent.change(nameInput, { target: { value: 'Peter The Builder' } });

    const formatSelect = screen.getByLabelText(/Preferred Format/i);
    fireEvent.change(formatSelect, { target: { value: 'Modern' } });

    const submitBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(profileApi.saveProfile).toHaveBeenCalledWith(expect.objectContaining({
        displayName: 'Peter The Builder',
        preferredFormat: 'Modern',
      }));
      expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument();
    });
  });
});
