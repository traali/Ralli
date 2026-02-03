import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JoinPage } from './JoinPage';
import { BrowserRouter } from 'react-router-dom';
import * as supabaseModule from '../lib/supabase';

// Mock Supabase
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockFilter = vi.fn();
const mockMaybeSingle = vi.fn();

const mockFrom = vi.fn(() => ({
    select: mockSelect.mockReturnThis(),
    eq: mockEq.mockReturnThis(),
    filter: mockFilter.mockReturnThis(),
    maybeSingle: mockMaybeSingle,
}));

vi.spyOn(supabaseModule, 'supabase', 'get').mockReturnValue({
    from: mockFrom,
} as any);

const renderWithRouter = (ui: React.ReactElement) => {
    return render(ui, { wrapper: BrowserRouter });
};

describe('JoinPage Critical Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('allows a user to join with a valid short code', async () => {
        // GIVEN: A race exists
        const mockRace = { id: '0000000a-1111-2222-3333-444444444444', status: 'open' };
        mockMaybeSingle.mockResolvedValue({ data: mockRace, error: null });

        renderWithRouter(<JoinPage />);

        // WHEN: User enters 8-char code and submits
        // We look for all textboxes (Race Code & Team Name)
        const inputs = screen.getAllByRole('textbox');
        const codeInput = inputs[0];
        const nameInput = inputs[1];

        fireEvent.change(codeInput, { target: { value: '0000000a' } });
        fireEvent.change(nameInput, { target: { value: 'Test Team' } }); // Also fill name to be safe

        // The button has "Enter Race" with an arrow icon
        const button = screen.getByRole('button', { name: /Enter Race/i });
        fireEvent.click(button);

        // THEN: We search for the race
        await waitFor(() => {
            expect(mockFrom).toHaveBeenCalledWith('races');
            expect(mockFilter).toHaveBeenCalledWith('id', 'gte', '0000000a-0000-0000-0000-000000000000');
        });
    });

    it('shows error when race is not found', async () => {
        // GIVEN: No race found
        mockMaybeSingle.mockResolvedValue({ data: null, error: null });

        renderWithRouter(<JoinPage />);

        // WHEN: User enters invalid code
        const inputs = screen.getAllByRole('textbox');
        const codeInput = inputs[0];
        const nameInput = inputs[1];

        fireEvent.change(codeInput, { target: { value: 'deadbeef' } });
        fireEvent.change(nameInput, { target: { value: 'Test Team' } });

        const button = screen.getByRole('button', { name: /Enter Race/i });
        fireEvent.click(button);

        // THEN: Error message appears
        await waitFor(() => {
            expect(screen.getByText(/Race not found/i)).toBeInTheDocument();
        });
    });
});
