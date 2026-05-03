import React from 'react';
import { Select, SelectItem, Button } from '@carbon/react';
import './Steps.css';

const TRANSPORT_OPTIONS = [
  'Flight',
  'Train',
  'Bus',
  'Car',
  'Mixed (Multiple modes)'
];

const PURPOSE_OPTIONS = [
  'Tourism',
  'Business',
  'Education',
  'Medical',
  'Family Visit',
  'Conference/Event',
  'Other'
];

const Step03TheHow = ({ formData, updateFormData, onNext, onBack }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="wizard-step">
      <h2 className="step-title">Step 03: The "How"</h2>
      
      <div className="form-row">
        <div className="form-field full-width">
          <Select
            id="transport"
            labelText="Transport"
            value={formData.transport}
            onChange={(e) => updateFormData({ transport: e.target.value })}
            required
          >
            <SelectItem value="" text="Choose transport mode" />
            {TRANSPORT_OPTIONS.map(option => (
              <SelectItem key={option} value={option} text={option} />
            ))}
          </Select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-field full-width">
          <Select
            id="purpose"
            labelText="Purpose"
            value={formData.purpose}
            onChange={(e) => updateFormData({ purpose: e.target.value })}
            required
          >
            <SelectItem value="" text="Choose purpose" />
            {PURPOSE_OPTIONS.map(option => (
              <SelectItem key={option} value={option} text={option} />
            ))}
          </Select>
        </div>
      </div>

      <div className="button-group">
        <Button kind="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" kind="primary">
          Next: Personalize
        </Button>
      </div>
    </form>
  );
};

export default Step03TheHow;

// Made with Bob