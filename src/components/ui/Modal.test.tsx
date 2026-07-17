import { useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

/**
 * Covers the accessibility fix from Phase 5 decision #12 (focus trap,
 * initial-focus, return-focus-on-close, aria-labelledby) - added in the
 * Certificate Preview step specifically so every later modal in the app
 * inherits it for free. These tests exercise the shared Modal component
 * directly rather than one of its call sites.
 */
function Harness({ initialOpen = false }: { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <div>
      <button ref={triggerRef} onClick={() => setOpen(true)}>
        Open modal
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Confirm action">
        <button>First</button>
        <button>Second</button>
      </Modal>
    </div>
  );
}

describe('Modal', () => {
  it('is not rendered when closed', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Hidden">
        <p>Body</p>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders with role=dialog and aria-labelledby pointing at the title', () => {
    render(
      <Modal open onClose={vi.fn()} title="Confirm action">
        <p>Body</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy!)).toHaveTextContent('Confirm action');
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Confirm action">
        <button>OK</button>
      </Modal>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the backdrop is clicked', async () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal open onClose={onClose} title="Confirm action">
        <button>OK</button>
      </Modal>,
    );
    const backdrop = container.querySelector('[aria-hidden="true"]');
    expect(backdrop).not.toBeNull();
    await userEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('moves focus into the dialog on open and returns it to the trigger on close', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Open modal' });
    trigger.focus();
    expect(trigger).toHaveFocus();

    await userEvent.click(trigger);
    // The header's own Close (X) button is first in DOM order, ahead of the
    // body content, so it's what receives initial focus.
    await waitFor(() => expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus());

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('wraps Tab focus from the last focusable element back to the first', async () => {
    render(
      <Modal open onClose={vi.fn()} title="Confirm action">
        <button>First</button>
        <button>Second</button>
      </Modal>,
    );
    const close = screen.getByRole('button', { name: 'Close' });
    const second = screen.getByRole('button', { name: 'Second' });

    // DOM order is [Close, First, Second] - Close is focused first, Second last.
    await waitFor(() => expect(close).toHaveFocus());
    second.focus();
    expect(second).toHaveFocus();

    await userEvent.tab();
    expect(close).toHaveFocus();
  });
});
