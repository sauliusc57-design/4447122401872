import FormField from '@/components/ui/form-field';
import { fireEvent, render } from '@testing-library/react-native';

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

    expect(getByText('Trip title')).toBeTruthy();
    expect(getByPlaceholderText('Enter trip title')).toBeTruthy();
    expect(getByLabelText('Trip title')).toBeTruthy();

    fireEvent.changeText(getByLabelText('Trip title'), 'Weekend in Paris');

    expect(onChangeTextMock).toHaveBeenCalledWith('Weekend in Paris');
  });
});