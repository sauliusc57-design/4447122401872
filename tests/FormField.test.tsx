import FormField from '@/components/ui/form-field';
import { fireEvent, render } from '@testing-library/react-native';

// FormField tests verify label rendering, placeholder, and text change callback
describe('FormField', () => {
  it('renders label and placeholder and fires onChangeText', () => {
    const onChangeTextMock = jest.fn();

    const { getByText, getByPlaceholderText, getByLabelText } = render(
      <FormField
        label="Trip title"
        value=""
        placeholder="Enter trip title"
        onChangeText={onChangeTextMock}
      />
    );

    // Check the label and placeholder are visible
    expect(getByText('Trip title')).toBeTruthy();
    expect(getByPlaceholderText('Enter trip title')).toBeTruthy();
    expect(getByLabelText('Trip title')).toBeTruthy();

    // Simulate a user typing and verify the callback receives the new value
    fireEvent.changeText(getByLabelText('Trip title'), 'Weekend in Paris');

    expect(onChangeTextMock).toHaveBeenCalledWith('Weekend in Paris');
  });
});