class VariantPickerSync {
  constructor() {
    this.variantPickers = [];
    this.isUpdating = false;
    this.init();
  }

  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupSync());
    } else {
      this.setupSync();
    }
  }

  setupSync() {
    // Find all variant picker elements
    this.variantPickers = document.querySelectorAll('variant-picker');
    
    if (this.variantPickers.length < 2) {
      console.log('VariantPickerSync: Less than 2 variant pickers found, sync not needed');
      return;
    }

    console.log(`VariantPickerSync: Found ${this.variantPickers.length} variant pickers, setting up synchronization`);

    // Add event listeners to each variant picker
    this.variantPickers.forEach((picker, index) => {
      this.setupPickerListeners(picker, index);
    });
  }

  setupPickerListeners(picker, pickerIndex) {
    const form = picker.querySelector('.variant-picker__form');
    if (!form) return;

    // Listen for radio button changes (buttons and swatches)
    const radioInputs = form.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(input => {
      input.addEventListener('change', (event) => {
        if (!this.isUpdating) {
          this.syncVariantChange(event.target, pickerIndex);
        }
      });
    });

    // Listen for select dropdown changes
    const selectInputs = form.querySelectorAll('select');
    selectInputs.forEach(select => {
      select.addEventListener('change', (event) => {
        if (!this.isUpdating) {
          this.syncVariantChange(event.target, pickerIndex);
        }
      });
    });
  }

  syncVariantChange(changedInput, sourcePicker) {
    this.isUpdating = true;

    try {
      const optionName = this.getOptionName(changedInput);
      const optionValue = changedInput.value;

      console.log(`VariantPickerSync: Syncing ${optionName} = ${optionValue} from picker ${sourcePicker}`);

      // Update all other variant pickers
      this.variantPickers.forEach((picker, index) => {
        if (index !== sourcePicker) {
          this.updatePickerOption(picker, optionName, optionValue);
        }
      });

      // Trigger variant update events if needed
      this.triggerVariantUpdateEvents();

    } catch (error) {
      console.error('VariantPickerSync: Error syncing variants:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  getOptionName(input) {
    if (input.type === 'radio') {
      // Extract option name from radio input name attribute
      // Format: "OptionName-blockId-productId"
      const nameParts = input.name.split('-');
      return nameParts[0];
    } else if (input.tagName === 'SELECT') {
      // Extract option name from select name attribute
      // Format: "options[OptionName]"
      const match = input.name.match(/options\[(.+)\]/);
      return match ? match[1] : input.name;
    }
    return input.name;
  }

  updatePickerOption(picker, optionName, optionValue) {
    const form = picker.querySelector('.variant-picker__form');
    if (!form) return;

    // Update radio buttons
    const radioInput = form.querySelector(`input[type="radio"][name^="${optionName}-"][value="${optionValue}"]`);
    if (radioInput && !radioInput.checked) {
      radioInput.checked = true;
      this.updateSwatchValue(radioInput, optionValue);
    }

    // Update select dropdowns
    const selectInput = form.querySelector(`select[name="options[${optionName}]"]`);
    if (selectInput && selectInput.value !== optionValue) {
      selectInput.value = optionValue;
    }
  }

  updateSwatchValue(radioInput, optionValue) {
    // Update swatch value display if it exists
    const fieldset = radioInput.closest('fieldset');
    if (fieldset) {
      const swatchValue = fieldset.querySelector('.variant-option__swatch-value');
      if (swatchValue) {
        swatchValue.textContent = optionValue;
      }
    }
  }

  triggerVariantUpdateEvents() {
    // Trigger custom events to notify other scripts about variant changes
    this.variantPickers.forEach(picker => {
      const event = new CustomEvent('variantPickerSync:updated', {
        detail: { picker: picker },
        bubbles: true
      });
      picker.dispatchEvent(event);
    });
  }

  // Public method to manually sync all pickers to a specific variant
  syncToVariant(variantOptions) {
    this.isUpdating = true;

    try {
      Object.entries(variantOptions).forEach(([optionName, optionValue]) => {
        this.variantPickers.forEach(picker => {
          this.updatePickerOption(picker, optionName, optionValue);
        });
      });

      this.triggerVariantUpdateEvents();
    } catch (error) {
      console.error('VariantPickerSync: Error in manual sync:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  // Public method to refresh the sync setup (useful if pickers are added dynamically)
  refresh() {
    console.log('VariantPickerSync: Refreshing synchronization setup');
    this.setupSync();
  }
}

// Initialize the synchronization when the script loads
const variantPickerSync = new VariantPickerSync();