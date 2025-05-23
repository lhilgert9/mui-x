import { fireEvent, screen } from '@mui/internal-test-utils';
import { PickerNonNullableRangeValue, PickerRangeValue } from '@mui/x-date-pickers/internals';
import {
  createPickerRenderer,
  adapterToUse,
  expectFieldValueV7,
  describeValue,
  getFieldSectionsContainer,
  openPicker,
} from 'test/utils/pickers';
import { MobileDateTimeRangePicker } from '@mui/x-date-pickers-pro/MobileDateTimeRangePicker';
import { MultiInputDateTimeRangeField } from '@mui/x-date-pickers-pro/MultiInputDateTimeRangeField';

describe('<MobileDateTimeRangePicker /> - Describe Value Multi Input', () => {
  const { render } = createPickerRenderer();

  describeValue<PickerRangeValue, 'picker'>(MobileDateTimeRangePicker, () => ({
    render,
    componentFamily: 'picker',
    type: 'date-time-range',
    variant: 'mobile',
    initialFocus: 'start',
    fieldType: 'multi-input',
    defaultProps: {
      slots: { field: MultiInputDateTimeRangeField },
    },
    values: [
      // initial start and end dates
      [adapterToUse.date('2018-01-01T11:30:00'), adapterToUse.date('2018-01-04T11:45:00')],
      // start and end dates after `setNewValue`
      [adapterToUse.date('2018-01-02T12:35:00'), adapterToUse.date('2018-01-05T12:50:00')],
    ],
    emptyValue: [null, null],
    assertRenderedValue: (expectedValues: any[]) => {
      const hasMeridiem = adapterToUse.is12HourCycleInCurrentLocale();
      const expectedPlaceholder = hasMeridiem ? 'MM/DD/YYYY hh:mm aa' : 'MM/DD/YYYY hh:mm';

      const startSectionsContainer = getFieldSectionsContainer(0);
      const expectedStartValueStr = expectedValues[0]
        ? adapterToUse.format(
            expectedValues[0],
            hasMeridiem ? 'keyboardDateTime12h' : 'keyboardDateTime24h',
          )
        : expectedPlaceholder;
      expectFieldValueV7(startSectionsContainer, expectedStartValueStr);

      const endSectionsContainer = getFieldSectionsContainer(1);
      const expectedEndValueStr = expectedValues[1]
        ? adapterToUse.format(
            expectedValues[1],
            hasMeridiem ? 'keyboardDateTime12h' : 'keyboardDateTime24h',
          )
        : expectedPlaceholder;
      expectFieldValueV7(endSectionsContainer, expectedEndValueStr);
    },
    setNewValue: (value, { isOpened, applySameValue, setEndDate = false }) => {
      if (!isOpened) {
        openPicker({
          type: 'date-time-range',
          initialFocus: setEndDate ? 'end' : 'start',
          fieldType: 'multi-input',
        });
      }
      let newValue: PickerNonNullableRangeValue;
      if (applySameValue) {
        newValue = value;
      } else if (setEndDate) {
        newValue = [
          value[0],
          adapterToUse.addMinutes(adapterToUse.addHours(adapterToUse.addDays(value[1], 1), 1), 5),
        ];
      } else {
        newValue = [
          adapterToUse.addMinutes(adapterToUse.addHours(adapterToUse.addDays(value[0], 1), 1), 5),
          value[1],
        ];
      }

      // Go to the start date or the end date
      fireEvent.click(
        screen.getByRole('button', {
          name: adapterToUse.format(value[setEndDate ? 1 : 0], 'shortDate'),
        }),
      );

      fireEvent.click(
        screen.getByRole('gridcell', {
          name: adapterToUse.getDate(newValue[setEndDate ? 1 : 0]).toString(),
        }),
      );

      fireEvent.click(screen.getByRole('button', { name: 'Next' }));

      const hasMeridiem = adapterToUse.is12HourCycleInCurrentLocale();
      const hours = adapterToUse.format(
        newValue[setEndDate ? 1 : 0],
        hasMeridiem ? 'hours12h' : 'hours24h',
      );
      const hoursNumber = adapterToUse.getHours(newValue[setEndDate ? 1 : 0]);
      fireEvent.click(screen.getByRole('option', { name: `${parseInt(hours, 10)} hours` }));
      fireEvent.click(
        screen.getByRole('option', {
          name: `${adapterToUse.getMinutes(newValue[setEndDate ? 1 : 0])} minutes`,
        }),
      );
      if (hasMeridiem) {
        fireEvent.click(screen.getByRole('option', { name: hoursNumber >= 12 ? 'PM' : 'AM' }));
      }
      // Close the picker
      if (!isOpened) {
        // eslint-disable-next-line material-ui/disallow-active-element-as-key-event-target
        fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
      } else {
        // return to the start date view in case we'd like to repeat the selection process
        fireEvent.click(
          screen.getByRole('button', { name: adapterToUse.format(newValue[0], 'shortDate') }),
        );
      }

      return newValue;
    },
  }));
});
