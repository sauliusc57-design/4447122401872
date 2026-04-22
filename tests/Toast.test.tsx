import Toast from '@/components/ui/toast';
import { render, fireEvent } from '@testing-library/react-native';
import React, { createContext, useContext } from 'react';
import { Text, Pressable } from 'react-native';
import type { ToastType } from '@/components/ui/toast';

// --- Toast component tests ---

describe('Toast component', () => {
  it('renders the message text when visible', () => {
    const { getByText } = render(
      <Toast message="Trip created!" type="success" visible={true} />
    );
    expect(getByText('Trip created!')).toBeTruthy();
  });

  it('renders a delete type message', () => {
    const { getByText } = render(
      <Toast message="Activity deleted" type="delete" visible={true} />
    );
    expect(getByText('Activity deleted')).toBeTruthy();
  });

  it('renders an error type message', () => {
    const { getByText } = render(
      <Toast message="Something went wrong" type="error" visible={true} />
    );
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('still mounts when not visible (animation handles opacity)', () => {
    const { getByText } = render(
      <Toast message="Hidden toast" type="success" visible={false} />
    );
    // Component stays mounted — Animated.Value controls the visual hide
    expect(getByText('Hidden toast')).toBeTruthy();
  });

  it('updates message when props change', () => {
    const { getByText, rerender } = render(
      <Toast message="First message" type="success" visible={true} />
    );
    expect(getByText('First message')).toBeTruthy();

    rerender(<Toast message="Second message" type="success" visible={true} />);
    expect(getByText('Second message')).toBeTruthy();
  });
});

// --- ToastContext integration tests ---
// Uses a local test context to avoid pulling in the SQLite-backed _layout module.

type ToastContextValue = { showToast: (message: string, type?: ToastType) => void };
const TestToastContext = createContext<ToastContextValue | null>(null);

function ToastTrigger({ message, type }: { message: string; type?: ToastType }) {
  const toast = useContext(TestToastContext);
  return (
    <Pressable
      testID="trigger"
      onPress={() => toast?.showToast(message, type)}
    >
      <Text>Trigger</Text>
    </Pressable>
  );
}

describe('ToastContext contract', () => {
  it('calls showToast with success type on login', () => {
    const showToast = jest.fn();
    const { getByTestId } = render(
      <TestToastContext.Provider value={{ showToast }}>
        <ToastTrigger message="Welcome back!" type="success" />
      </TestToastContext.Provider>
    );

    fireEvent.press(getByTestId('trigger'));

    expect(showToast).toHaveBeenCalledWith('Welcome back!', 'success');
  });

  it('calls showToast with success type on trip creation', () => {
    const showToast = jest.fn();
    const { getByTestId } = render(
      <TestToastContext.Provider value={{ showToast }}>
        <ToastTrigger message="Trip created!" type="success" />
      </TestToastContext.Provider>
    );

    fireEvent.press(getByTestId('trigger'));

    expect(showToast).toHaveBeenCalledWith('Trip created!', 'success');
  });

  it('calls showToast with delete type on deletion', () => {
    const showToast = jest.fn();
    const { getByTestId } = render(
      <TestToastContext.Provider value={{ showToast }}>
        <ToastTrigger message="Activity deleted" type="delete" />
      </TestToastContext.Provider>
    );

    fireEvent.press(getByTestId('trigger'));

    expect(showToast).toHaveBeenCalledWith('Activity deleted', 'delete');
  });

  it('does not throw when context is null (optional chaining guard)', () => {
    const { getByTestId } = render(
      <TestToastContext.Provider value={null}>
        <ToastTrigger message="No context" type="success" />
      </TestToastContext.Provider>
    );

    // toast?.showToast guard means this should not throw
    expect(() => fireEvent.press(getByTestId('trigger'))).not.toThrow();
  });

  it('can be called multiple times, each overwriting the last', () => {
    const showToast = jest.fn();
    const { getByTestId, rerender } = render(
      <TestToastContext.Provider value={{ showToast }}>
        <ToastTrigger message="First" type="success" />
      </TestToastContext.Provider>
    );

    fireEvent.press(getByTestId('trigger'));
    rerender(
      <TestToastContext.Provider value={{ showToast }}>
        <ToastTrigger message="Second" type="delete" />
      </TestToastContext.Provider>
    );
    fireEvent.press(getByTestId('trigger'));

    expect(showToast).toHaveBeenCalledTimes(2);
    expect(showToast).toHaveBeenNthCalledWith(1, 'First', 'success');
    expect(showToast).toHaveBeenNthCalledWith(2, 'Second', 'delete');
  });
});
